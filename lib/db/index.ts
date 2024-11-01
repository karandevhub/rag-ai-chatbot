import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env.mjs";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}
const client = postgres(env.DATABASE_URL);

export const db = drizzle(client);
