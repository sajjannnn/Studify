import express from "express";
import dotenv from "dotenv";
import notesRoutes from "./routes/notesRoutes.ts";

dotenv.config();

const app = express();
const PORT = 4003;

app.use(express.json());

app.use("/api", notesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
