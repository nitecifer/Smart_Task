// "Bouncer" middleware: put it in front of any route that needs a logged-in user.
// It reads the token cookie, verifies it, and attaches the user's id to req.userId.
//
// It's a factory: you give it a token service and it returns the middleware.
// So it depends on the ITokenService interface, not on JWT directly.
import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ITokenService } from "../interfaces/ITokenService.js";
import { AUTH_COOKIE_NAME } from "../config/cookie.js";
import { UnauthorizedError } from "../utils/AppError.js";

// Tell TypeScript that Request objects can have a userId property.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function createRequireAuth(tokens: ITokenService): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token) {
      return next(new UnauthorizedError());
    }

    try {
      req.userId = tokens.verify(token).userId;
      next(); // all good -> continue to the route handler
    } catch {
      next(new UnauthorizedError("Session expired or invalid, please log in again"));
    }
  };
}
