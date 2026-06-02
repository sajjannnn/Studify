import express from "express";
import { generate, list, get, remove, chat, update, count } from "../controllers/summariesController.ts";
import { generateSummaryLimiter } from "../middleware/rateLimiter.ts";

const router = express.Router();

router.post("/summaries/generate", generateSummaryLimiter, generate);
router.get("/summaries/count", count);
router.get("/summaries/:docId", list);
router.get("/summaries/:docId/:summaryId", get);
router.delete("/summaries/:summaryId", remove);
router.patch("/summaries/:summaryId", update);
router.post("/summaries/:summaryId/chat", chat);

export default router;