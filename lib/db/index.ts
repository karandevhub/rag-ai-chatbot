// db.ts
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let db: PostgresJsDatabase;

try {
  const client = postgres('');
  db = drizzle(client);
} catch (error) {
  console.error('Database connection error:', error);
}

export { db };