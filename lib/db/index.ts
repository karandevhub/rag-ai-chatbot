import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env.mjs";


const client = postgres("");
export const db = drizzle(client);
