import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { ContextualCompressionRetriever } from "@langchain/classic/retrievers/contextual_compression";
import { LLMChainExtractor } from "@langchain/classic/retrievers/document_compressors/chain_extract";
import { ChatGroq } from "@langchain/groq";
import "dotenv/config";

const cohereApiKey = process.env.COHERE_API_KEY!;
const pineconeApiKey = process.env.PINECONE_API_KEY!;
const pineconeIndexName = process.env.PINECONE_INDEX!;
const groqApiKey = process.env.GROQ_API_KEY!;

const embeddings = new CohereEmbeddings({
  model: "embed-english-v3.0",
  apiKey: cohereApiKey,
});

const pinecone = new PineconeClient({ apiKey: pineconeApiKey });
const pineconeIndex = pinecone.Index(pineconeIndexName);

let _vectorStore: PineconeStore | null = null;
let _compressor: ReturnType<typeof LLMChainExtractor.fromLLM> | null = null;

async function getVectorStore() {
  if (!_vectorStore) {
    _vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });
  }
  return _vectorStore;
}

function getCompressor() {
  if (!_compressor) {
    _compressor = LLMChainExtractor.fromLLM(
      new ChatGroq({
        model: "llama-3.1-8b-instant",
        temperature: 0,
        maxRetries: 0,
        apiKey: groqApiKey,
      }),
    );
  }
  return _compressor;
}

export async function queryMultiVector(props: { docId: string; query: string }) {
  const { docId, query } = props;
  const kParents = 5;

  const vectorStore = await getVectorStore();

  const childDocs = await vectorStore.similaritySearch(query, 5, {
    docType: "child",
    docId: docId,
  });

  const parentChunkIds = [...new Set(childDocs.map((c) => c.metadata.parentId))];
  const filteredChunkIds = parentChunkIds.filter((item) => item !== undefined && item !== null);

  if (filteredChunkIds.length === 0) {
    return { retrievedDocs: [] };
  }

  const retriever = new ContextualCompressionRetriever({
    baseCompressor: getCompressor(),
    baseRetriever: vectorStore.asRetriever({
      k: kParents,
      filter: {
        docType: "parent",
        source: { $in: filteredChunkIds },
      },
    }),
  });

  const retrievedDocs = await retriever.invoke(query);

  return { retrievedDocs };
}

export async function queryAllDocs(query: string) {
  const vectorStore = await getVectorStore();
  const result = await vectorStore.similaritySearch(query, 5);
  return result;
}
