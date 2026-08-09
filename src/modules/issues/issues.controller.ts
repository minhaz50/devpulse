import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
} from "./issues.service";
import { VALID_SORTS, VALID_STATUSES, VALID_TYPES } from "../utils/validate";
import { sendError, sendSuccess } from "../utils/response";

// GET /api/issues
export const listIssues = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { sort, type, status } = req.query as Record<string, string>;

    if (sort && !VALID_SORTS.includes(sort)) {
      sendError(
        res,
        "Validation failed",
        400,
        "sort must be one of: newest, oldest",
      );
      return;
    }

    if (type && !VALID_TYPES.includes(type)) {
      sendError(
        res,
        "Validation failed",
        400,
        "type must be one of: bug, feature_request",
      );
      return;
    }

    if (status && !VALID_STATUSES.includes(status)) {
      sendError(
        res,
        "Validation failed",
        400,
        "status must be one of: open, in_progress, resolved",
      );
      return;
    }

    const issues = await getAllIssues(sort, type, status);
    sendSuccess(res, issues);
  } catch (err) {
    console.error("listIssues error:", err);
    sendError(res, "Failed to fetch issues");
  }
};

// GET /api/issues/:id
export const getIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      sendError(res, "Invalid issue ID", 400);
      return;
    }

    const issue = await getIssueById(id);
    if (!issue) {
      sendError(res, "Issue not found", 404);
      return;
    }

    sendSuccess(res, issue);
  } catch (err) {
    console.error("getIssue error:", err);
    sendError(res, "Failed to fetch issue");
  }
};

// POST /api/issues
export const createNewIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, type } = req.body;

    // Required fields
    if (!title || !description || !type) {
      sendError(
        res,
        "Validation failed",
        400,
        "title, description, and type are required",
      );
      return;
    }

    // Title max 150 chars
    if (title.length > 150) {
      sendError(
        res,
        "Validation failed",
        400,
        "title must not exceed 150 characters",
      );
      return;
    }

    // Description min 20 chars
    if (description.length < 20) {
      sendError(
        res,
        "Validation failed",
        400,
        "description must be at least 20 characters",
      );
      return;
    }

    // Type validation
    if (!VALID_TYPES.includes(type)) {
      sendError(
        res,
        "Validation failed",
        400,
        "type must be one of: bug, feature_request",
      );
      return;
    }

    // reporter_id always comes from JWT, never from request body
    const reporter_id = req.user!.id;

    const issue = await createIssue({ title, description, type, reporter_id });
    sendSuccess(res, issue, "Issue created successfully", 201);
  } catch (err) {
    console.error("createIssue error:", err);
    sendError(res, "Failed to create issue");
  }
};

// PATCH /api/issues/:id
export const updateExistingIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      sendError(res, "Invalid issue ID", 400);
      return;
    }

    const issue = await getIssueById(id);
    if (!issue) {
      sendError(res, "Issue not found", 404);
      return;
    }

    const isMaintainer = req.user!.role === "maintainer";
    const isReporter = issue.reporter?.id === req.user!.id;
    const isOpen = issue.status === "open";

    // Maintainer → can update any issue
    // Contributor → can only update their OWN issue if status is still 'open'
    if (!isMaintainer && (!isReporter || !isOpen)) {
      sendError(
        res,
        !isReporter
          ? "You can only update your own issues"
          : "You can only update issues that are still open",
        403,
      );
      return;
    }

    const { title, description, type, status } = req.body;

    // Must provide at least one field
    if (!title && !description && !type && !status) {
      sendError(
        res,
        "Validation failed",
        400,
        "Provide at least one field to update: title, description, type, or status",
      );
      return;
    }

    // Title validation
    if (title !== undefined && title.length > 150) {
      sendError(
        res,
        "Validation failed",
        400,
        "title must not exceed 150 characters",
      );
      return;
    }

    // Description validation
    if (description !== undefined && description.length < 20) {
      sendError(
        res,
        "Validation failed",
        400,
        "description must be at least 20 characters",
      );
      return;
    }

    // Type validation
    if (type !== undefined && !VALID_TYPES.includes(type)) {
      sendError(
        res,
        "Validation failed",
        400,
        "type must be one of: bug, feature_request",
      );
      return;
    }

    // Status validation — maintainer only
    if (status !== undefined) {
      if (!isMaintainer) {
        sendError(res, "Only maintainers can change issue status", 403);
        return;
      }
      if (!VALID_STATUSES.includes(status)) {
        sendError(
          res,
          "Validation failed",
          400,
          "status must be one of: open, in_progress, resolved",
        );
        return;
      }
    }

    const updated = await updateIssue(id, { title, description, type, status });
    sendSuccess(res, updated, "Issue updated successfully");
  } catch (err) {
    console.error("updateIssue error:", err);
    sendError(res, "Failed to update issue");
  }
};

// DELETE /api/issues/:id
export const deleteExistingIssue = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      sendError(res, "Invalid issue ID", 400);
      return;
    }

    const issue = await getIssueById(id);
    if (!issue) {
      sendError(res, "Issue not found", 404);
      return;
    }

    await deleteIssue(id);
    sendSuccess(res, null, "Issue deleted successfully");
  } catch (err) {
    console.error("deleteIssue error:", err);
    sendError(res, "Failed to delete issue");
  }
};
