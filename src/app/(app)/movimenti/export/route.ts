import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import {
  listTransactions,
  type TransactionFilters,
} from "@/lib/data/transactions";
import { getRentCompanyMap, getRentVehicleMap } from "@/lib/data/rent";
import { formatDate } from "@/lib/format";
import { toNumber } from "@/lib/money";
import {
  exportHeaders,
  toCsv,
  toXlsx,
  type Cell,
  type ExportColumn,
} from "@/lib/export";

const columns: ExportColumn[] = [
  { header: "Data", width: 12 },
  { header: "Tipo", width: 10 },
  { header: "Mittente / Destinatario", width: 26 },
  { header: "Descrizione", width: 30 },
  { header: "Auto", width: 24 },
  { header: "Società", width: 16 },
  { header: "Categoria", width: 18 },
  { header: "Imponibile", numeric: true },
  { header: "IVA", numeric: true },
  { header: "Fee", numeric: true },
  { header: "Totale", numeric: true },
  { header: "Metodo", width: 14 },
  { header: "Note", width: 30 },
];

export async function GET(req: NextRequest) {
  await requireUser();

  const sp = req.nextUrl.searchParams;
  const format = sp.get("format") === "xlsx" ? "xlsx" : "csv";

  const filters: TransactionFilters = {
    q: sp.get("q") ?? undefined,
    direction: (sp.get("direction") as TransactionFilters["direction"]) || undefined,
    companyId: sp.get("companyId") ?? undefined,
    categoryId: sp.get("categoryId") ?? undefined,
    carId: sp.get("carId") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  };

  const [rows, companyMap, vehicleMap] = await Promise.all([
    listTransactions(filters, { limit: 100000 }),
    getRentCompanyMap(),
    getRentVehicleMap(),
  ]);

  const data: Cell[][] = rows.map((t) => [
    formatDate(t.date),
    t.direction === "entrata" ? "Entrata" : "Uscita",
    t.counterparty ?? "",
    t.description ?? "",
    t.carId ? (vehicleMap.get(t.carId) ?? "") : "",
    t.companyId ? (companyMap.get(t.companyId) ?? "") : "",
    t.category?.name ?? "",
    toNumber(t.taxable),
    toNumber(t.vatAmount),
    toNumber(t.fee),
    toNumber(t.total),
    t.paymentMethod?.name ?? "",
    t.notes ?? "",
  ]);

  if (format === "xlsx") {
    const buffer = await toXlsx("Movimenti", columns, data);
    return new Response(new Uint8Array(buffer), {
      headers: exportHeaders("movimenti", "xlsx"),
    });
  }

  const csv = toCsv(columns, data);
  return new Response(csv, { headers: exportHeaders("movimenti", "csv") });
}
