import type { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = "",
  status = 200,
): void => {
  res.status(status).json({ success: true, message, data });
};

export const sendError = (
  res: Response,
  message: string,
  status = 500,
  errors?: unknown,
): void => {
  res.status(status).json({ success: false, message, errors });
};
