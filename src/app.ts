import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./modules/auth/atuh.router";
import issuesRouter from "./modules/issues/issues.router";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Bugify API is running" });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Bugify API running on port ${PORT}`);
});

export default app;
