// Implements ITokenService using JWT (JSON Web Token).
// A JWT is a signed "ID card" containing the user's id. Because it is signed
// with a secret, nobody can change it without us noticing.
import jwt, { type SignOptions } from "jsonwebtoken";
import type { ITokenService, TokenPayload } from "../interfaces/ITokenService.js";

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(payload: TokenPayload): string {
    return jwt.sign({ userId: payload.userId }, this.secret, {
      expiresIn: this.expiresIn as SignOptions["expiresIn"],
    });
  }

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.secret); // throws if invalid or expired
    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
      throw new Error("Malformed token");
    }
    return { userId: decoded.userId };
  }
}
