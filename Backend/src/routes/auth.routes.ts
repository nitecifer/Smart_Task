// Maps URLs to controller methods.
// Mounted under "/auth" in app.ts, so "/login" becomes "/auth/login".
import { Router, type RequestHandler } from "express";
import type { AuthController } from "../controllers/auth.controller.js";

export function createAuthRouter(controller: AuthController, requireAuth: RequestHandler): Router {
  const router = Router();

  router.post("/signup", controller.signup);
  router.post("/login", controller.login);
  router.post("/logout", controller.logout);
  router.get("/me", requireAuth, controller.me); // requireAuth runs first

  return router;
}
