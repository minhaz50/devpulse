import type { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service";

const ROLES = ["contributor", "maintainer"];

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: "name, email, and password are required",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: "Invalid email format",
      });
      return;
    }

    // Validate password length
    if (password.length < 5) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: "Password must be at least 5 characters",
      });
      return;
    }

    const assignedRole = role || "contributor";
    if (!ROLES.includes(assignedRole)) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: `role must be one of: ${ROLES.join(", ")}`,
      });
      return;
    }

    const user = await registerUser(name, email, password, assignedRole);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err: any) {
    const message = err instanceof Error ? err.message : "Registration failed";
    const statusCode = message === "Email already in use" ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: "email and password are required",
      });
      return;
    }

    const { token, user } = await loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, user },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    const statusCode = message === "Invalid email or password" ? 401 : 500;
    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
