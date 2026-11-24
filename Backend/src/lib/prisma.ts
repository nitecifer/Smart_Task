// One shared database client for the whole app.
// Creating a new client per request would open too many DB connections.
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
