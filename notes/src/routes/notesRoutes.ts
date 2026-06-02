import express from "express";
import multer from "multer";
import { getPosts, getPost, uploadPost, deletePost, generatePostFromText, updatePost, updateEmbeddingStatus } from "../controllers/notesController.ts";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/posts", getPosts);
router.get("/posts/:id", getPost);
router.post("/posts", upload.single("pdf"), uploadPost);
router.delete("/posts/:id", deletePost);
router.post("/posts/generate", generatePostFromText);
router.patch("/posts/:id", updatePost);
router.patch("/posts/:id/status", updateEmbeddingStatus);

export default router;
