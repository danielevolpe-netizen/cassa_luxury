import { and, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";

export type TransactionFilters = {
  q?: string;
  direction?: "entrata" | "uscita";
  companyId?: string;
  categoryId?: string;
  carId?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
};

function buildWhere(f: TransactionFilters): SQL | undefined {
  const conds: SQL[] = [];

  if (f.direction) conds.push(eq(transactions.direction, f.direction));
  if (f.companyId) conds.push(eq(transactions.companyId, f.companyId));
  if (f.categoryId) conds.push(eq(transactions.categoryId, f.categoryId));
  if (f.carId) conds.push(eq(transactions.carId, f.carId));
  if (f.from) conds.push(gte(transactions.date, f.from));
  if (f.to) conds.push(lte(transactions.date, f.to));

  if (f.q) {
    const like = `%${f.q}%`;
    const text = or(
      ilike(transactions.counterparty, like),
      ilike(transactions.description, like),
      ilike(transactions.notes, like),
    );
    if (text) conds.push(text);
  }

  return conds.length ? and(...conds) : undefined;
}

/** Elenco movimenti con anagrafiche collegate, filtrato e ordinato per data. */
export async function listTransactions(
  f: TransactionFilters = {},
  opts: { limit?: number } = {},
) {
  return db.query.transactions.findMany({
    where: buildWhere(f),
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
    limit: opts.limit ?? 500,
    with: {
      category: true,
      paymentMethod: true,
    },
  });
}

/** Totali aggregati sull'insieme filtrato (entrate, uscite, saldo). */
export async function getTransactionsTotals(f: TransactionFilters = {}) {
  const rows = await db
    .select({
      direction: transactions.direction,
      total: sql<string>`sum(${transactions.total})`,
    })
    .from(transactions)
    .where(buildWhere(f))
    .groupBy(transactions.direction);

  let entrate = 0;
  let uscite = 0;
  for (const r of rows) {
    const tot = Number(r.total ?? 0);
    if (r.direction === "entrata") entrate = tot;
    else uscite = tot;
  }
  return { entrate, uscite, saldo: entrate - uscite };
}

/** Singolo movimento per id. */
export async function getTransaction(id: string) {
  return db.query.transactions.findFirst({
    where: eq(transactions.id, id),
    with: {
      category: true,
      paymentMethod: true,
    },
  });
}
