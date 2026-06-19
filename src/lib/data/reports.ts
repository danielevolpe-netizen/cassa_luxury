import { and, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, leasingContracts, transactions } from "@/db/schema";
import { getRentCompanyMap, getRentVehicleMap } from "./rent";

export type PeriodFilter = {
  from?: string;
  to?: string;
  companyId?: string;
};

const NO_COMPANY = "Senza società";

function txWhere(f: PeriodFilter): SQL | undefined {
  const conds: SQL[] = [];
  if (f.from) conds.push(gte(transactions.date, f.from));
  if (f.to) conds.push(lte(transactions.date, f.to));
  if (f.companyId) conds.push(eq(transactions.companyId, f.companyId));
  return conds.length ? and(...conds) : undefined;
}

function companyName(
  map: Map<string, string>,
  id: string | null,
): string {
  if (!id) return NO_COMPANY;
  return map.get(id) ?? "Società sconosciuta";
}

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
  const [rows, companyMap] = await Promise.all([
    db
      .select({
        companyId: transactions.companyId,
        direction: transactions.direction,
        total: sql<string>`sum(${transactions.total})`,
      })
      .from(transactions)
      .where(txWhere(f))
      .groupBy(transactions.companyId, transactions.direction),
    getRentCompanyMap(),
  ]);

  const map = new Map<string, CompanyPnL>();
  for (const r of rows) {
    const key = r.companyId ?? "__none__";
    const cur =
      map.get(key) ??
      {
        companyId: r.companyId,
        companyName: companyName(companyMap, r.companyId),
        ricavi: 0,
        costi: 0,
        saldo: 0,
      };
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

// --- Depositi cauzionali ----------------------------------------------------

export async function getDepositsByCompany(): Promise<
  { companyName: string; total: number }[]
> {
  const [rows, companyMap] = await Promise.all([
    db
      .select({
        companyId: transactions.companyId,
        total: sql<string>`sum(${transactions.total})`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(categories.name, "Deposito Cauzionale"))
      .groupBy(transactions.companyId),
    getRentCompanyMap(),
  ]);

  return rows.map((r) => ({
    companyName: companyName(companyMap, r.companyId),
    total: Number(r.total ?? 0),
  }));
}

// --- Debito residuo leasing (per veicolo) -----------------------------------

export async function getLeasingResidualByVehicle(): Promise<
  { vehicleLabel: string; residual: number; buyout: number }[]
> {
  const [rows, vehicleMap] = await Promise.all([
    db
      .select({
        carId: leasingContracts.carId,
        residual: sql<string>`sum(coalesce(${leasingContracts.residualDebt}, 0))`,
        buyout: sql<string>`sum(coalesce(${leasingContracts.buyoutValue}, 0))`,
      })
      .from(leasingContracts)
      .groupBy(leasingContracts.carId),
    getRentVehicleMap(),
  ]);

  return rows
    .map((r) => ({
      vehicleLabel: vehicleMap.get(r.carId) ?? "Veicolo sconosciuto",
      residual: Number(r.residual ?? 0),
      buyout: Number(r.buyout ?? 0),
    }))
    .filter((r) => r.residual !== 0 || r.buyout !== 0);
}
