import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as rentSchema from "./rent-schema";

// Client SOLA LETTURA verso il database esterno "numbers-rent".
// Usato solo per SELECT: non eseguire mai insert/update/delete qui.

if (!process.env.RENT_DATABASE_URL) {
  throw new Error("RENT_DATABASE_URL non impostata. Controlla il file .env");
}

const sql = neon(process.env.RENT_DATABASE_URL);

export const rentDb = drizzle(sql, { schema: rentSchema, casing: "snake_case" });
