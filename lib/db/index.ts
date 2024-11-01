// db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let db: any;

try {
  const client = postgres(process.env.DATABASE_URL || '');
  db = drizzle(client);
} catch (error) {
  console.error('Database connection error:', error);
}

export { db };