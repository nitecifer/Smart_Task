// SERVICE LAYER — the business rules for authentication.
// It knows WHAT should happen ("email must be unique", "password must match"),
// but not HOW data is stored (repository's job) or how HTTP works (controller's job).
//
// Notice: it receives its helpers through the constructor as INTERFACES.
// It never says "new PrismaUserRepository()" or "import bcrypt".
// (SOLID: Dependency Inversion)
import type { IUserRepository } from "../interfaces/IUserRepository.js";
import type { IPasswordHasher } from "../interfaces/IPasswordHasher.js";
import type { ITokenService } from "../interfaces/ITokenService.js";
import { toPublicUser, type PublicUser } from "../types/user.types.js";
import { ConflictError, UnauthorizedError } from "../utils/AppError.js";

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// What signup/login give back: the safe user + a token for the cookie.
export interface AuthResult {
  user: PublicUser;
  token: string;
}

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: IPasswordHasher,
    private readonly tokens: ITokenService,
  ) {}

  async signup({ name, email, password }: SignupInput): Promise<AuthResult> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await this.hasher.hash(password);
    const user = await this.users.create({ name, email, passwordHash });

    // Log the user in straight away after signing up
    return { user: toPublicUser(user), token: this.tokens.sign({ userId: user.id }) };
  }

  async login({ email, password }: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(email);
    const passwordOk = user ? await this.hasher.compare(password, user.passwordHash) : false;

    // Same message for "no such email" and "wrong password", so attackers
    // can't use the login form to discover which emails are registered.
    if (!user || !passwordOk) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return { user: toPublicUser(user), token: this.tokens.sign({ userId: user.id }) };
  }

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      // Token was valid, but the user has since been deleted
      throw new UnauthorizedError();
    }
    return toPublicUser(user);
  }
}
