// CONTRACT for "something that can hash and check passwords".
// Today it's bcrypt; tomorrow it could be argon2 — the service won't care.
export interface IPasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hash: string): Promise<boolean>;
}
