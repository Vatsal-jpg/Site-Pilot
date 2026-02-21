import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRouter from "./routes/ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ai-wrapper" });
});

// AI routes
app.use("/api", aiRouter);

app.listen(PORT, () => {
  console.log(`[AI Wrapper] Server running on port ${PORT}`);
});

export default app;
