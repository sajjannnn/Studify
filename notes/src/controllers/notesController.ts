import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import PDFDocument from "pdfkit";
import crypto from "crypto";
import { prisma } from "../../lib/prisma.ts";

const randomBytes = crypto.randomBytes(32).toString("hex");

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const embeddingQueue = new Queue("embedding-queue", { connection: redisConnection });

const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:3000";
const internalApiKey = process.env.INTERNAL_API_KEY;

async function syncDocIdToAuth(userId: string, docId: string) {
  try {
    await fetch(`${authServiceUrl}/api/auth/user/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": internalApiKey || "",
      },
      body: JSON.stringify({ userId, docId }),
    });
  } catch (error) {
    console.error("Failed to sync docId to Auth service:", error);
  }
}

export const getPosts = async (req: any, res: any) => {
  try {
    const posts = await prisma.document.findMany();

    for (const post of posts) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: post.docId,
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
      post.pdfUrl = url;
    }

    res.send(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

export const uploadPost = async (req: any, res: any) => {
  try {
    const userId = req.headers["x-user-id"] || req.body.userId || "";
    const { title, tags: rawTags, university, course, semester } = req.body;
    const tags = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : [];
    console.log("req.body", req.body, "Uploading file to S3...", "req.file", req.file);

    const docId = randomBytes + "-" + req.file.originalname;

    const params = {
      Bucket: bucketName,
      Key: docId,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const post = await prisma.document.create({
      data: {
        docId,
        title: title || req.file.originalname,
        tags,
        userId,
        university: university || null,
        course: course || null,
        semester: semester || null,
        type: "UPLOADED",
        embeddingStatus: "PENDING",
      },
    });

    await embeddingQueue.add("embed-doc", {
      s3Key: docId,
      docId,
      bucketName,
      bucketRegion,
      dbRecordId: post.id,
    });

    await syncDocIdToAuth(userId, docId);

    console.log("Document created:", post);
    res.send(post);
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
};

export const deletePost = async (req: any, res: any) => {
  try {
    const postId = req.params.id;
    const post = await prisma.document.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).send({ error: "Document not found" });
    }

    await prisma.document.delete({ where: { id: postId } });

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: post.docId,
    });
    await s3Client.send(command);

    res.send(post);
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
};

export const generatePostFromText = async (req: any, res: any) => {
  try {
    const userId = req.headers["x-user-id"] || req.body.userId || "";
    const { text, title, tags: rawTags, university, course, semester } = req.body;
    const tags = Array.isArray(rawTags) ? rawTags : rawTags ? [rawTags] : [];
    if (!text) {
      return res.status(400).json({ error: "Text content is required" });
    }

    const docId = randomBytes + "-generated.pdf";

    const buffers: Buffer[] = [];
    const pdfDoc = new PDFDocument();
    pdfDoc.on("data", (chunk: Buffer) => buffers.push(chunk));
    pdfDoc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const params = {
        Bucket: bucketName,
        Key: docId,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      };

      const putCommand = new PutObjectCommand(params);
      await s3Client.send(putCommand);

      const post = await prisma.document.create({
        data: {
          docId,
          title: title || "AI generated answer",
          tags,
          userId,
          university: university || null,
          course: course || null,
          semester: semester || null,
          type: "GENERATED",
          embeddingStatus: "COMPLETED",
        },
      });

      await syncDocIdToAuth(userId, docId);

      console.log("Generated document created:", post);
      res.send(post);
    });

    pdfDoc.fontSize(12).text(text, 50, 50);
    pdfDoc.end();
  } catch (error) {
    console.error("Error generating document:", error);
    res.status(500).json({ error: "Failed to generate document" });
  }
};

export const getPost = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const post = await prisma.document.findUnique({ where: { id } });

    if (!post) {
      return res.status(404).json({ error: "Document not found" });
    }

    const getObjectParams = {
      Bucket: bucketName,
      Key: post.docId,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    post.pdfUrl = url;

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
};

export const updatePost = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, tags, university, course, semester } = req.body;

    const post = await prisma.document.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Document not found" });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        tags: tags !== undefined ? (Array.isArray(tags) ? tags : [tags]) : undefined,
        university: university !== undefined ? university : undefined,
        course: course !== undefined ? course : undefined,
        semester: semester !== undefined ? semester : undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ error: "Failed to update document" });
  }
};

export const updateEmbeddingStatus = async (req: any, res: any) => {
  try {
    const apiKey = req.headers["x-internal-key"];
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.params;
    const { embeddingStatus } = req.body;
    if (!embeddingStatus) {
      return res.status(400).json({ error: "embeddingStatus is required" });
    }

    const post = await prisma.document.update({
      where: { id },
      data: { embeddingStatus },
    });

    res.json(post);
  } catch (error) {
    console.error("Error updating embedding status:", error);
    res.status(500).json({ error: "Failed to update embedding status" });
  }
};
