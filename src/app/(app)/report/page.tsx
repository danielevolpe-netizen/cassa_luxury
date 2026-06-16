import Link from "next/link";
import { getActiveCompanies } from "@/lib/data/lookups";
import {
  getProfitLossByCategory,
  getProfitLossByCompany,
  type PeriodFilter,
} from "@/lib/data/reports";
import { formatEUR } from "@/lib/money";

const selectClass =
  "rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";

function saldoClass(n: number) {
  return n >= 0 ? "text-green-700" : "text-red-700";
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filter: PeriodFilter = {
    from: sp.from,
    to: sp.to,
    companyId: sp.companyId,
  };

  const [companies, byCompany, byCategory] = await Promise.all([
    getActiveCompanies(),
    getProfitLossByCompany(filter),
    getProfitLossByCategory(filter),
  ]);

  const tot = byCompany.reduce(
    (acc, r) => {
      acc.ricavi += r.ricavi;
      acc.costi += r.costi;
      return acc;
    },
    { ricavi: 0, costi: 0 },
  );
  const totSaldo = tot.ricavi - tot.costi;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Conto economico
      </h1>

      <form
        method="get"
        className="flex flex-wrap items-end gap-2 rounded-lg border border-neutral-200 p-3"
      >
        <div className="space-y-1">
          <label className="block text-xs text-neutral-500">Dal</label>
          <input type="date" name="from" defaultValue={sp.from ?? ""} className={selectClass} />
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-neutral-500">Al</label>
          <input type="date" name="to" defaultValue={sp.to ?? ""} className={selectClass} />
        </div>
        <select name="companyId" defaultValue={sp.companyId ?? ""} className={selectClass}>
          <option value="">Tutte le società</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700">
          Filtra
        </button>
        <Link href="/report" className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100">
          Azzera
        </Link>
      </form>

      {/* P&L per società */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Per società
        </h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">Società</th>
                <th className="px-3 py-2 text-right">Ricavi</th>
                <th className="px-3 py-2 text-right">Costi</th>
                <th className="px-3 py-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {byCompany.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-neutral-500">
                    Nessun dato nel periodo selezionato.
                  </td>
                </tr>
              ) : (
                byCompany.map((r) => (
                  <tr key={r.companyId ?? "none"} className="hover:bg-neutral-50">
                    <td className="px-3 py-2 font-medium">{r.companyName}</td>
                    <td className="px-3 py-2 text-right text-green-700">
                      {formatEUR(r.ricavi)}
                    </td>
                    <td className="px-3 py-2 text-right text-red-700">
                      {formatEUR(r.costi)}
                    </td>
                    <td className={"px-3 py-2 text-right font-semibold " + saldoClass(r.saldo)}>
                      {formatEUR(r.saldo)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {byCompany.length > 0 ? (
              <tfoot className="border-t-2 border-neutral-300 font-semibold">
                <tr>
                  <td className="px-3 py-2">Totale</td>
                  <td className="px-3 py-2 text-right text-green-700">{formatEUR(tot.ricavi)}</td>
                  <td className="px-3 py-2 text-right text-red-700">{formatEUR(tot.costi)}</td>
                  <td className={"px-3 py-2 text-right " + saldoClass(totSaldo)}>
                    {formatEUR(totSaldo)}
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </section>

      {/* Dettaglio per categoria */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Per categoria
        </h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2 text-right">Ricavi</th>
                <th className="px-3 py-2 text-right">Costi</th>
                <th className="px-3 py-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {byCategory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-neutral-500">
                    Nessun dato.
                  </td>
                </tr>
              ) : (
                byCategory.map((r) => {
                  const saldo = r.ricavi - r.costi;
                  return (
                    <tr key={r.categoryName} className="hover:bg-neutral-50">
                      <td className="px-3 py-2">{r.categoryName}</td>
                      <td className="px-3 py-2 text-right text-green-700">{formatEUR(r.ricavi)}</td>
                      <td className="px-3 py-2 text-right text-red-700">{formatEUR(r.costi)}</td>
                      <td className={"px-3 py-2 text-right " + saldoClass(saldo)}>
                        {formatEUR(saldo)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
