// Builds the Express app: plugs in middleware and routes, in order.
// The order matters! A request flows top-to-bottom through this list.
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authController, requireAuth } from "./container.js";

export const app = express();

// 1. CORS: the browser blocks requests from localhost:3000 to localhost:5000
//    unless the API says it's allowed. credentials: true lets cookies travel along.
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// 2. Parse JSON bodies into req.body (limit size to avoid huge payloads)
app.use(express.json({ limit: "100kb" }));

// 3. Parse the Cookie header into req.cookies
app.use(cookieParser());

// Simple endpoint to check the server is alive
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "API is running" });
});

// 4. Routes
app.use("/auth", createAuthRouter(authController, requireAuth));

// 5. Nothing matched -> 404
app.use(notFound);

// 6. Errors from anywhere above end up here (must be last)
app.use(errorHandler);
