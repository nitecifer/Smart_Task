// COMPOSITION ROOT — the one place where we choose the real implementations
// and plug them together ("dependency injection" done by hand).
//
// Every other file only knows about interfaces. If you want to swap bcrypt
// for argon2, or Prisma for something else, you change ONE line here.
import { prisma } from "./lib/prisma.js";
import { env } from "./config/env.js";
import { PrismaUserRepository } from "./repositories/user.repository.js";
import { BcryptPasswordHasher } from "./services/password-hasher.service.js";
import { JwtTokenService } from "./services/token.service.js";
import { AuthService } from "./services/auth.service.js";
import { AuthController } from "./controllers/auth.controller.js";
import { createRequireAuth } from "./middleware/requireAuth.js";

// Repositories (database access)
const userRepository = new PrismaUserRepository(prisma);

// Helper services
const passwordHasher = new BcryptPasswordHasher(12);
const tokenService = new JwtTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

// Business services
const authService = new AuthService(userRepository, passwordHasher, tokenService);

// HTTP layer
export const authController = new AuthController(authService);
export const requireAuth = createRequireAuth(tokenService);
