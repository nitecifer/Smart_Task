// Plain TypeScript shapes for a user. Every layer uses these,
// so nothing outside the repository needs to know about Prisma.

// A user exactly as stored in the database (includes the password hash).
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

// A user that is safe to send to the browser (NO password hash).
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// The data needed to create a user in the database.
export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

// Removes private fields before a user leaves the backend.
export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}
