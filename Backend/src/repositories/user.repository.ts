// REPOSITORY LAYER — the ONLY place that talks to the database for users.
// Its single job (SOLID: Single Responsibility) is reading/writing user rows.
// No business rules here (no password checks, no "is email taken" decisions).
import { Prisma, type PrismaClient } from "@prisma/client";
import type { IUserRepository } from "../interfaces/IUserRepository.js";
import type { CreateUserData, User } from "../types/user.types.js";
import { ConflictError } from "../utils/AppError.js";

export class PrismaUserRepository implements IUserRepository {
  // The Prisma client is passed in (injected), not imported directly.
  // That makes it easy to give it a different database in tests.
  constructor(private readonly db: PrismaClient) {}

  findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserData): Promise<User> {
    try {
      return await this.db.user.create({ data });
    } catch (err) {
      // P2002 = unique constraint failed (email already in the table).
      // We translate the Prisma-specific error into our own error,
      // so layers above never need to know Prisma exists.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictError("An account with this email already exists");
      }
      throw err;
    }
  }
}
