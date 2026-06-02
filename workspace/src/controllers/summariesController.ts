import { prisma } from "../../lib/prisma.ts";
import { generateSummary } from "../services/summary.service.ts";
import { answerQuery } from "../services/rag.service.ts";

export const generate = async (req: any, res: any) => {
  try {
    const { docId, prompt } = req.body;
    if (!docId || !prompt) {
      return res.status(400).json({ error: "docId and prompt are required" });
    }

    const content = await generateSummary(docId, prompt);

    const summary = await prisma.summary.create({
      data: {
        documentId: docId,
        userId: req.user?.id || "unknown",
        userName: req.user?.name || "Unknown",
        prompt,
        content,
      },
    });

    res.json(summary);
  } catch (error: any) {
    console.error("Generate summary error:", error);
    res.status(500).json({ error: error.message || "Failed to generate summary" });
  }
};

export const list = async (req: any, res: any) => {
  try {
    const { docId } = req.params;
    const summaries = await prisma.summary.findMany({
      where: { documentId: docId },
      orderBy: { createdAt: "desc" },
    });
    res.json(summaries);
  } catch (error) {
    console.error("List summaries error:", error);
    res.status(500).json({ error: "Failed to fetch summaries" });
  }
};

export const get = async (req: any, res: any) => {
  try {
    const { summaryId } = req.params;
    const summary = await prisma.summary.findUnique({
      where: { id: summaryId },
    });
    if (!summary) return res.status(404).json({ error: "Summary not found" });

    await prisma.summary.update({
      where: { id: summaryId },
      data: { viewCount: { increment: 1 } },
    });

    res.json(summary);
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};

export const remove = async (req: any, res: any) => {
  try {
    const { summaryId } = req.params;
    const summary = await prisma.summary.findUnique({
      where: { id: summaryId },
    });
    if (!summary) return res.status(404).json({ error: "Summary not found" });

    if (summary.userId !== req.user?.id) {
      return res.status(403).json({ error: "Not authorized to delete this summary" });
    }

    await prisma.summary.delete({ where: { id: summaryId } });
    res.json({ message: "Summary deleted" });
  } catch (error) {
    console.error("Delete summary error:", error);
    res.status(500).json({ error: "Failed to delete summary" });
  }
};

export const update = async (req: any, res: any) => {
  try {
    const { summaryId } = req.params;
    const { prompt, content } = req.body;

    const summary = await prisma.summary.findUnique({
      where: { id: summaryId },
    });
    if (!summary) return res.status(404).json({ error: "Summary not found" });

    if (summary.userId !== req.user?.id) {
      return res.status(403).json({ error: "Not authorized to edit this summary" });
    }

    const updated = await prisma.summary.update({
      where: { id: summaryId },
      data: {
        ...(prompt !== undefined && { prompt }),
        ...(content !== undefined && { content }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Update summary error:", error);
    res.status(500).json({ error: "Failed to update summary" });
  }
};

export const chat = async (req: any, res: any) => {
  try {
    const { summaryId } = req.params;
    const { query, docIds } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const summary = await prisma.summary.findUnique({
      where: { id: summaryId },
    });
    if (!summary) return res.status(404).json({ error: "Summary not found" });

    const uniqueDocIds = [...new Set(docIds || [])];
    if (!uniqueDocIds.includes(summary.documentId)) {
      uniqueDocIds.push(summary.documentId);
    }

    const extraContext = `The following is a community-generated summary of this document (prompt: "${summary.prompt}"):\n${summary.content}`;

    const result = await answerQuery({
      query,
      docIds: uniqueDocIds,
      extraContext,
    });

    res.json({
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    console.error("Chat with summary error:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
};

export const count = async (req: any, res: any) => {
  try {
    const total = await prisma.summary.count();
    res.json({ count: total });
  } catch (error) {
    console.error("Count summaries error:", error);
    res.status(500).json({ error: "Failed to count summaries" });
  }
};