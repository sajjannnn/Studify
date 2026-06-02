import express from "express";
import { query } from "../controllers/workspaceController.ts";

const router = express.Router();

router.post("/query", query);

export default router;
