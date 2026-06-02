import { Worker } from "bullmq";
import IORedis from "ioredis";
import "dotenv/config";
import { embedDocument } from "./embedding-pipeline.ts";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

const notesUrl = process.env.NOTES_SERVICE_URL || "http://notesservice:4003";
const internalApiKey = process.env.INTERNAL_API_KEY;

async function updateStatus(dbRecordId: string, status: string) {
  try {
    await fetch(`${notesUrl}/api/posts/${dbRecordId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": internalApiKey || "",
      },
      body: JSON.stringify({ embeddingStatus: status }),
    });
  } catch (error) {
    console.error("Failed to update embedding status:", error);
  }
}

const worker = new Worker(
  "embedding-queue",
  async (job) => {
    const { s3Key, docId, bucketName, bucketRegion, dbRecordId } = job.data;
    console.log(`🔄 Processing job ${job.id}: ${s3Key} for doc ${docId}`);
    try {
      const result = await embedDocument({ s3Key, docId, bucketName, bucketRegion });
      console.log(`✅ Job ${job.id} complete:`, result);
      if (dbRecordId) {
        await updateStatus(dbRecordId, "COMPLETED");
      }
    } catch (error) {
      if (dbRecordId) {
        await updateStatus(dbRecordId, "FAILED");
      }
      throw error;
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

worker.on("ready", () => {
  console.log("🚀 Worker connected to Redis, waiting for jobs...");
});

console.log("📡 Worker starting up...");
