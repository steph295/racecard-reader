import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schemaNs from "./schema";

declare global {
  var __dbClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and configure it.");
}

// Reuse the connection across hot-reloads in dev; Next.js route handlers run
// in a long-lived Node process, so a plain module-level singleton is fine.
const client = global.__dbClient ?? postgres(connectionString, { max: 10 });
if (process.env.NODE_ENV !== "production") {
  global.__dbClient = client;
}

export const db = drizzle(client, { schema: schemaNs });
export const schema = schemaNs;
