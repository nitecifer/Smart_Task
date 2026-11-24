// CONTRACT for "something that can store and load users".
// The service depends on THIS interface, not on Prisma. So if you ever switch
// to MongoDB, or use a fake in-memory version in tests, the service doesn't change.
// (SOLID: Dependency Inversion + Liskov Substitution)
import type { CreateUserData, User } from "../types/user.types.js";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}
