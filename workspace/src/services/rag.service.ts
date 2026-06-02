import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import z from "zod";
import "dotenv/config";
import { queryMultiVector, queryAllDocs } from "./retrieval.service.ts";

let _rewriteLlm: ChatGroq | null = null;
let _generateLlm: ChatGroq | null = null;
let _rewriteChain: any = null;
let _generateChain: any = null;

function getRewriteLlm() {
  if (!_rewriteLlm) {
    _rewriteLlm = new ChatGroq({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      maxRetries: 0,
      apiKey: process.env.GROQ_API_KEY!,
    });
  }
  return _rewriteLlm;
}

function getGenerateLlm() {
  if (!_generateLlm) {
    _generateLlm = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      maxRetries: 0,
      apiKey: process.env.GROQ_API_KEY!,
    });
  }
  return _generateLlm;
}

function getRewriteChain() {
  if (!_rewriteChain) {
    const QUERY_TRANSFORMATION_PROMPT = PromptTemplate.fromTemplate(`
You are an expert at query rewriting for semantic search and retrieval-augmented generation (RAG).

Rewrite the following question into 2 alternative versions that better express the same intent for semantic retrieval.
Return only the rewritten questions, no explanations.

Original question:
-------
{question}
-------
`);
    const structuredLlm = getRewriteLlm().withStructuredOutput(
      z.object({
        questions: z.array(z.string()).describe("rewritten questions for search"),
      }).describe("rewritten questions for search"),
    );
    _rewriteChain = QUERY_TRANSFORMATION_PROMPT.pipe(structuredLlm);
  }
  return _rewriteChain;
}

function getGenerateChain() {
  if (!_generateChain) {
    const GENERATE_RESPONSE_PROMPT = PromptTemplate.fromTemplate(`
You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question.
If you don't know the answer, just say that you don't know.
Question: {question}
Context: {context}
Answer:

`);
    _generateChain = GENERATE_RESPONSE_PROMPT.pipe(getGenerateLlm());
  }
  return _generateChain;
}

function formatDocumentsAsString(documents: any[]) {
  return documents.map((doc: any) => doc?.pageContent).join("\n\n");
}

async function getRewrittenQueries(query: string): Promise<string[]> {
  try {
    const result = await getRewriteChain().invoke({ question: query });
    const questions = result?.questions || [];
    const parsed = typeof questions === "string" ? JSON.parse(questions.replace(/'/g, '"')) : questions;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function answerQuery(props: { query: string; docIds?: string[]; extraContext?: string }) {
  const { query, docIds = [], extraContext } = props;

  const uniqueDocIds = [...new Set(docIds)];
  const retrievedDoc: any[] = [];
  const seen = new Set<string>();

  if (uniqueDocIds.length > 0) {
    const results = await Promise.all(
      uniqueDocIds.map((docId) => queryMultiVector({ docId, query })),
    );
    for (const result of results) {
      for (const doc of result?.retrievedDocs || []) {
        const key = doc.metadata?.chunkId || doc.pageContent;
        if (!seen.has(key)) {
          seen.add(key);
          retrievedDoc.push(doc);
        }
      }
    }
  } else {
    const [rewritten, initialResults] = await Promise.all([
      getRewrittenQueries(query),
      queryAllDocs(query).catch(() => []),
    ]);
    retrievedDoc.push(...initialResults);

    if (rewritten.length > 0) {
      const extraResults = await Promise.all(
        rewritten.map((q: string) => queryAllDocs(q).catch(() => [])),
      );
      for (const docs of extraResults) {
        for (const doc of docs) {
          const key = doc.metadata?.chunkId || doc.pageContent;
          if (!seen.has(key)) {
            seen.add(key);
            retrievedDoc.push(doc);
          }
        }
      }
    }
  }

  const context = extraContext
    ? extraContext + "\n\n" + formatDocumentsAsString(retrievedDoc)
    : formatDocumentsAsString(retrievedDoc);

  if (!context.trim()) {
    return { answer: "I don't know.", sources: [] };
  }

  try {
    const aiResponse = await getGenerateChain().invoke({
      question: query,
      context,
    });

    return {
      answer: aiResponse.content,
      sources: retrievedDoc,
    };
  } catch {
    return {
      answer: "I found relevant material but couldn't generate a full answer due to API rate limits. Please try again in a minute.",
      sources: retrievedDoc,
    };
  }
}
