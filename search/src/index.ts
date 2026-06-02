import express from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "../lib/prisma.ts";
import searchRoutes from "./routes/searchRoutes.ts";

const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

app.use("/api", searchRoutes);

app.listen(PORT, async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("DB connection warmed up");
  } catch {
    console.warn("DB warmup failed — will retry on first request");
  }
  console.log(`Search Service running on port ${PORT}`);
});
