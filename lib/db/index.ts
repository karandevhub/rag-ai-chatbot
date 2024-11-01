import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";

let db: ReturnType<typeof drizzle> | undefined;

if (process.env.DATABASE_URL) {
    const client = postgres(process.env.DATABASE_URL);
    db = drizzle(client);
} else {
    console.warn("DATABASE_URL is not defined; ensure it's set at runtime.");
}

export { db };
