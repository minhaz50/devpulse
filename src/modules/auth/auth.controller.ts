import type { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service";
import { sendError, sendSuccess } from "../utils/response";

const ROLES = ["contributor", "maintainer"];

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      sendError(
        res,
        "Validation failed",
        400,
        "name, email, and password are required",
      );
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      sendError(res, "Validation failed", 400, "Invalid email format");
      return;
    }

    // Validate password length
    if (password.length < 5) {
      sendError(
        res,
        "Validation failed",
        400,
        "Password must be at least 5 characters",
      );
      return;
    }

    const assignedRole = role || "contributor";
    if (!ROLES.includes(assignedRole)) {
      sendError(
        res,
        "Validation failed",
        400,
        `role must be one of: ${Object.values(ROLES).join(", ")}`,
      );
      return;
    }

    const user = await registerUser(name, email, password, assignedRole);

    sendSuccess(res, user, "User registered successfully", 201);
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Registration failed";
    const statusCode = message === "Email already in use" ? 409 : 500;
    sendError(res, message, statusCode);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(
        res,
        "Validation failed",
        400,
        "email and password are required",
      );
      return;
    }

    const { token, user } = await loginUser(email, password);

    sendSuccess(res, { token, user }, "Login successful");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    const statusCode = message === "Invalid email or password" ? 401 : 500;
    sendError(res, message, statusCode);
  }
};
