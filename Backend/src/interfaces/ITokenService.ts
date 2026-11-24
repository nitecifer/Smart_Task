// CONTRACT for "something that can create and verify login tokens".
export interface TokenPayload {
  userId: string;
}

export interface ITokenService {
  sign(payload: TokenPayload): string;
  /** Returns the payload, or throws if the token is invalid/expired. */
  verify(token: string): TokenPayload;
}
