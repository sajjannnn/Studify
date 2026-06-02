import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import { pdfTextExtractor } from "./pdfTextExtractor.ts";

function createS3Client(region: string) {
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

async function downloadPdfFromS3(s3Key: string, bucketName: string, region: string): Promise<Uint8Array> {
  const s3 = createS3Client(region);
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });
  const response = await s3.send(command);
  const byteArray = await response.Body!.transformToByteArray();
  return byteArray;
}

async function createParentDocs(rawDocs: Document[], docId: string) {
  const parentSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  const parentSplits = await parentSplitter.splitDocuments(rawDocs);

  return parentSplits.map((split) => {
    const chunkId = uuidv4();
    split.metadata.docType = "parent";
    split.metadata.chunkId = chunkId;
    split.metadata.parentId = chunkId;
    split.metadata.source = chunkId;
    split.metadata.docId = docId;
    return split;
  });
}

async function createChildDocs(parentDocs: Document[], docId: string) {
  const childSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 400, chunkOverlap: 50 });
  const childSplits = await childSplitter.splitDocuments(parentDocs);

  return childSplits.map((split, i) => {
    const parentIndex = Math.floor(i / 4);
    const parentMetadata = parentDocs[parentIndex]?.metadata;

    split.metadata.docType = "child";
    split.metadata.parentId = parentMetadata?.chunkId;
    split.metadata.chunkId = `child-${parentMetadata?.chunkId}-${i}`;
    split.metadata.source = split.metadata.chunkId;
    split.metadata.docId = docId;
    return split;
  });
}

export async function embedDocument(props: {
  s3Key: string;
  docId: string;
  bucketName: string;
  bucketRegion: string;
}) {
  const { s3Key, docId, bucketName, bucketRegion } = props;

  console.log(`📥 Downloading PDF from S3: ${s3Key}`);
  const pdfBuffer = await downloadPdfFromS3(s3Key, bucketName, bucketRegion);

  console.log("📄 Extracting text from PDF...");
  const docs = await pdfTextExtractor(pdfBuffer, s3Key);
  if (!docs || docs.length === 0) {
    throw new Error("No documents extracted from the PDF");
  }

  console.log("✂️ Creating parent chunks...");
  const parentDocs = await createParentDocs(docs, docId);

  console.log("✂️ Creating child chunks...");
  const childDocs = await createChildDocs(parentDocs, docId);

  const cohereApiKey = process.env.COHERE_API_KEY;
  if (!cohereApiKey) throw new Error("Missing COHERE_API_KEY");

  const pineconeApiKey = process.env.PINECONE_API_KEY;
  if (!pineconeApiKey) throw new Error("Missing PINECONE_API_KEY");

  const pineconeIndexName = process.env.PINECONE_INDEX;
  if (!pineconeIndexName) throw new Error("Missing PINECONE_INDEX");

  const embeddings = new CohereEmbeddings({
    model: "embed-english-v3.0",
    apiKey: cohereApiKey,
  });

  const pinecone = new PineconeClient({ apiKey: pineconeApiKey });
  const pineconeIndex = pinecone.Index(pineconeIndexName);

  const vectorStore = new PineconeStore(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  console.log("💾 Storing embeddings in Pinecone...");
  const allDocs = [...parentDocs, ...childDocs];
  await vectorStore.addDocuments(allDocs);

  console.log(`✅ Stored ${parentDocs.length} parent + ${childDocs.length} child chunks (${allDocs.length} total)`);
  return { pages: docs.length, parents: parentDocs.length, children: childDocs.length, total: allDocs.length };
}
