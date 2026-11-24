// Settings for the cookie that stores the login token in the browser.
import type { CookieOptions } from "express";
import { env } from "./env.js";

export const AUTH_COOKIE_NAME = "token";

export const authCookieOptions: CookieOptions = {
  httpOnly: true, // browser JavaScript CANNOT read it -> protects against XSS token theft
  secure: env.isProduction, // only sent over HTTPS in production
  sameSite: env.isProduction ? "none" : "lax", // "none" needed when frontend & backend are on different domains
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, in milliseconds
  path: "/",
};

// To delete a cookie, the options must match how it was set (minus maxAge).
const { maxAge: _maxAge, ...clearOptions } = authCookieOptions;
export const clearAuthCookieOptions: CookieOptions = clearOptions;
