import { GoogleGenerativeAI } from "@google/generative-ai";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.S3_BUCKET_NAME!;

async function downloadPdf(docId: string): Promise<Buffer> {
  const command = new GetObjectCommand({ Bucket: bucketName, Key: docId });
  const response = await s3.send(command);
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function generateSummary(docId: string, prompt: string) {
  const apiKey = process.env.GOOGLE_API_KEY!;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const pdfBuffer = await downloadPdf(docId);
  const base64Data = pdfBuffer.toString("base64");

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Data,
      },
    },
    { text: `You are a study assistant. Summarize this PDF according to the following request: "${prompt}"` },
  ]);

  const content = result.response.text();
  return content;
}