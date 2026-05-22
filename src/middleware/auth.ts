import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import config from "../config";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

interface JwtPayload {
  id: number;
  name: string;
  role: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
    return;
  }

  try {
    // const secret = process.env.JWT_SECRET;
    // if (!secret) throw new Error("JWT_SECRET is not configured");

    const decoded = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export const requireMaintainer = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== "maintainer") {
    res.status(403).json({
      success: false,
      message: "Forbidden. Maintainer role required.",
    });
    return;
  }
  next();
};
