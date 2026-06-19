import { asc } from "drizzle-orm";
import { db } from "@/db";
import { counterparties } from "@/db/schema";

/** Nomi dei clienti/fornitori (per il combobox dei movimenti). */
export async function getCounterpartyNames(): Promise<string[]> {
  const rows = await db
    .select({ name: counterparties.name })
    .from(counterparties)
    .orderBy(asc(counterparties.name));
  return rows.map((r) => r.name);
}
