import express from "express";
import { feed, search } from "../controllers/searchController.ts";

const router = express.Router();

router.get("/feed", feed);
router.get("/search", search);

export default router;
