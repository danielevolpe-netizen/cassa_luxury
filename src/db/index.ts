import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL non impostata. Controlla il file .env");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema, casing: "snake_case" });

export type Database = typeof db;
