// db.ts or similar
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Move this check to where you actually use the database connection
const getDatabaseClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }
  return postgres(process.env.DATABASE_URL);
};

export const db = drizzle(getDatabaseClient());