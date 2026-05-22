import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import authRouter from "./modules/auth/atuh.router";
import issuesRouter from "./modules/issues/issues.router";
const app: Application = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Assignment 2");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);

// handler for 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
