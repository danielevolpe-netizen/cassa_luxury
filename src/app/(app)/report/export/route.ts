import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import {
  getProfitLossByCompany,
  type PeriodFilter,
} from "@/lib/data/reports";
import {
  exportHeaders,
  toCsv,
  toXlsx,
  type Cell,
  type ExportColumn,
} from "@/lib/export";

const columns: ExportColumn[] = [
  { header: "Società", width: 22 },
  { header: "Ricavi", numeric: true },
  { header: "Costi", numeric: true },
  { header: "Saldo", numeric: true },
];

export async function GET(req: NextRequest) {
  await requireUser();

  const sp = req.nextUrl.searchParams;
  const format = sp.get("format") === "xlsx" ? "xlsx" : "csv";
  const filter: PeriodFilter = {
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
    companyId: sp.get("companyId") ?? undefined,
  };

  const rows = await getProfitLossByCompany(filter);
  const data: Cell[][] = rows.map((r) => [
    r.companyName,
    r.ricavi,
    r.costi,
    r.saldo,
  ]);

  // Riga totali
  const totRicavi = rows.reduce((s, r) => s + r.ricavi, 0);
  const totCosti = rows.reduce((s, r) => s + r.costi, 0);
  data.push(["TOTALE", totRicavi, totCosti, totRicavi - totCosti]);

  if (format === "xlsx") {
    const buffer = await toXlsx("Conto economico", columns, data);
    return new Response(new Uint8Array(buffer), {
      headers: exportHeaders("conto-economico", "xlsx"),
    });
  }

  const csv = toCsv(columns, data);
  return new Response(csv, { headers: exportHeaders("conto-economico", "csv") });
}
