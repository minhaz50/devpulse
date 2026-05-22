import { Router } from "express";
import { authenticate, requireMaintainer } from "../../middleware/auth";
import {
  listIssues,
  getIssue,
  createNewIssue,
  updateExistingIssue,
  deleteExistingIssue,
} from "./issues.controller";

const router = Router();

// GET /api/issues — Public
router.get("/", listIssues);

// GET /api/issues/:id — Public
router.get("/:id", getIssue);

// POST /api/issues — Authenticated (contributor or maintainer)
router.post("/", authenticate, createNewIssue);

// PATCH /api/issues/:id — Authenticated (maintainer OR contributor who owns the open issue)
router.patch("/:id", authenticate, updateExistingIssue);

// DELETE /api/issues/:id — Maintainer only
router.delete("/:id", authenticate, requireMaintainer, deleteExistingIssue);

export default router;
