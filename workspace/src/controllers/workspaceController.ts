import { answerQuery } from "../services/rag.service.ts";

export const query = async (req: any, res: any) => {
  try {
    const { query, docIds } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const result = await answerQuery({ query, docIds: docIds || [] });
    res.json(result);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
};
