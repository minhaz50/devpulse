import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
} from "./issues.service";

const VALID_TYPES = ["bug", "feature_request"];
const VALID_STATUSES = ["open", "in_progress", "resolved"];
const VALID_SORTS = ["newest", "oldest"];

// GET /api/issues
export const listIssues = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sort, type, status } = req.query as Record<string, string>;

    // Validate query params
    if (sort && !VALID_SORTS.includes(sort)) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: `sort must be one of: ${VALID_SORTS.join(", ")}`,
      });
      return;
    }

    if (type && !VALID_TYPES.includes(type)) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: `type must be one of: ${VALID_TYPES.join(", ")}`,
      });
      return;
    }

    if (status && !VALID_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }

    const issues = await getAllIssues(sort, type, status);

    res.status(200).json({
      success: true,
      data: issues,
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch issues" });
  }
};

// GET /api/issues/:id
export const getIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam || Array.isArray(idParam)) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }
    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }

    const issue = await getIssueById(id);
    if (!issue) {
      res.status(404).json({ success: false, message: "Issue not found" });
      return;
    }

    res.status(200).json({ success: true, data: issue });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch issue" });
  }
};

// POST /api/issues
export const createNewIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, type } = req.body;

    // Required field validation
    if (!title || !description || !type) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: "title, description, and type are required",
      });
      return;
    }

    // Title max length
    if (title.length > 150) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: "title must not exceed 150 characters",
      });
      return;
    }

    // Description min length
    if (description.length < 20) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: "description must be at least 20 characters",
      });
      return;
    }

    // Type validation
    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: `type must be one of: ${VALID_TYPES.join(", ")}`,
      });
      return;
    }

    // reporter_id comes from JWT, never from the request body
    const reporter_id = req.user!.id;

    const issue = await createIssue({ title, description, type, reporter_id });

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to create issue" });
  }
};

// PATCH /api/issues/:id
export const updateExistingIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam || Array.isArray(idParam)) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }
    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }

    const issue = await getIssueById(id);
    if (!issue) {
      res.status(404).json({ success: false, message: "Issue not found" });
      return;
    }

    const isMaintainer = req.user!.role === "maintainer";
    const isReporter = issue.reporter?.id === req.user!.id;
    const isOpen = issue.status === "open";

    // Permission check:
    // Maintainer  → can update any issue
    // Contributor → can only update their OWN issue if status is still 'open'
    if (!isMaintainer && (!isReporter || !isOpen)) {
      res.status(403).json({
        success: false,
        message: isMaintainer
          ? "Forbidden"
          : !isReporter
            ? "You can only update your own issues"
            : "You can only update issues that are still open",
      });
      return;
    }

    const { title, description, type } = req.body;

    // Must provide at least one field
    if (!title && !description && !type) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          "Provide at least one field to update: title, description, or type",
      });
      return;
    }

    // Validate provided fields
    if (title !== undefined && title.length > 150) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: "title must not exceed 150 characters",
      });
      return;
    }

    if (description !== undefined && description.length < 20) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: "description must be at least 20 characters",
      });
      return;
    }

    if (type !== undefined && !VALID_TYPES.includes(type)) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: `type must be one of: ${VALID_TYPES.join(", ")}`,
      });
      return;
    }

    const updated = await updateIssue(id, { title, description, type });

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: updated,
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update issue" });
  }
};

// DELETE /api/issues/:id
export const deleteExistingIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const idParam = req.params.id;
    if (!idParam || Array.isArray(idParam)) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }
    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid issue ID" });
      return;
    }

    const issue = await getIssueById(id);
    if (!issue) {
      res.status(404).json({ success: false, message: "Issue not found" });
      return;
    }

    await deleteIssue(id);

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete issue" });
  }
};
