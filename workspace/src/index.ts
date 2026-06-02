import express from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "../lib/prisma.ts";
import workspaceRoutes from "./routes/workspaceRoutes.ts";
import summariesRoutes from "./routes/summariesRoutes.ts";

const app = express();
const PORT = 4002;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use((req: any, _res, next) => {
  req.user = {
    id: req.headers["x-user-id"] || "unknown",
    name: req.headers["x-user-name"] || "Unknown",
  };
  next();
});

app.use("/api/workspace", workspaceRoutes);
app.use("/api/workspace", summariesRoutes);

app.listen(PORT, async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("DB connection warmed up");
  } catch {
    console.warn("DB warmup failed");
  }
  console.log(`Workspace API server running on port ${PORT}`);
});