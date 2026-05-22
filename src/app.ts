import express, {
  type Application,
  type Request,
  type Response,
} from "express";
// import { authRoute } from "./modules/auth/auth.router";
import authRouter from "./modules/auth/auth.router";
import issuesRouter from "./modules/issues/issues.router";

const app: Application = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Assignment 2");
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
export default app;
