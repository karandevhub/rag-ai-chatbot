import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env.mjs";
import "dotenv/config";

if(!process.env.NEXT_PUBLIC_DATABASE_URL)
    throw new Error("DATABASE_URL is not defined")

const client = postgres(process.env.NEXT_PUBLIC_DATABASE_URL);
export const db = drizzle(client);

