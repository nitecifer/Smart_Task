// Centralised error handling (required by the PRD).
// Any error thrown in a route ends up here and becomes a consistent JSON response:
//   { "success": false, "message": "...", "errors"?: {...} }
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // 1. Validation errors from Zod -> 400 Bad Request, with a message per field
  if (err instanceof ZodError) {
    const errors: Record<string, string> = {};
    for (const issue of err.issues) {
      const field = issue.path.join(".") || "body";
      errors[field] ??= issue.message;
    }
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  // 2. Errors we threw on purpose (AppError) -> use their status code
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // 3. Anything else is a bug/unexpected -> log it, but don't leak details to the user
  console.error(err);
  res.status(500).json({ success: false, message: "Something went wrong" });
}
