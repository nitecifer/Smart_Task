// Implements IPasswordHasher using bcrypt.
// Single job: turn passwords into hashes and check them.
import bcrypt from "bcryptjs";
import type { IPasswordHasher } from "../interfaces/IPasswordHasher.js";

export class BcryptPasswordHasher implements IPasswordHasher {
  // saltRounds = how much work bcrypt does. Higher = slower to crack (and slower to log in). 10-12 is standard.
  constructor(private readonly saltRounds = 12) {}

  hash(plainPassword: string): Promise<string> {
    // "mypassword123" -> "$2b$12$Kix..."  (cannot be reversed)
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  compare(plainPassword: string, hash: string): Promise<boolean> {
    // Hashes the typed password the same way and checks it matches.
    return bcrypt.compare(plainPassword, hash);
  }
}
