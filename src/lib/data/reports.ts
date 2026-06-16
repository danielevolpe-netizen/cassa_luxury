import { and, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { cars, categories, companies, leasingContracts, transactions } from "@/db/schema";

export type PeriodFilter = {
  from?: string;
  to?: string;
  companyId?: string;
};

const paid = sql`coalesce(${transactions.amountPaid}, 0)`;

function txWhere(f: PeriodFilter): SQL | undefined {
  const conds: SQL[] = [];
  if (f.from) conds.push(gte(transactions.date, f.from));
  if (f.to) conds.push(lte(transactions.date, f.to));
  if (f.companyId) conds.push(eq(transactions.companyId, f.companyId));
  return conds.length ? and(...conds) : undefined;
}

const NO_COMPANY = "Senza società";

// --- Conto economico per società -------------------------------------------

export type CompanyPnL = {
  companyId: string | null;
  companyName: string;
  ricavi: number;
  costi: number;
  saldo: number;
};

export async function getProfitLossByCompany(
  f: PeriodFilter = {},
): Promise<CompanyPnL[]> {
  const rows = await db
    .select({
      companyId: transactions.companyId,
      companyName: companies.name,
      direction: transactions.direction,
      total: sql<string>`sum(${transactions.total})`,
    })
    .from(transactions)
    .leftJoin(companies, eq(transactions.companyId, companies.id))
    .where(txWhere(f))
    .groupBy(transactions.companyId, companies.name, transactions.direction);

  const map = new Map<string, CompanyPnL>();
  for (const r of rows) {
    const key = r.companyId ?? "__none__";
    const name = r.companyName ?? NO_COMPANY;
    const cur =
      map.get(key) ??
      { companyId: r.companyId, companyName: name, ricavi: 0, costi: 0, saldo: 0 };
    const amount = Number(r.total ?? 0);
    if (r.direction === "entrata") cur.ricavi += amount;
    else cur.costi += amount;
    map.set(key, cur);
  }
  const result = [...map.values()];
  for (const r of result) r.saldo = r.ricavi - r.costi;
  result.sort((a, b) => b.saldo - a.saldo);
  return result;
}

// --- Dettaglio per categoria ------------------------------------------------

export type CategoryPnL = {
  categoryName: string;
  ricavi: number;
  costi: number;
};

export async function getProfitLossByCategory(
  f: PeriodFilter = {},
): Promise<CategoryPnL[]> {
  const rows = await db
    .select({
      categoryName: categories.name,
      direction: transactions.direction,
      total: sql<string>`sum(${transactions.total})`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(txWhere(f))
    .groupBy(categories.name, transactions.direction);

  const map = new Map<string, CategoryPnL>();
  for (const r of rows) {
    const name = r.categoryName ?? "Senza categoria";
    const cur = map.get(name) ?? { categoryName: name, ricavi: 0, costi: 0 };
    const amount = Number(r.total ?? 0);
    if (r.direction === "entrata") cur.ricavi += amount;
    else cur.costi += amount;
    map.set(name, cur);
  }
  return [...map.values()].sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName),
  );
}

// --- Crediti / Debiti (residui) --------------------------------------------

export type ReceivablePayable = {
  companyId: string | null;
  companyName: string;
  crediti: number; // residuo su entrate (da incassare)
  debiti: number; // residuo su uscite (da pagare)
};

export async function getReceivablesPayables(
  f: PeriodFilter = {},
): Promise<ReceivablePayable[]> {
  const rows = await db
    .select({
      companyId: transactions.companyId,
      companyName: companies.name,
      direction: transactions.direction,
      residuo: sql<string>`sum(${transactions.total} - ${paid})`,
    })
    .from(transactions)
    .leftJoin(companies, eq(transactions.companyId, companies.id))
    .where(txWhere(f))
    .groupBy(transactions.companyId, companies.name, transactions.direction);

  const map = new Map<string, ReceivablePayable>();
  for (const r of rows) {
    const key = r.companyId ?? "__none__";
    const name = r.companyName ?? NO_COMPANY;
    const cur =
      map.get(key) ??
      { companyId: r.companyId, companyName: name, crediti: 0, debiti: 0 };
    const amount = Number(r.residuo ?? 0);
    if (r.direction === "entrata") cur.crediti += amount;
    else cur.debiti += amount;
    map.set(key, cur);
  }
  return [...map.values()].filter((r) => r.crediti !== 0 || r.debiti !== 0);
}

// --- Depositi cauzionali ----------------------------------------------------

export async function getDepositsByCompany(): Promise<
  { companyName: string; total: number }[]
> {
  const rows = await db
    .select({
      companyName: companies.name,
      total: sql<string>`sum(${transactions.total})`,
    })
    .from(transactions)
    .leftJoin(companies, eq(transactions.companyId, companies.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(categories.name, "Deposito Cauzionale"))
    .groupBy(companies.name);

  return rows.map((r) => ({
    companyName: r.companyName ?? NO_COMPANY,
    total: Number(r.total ?? 0),
  }));
}

// --- Debito residuo leasing -------------------------------------------------

export async function getLeasingResidualByCompany(): Promise<
  { companyName: string; residual: number; buyout: number }[]
> {
  const rows = await db
    .select({
      companyName: companies.name,
      residual: sql<string>`sum(coalesce(${leasingContracts.residualDebt}, 0))`,
      buyout: sql<string>`sum(coalesce(${leasingContracts.buyoutValue}, 0))`,
    })
    .from(leasingContracts)
    .leftJoin(cars, eq(leasingContracts.carId, cars.id))
    .leftJoin(companies, eq(cars.companyId, companies.id))
    .groupBy(companies.name);

  return rows
    .map((r) => ({
      companyName: r.companyName ?? NO_COMPANY,
      residual: Number(r.residual ?? 0),
      buyout: Number(r.buyout ?? 0),
    }))
    .filter((r) => r.residual !== 0 || r.buyout !== 0);
}
