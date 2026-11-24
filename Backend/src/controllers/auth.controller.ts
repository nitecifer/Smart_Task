// CONTROLLER LAYER — translates between HTTP and the service.
// Its only jobs:
//   1. read & validate input from the request
//   2. call the service
//   3. set cookies / status codes and send the JSON response
// No database calls, no password logic here.
//
// Note: Express 5 automatically sends errors thrown in async handlers to
// errorHandler, so no try/catch is needed.
import type { Request, Response } from "express";
import type { AuthService } from "../services/auth.service.js";
import { loginSchema, signupSchema } from "../validators/auth.validators.js";
import { AUTH_COOKIE_NAME, authCookieOptions, clearAuthCookieOptions } from "../config/cookie.js";
import { UnauthorizedError } from "../utils/AppError.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Methods are arrow functions so "this" still works when Express calls them.

  // POST /auth/signup  { name, email, password }
  signup = async (req: Request, res: Response) => {
    const input = signupSchema.parse(req.body); // throws ZodError -> 400 if invalid
    const { user, token } = await this.authService.signup(input);

    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
    res.status(201).json({ success: true, data: { user } });
  };

  // POST /auth/login  { email, password }
  login = async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);
    const { user, token } = await this.authService.login(input);

    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);
    res.json({ success: true, data: { user } });
  };

  // POST /auth/logout
  logout = async (_req: Request, res: Response) => {
    res.clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions);
    res.json({ success: true, message: "Logged out" });
  };

  // GET /auth/me  (requireAuth runs first and sets req.userId)
  me = async (req: Request, res: Response) => {
    if (!req.userId) throw new UnauthorizedError();
    const user = await this.authService.getCurrentUser(req.userId);
    res.json({ success: true, data: { user } });
  };
}
