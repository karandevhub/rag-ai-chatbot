import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";

function getDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined");
    }
    const client = postgres(process.env.DATABASE_URL);
    return drizzle(client);
}

export const db = getDb();
