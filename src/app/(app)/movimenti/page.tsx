import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getTransactionLookups } from "@/lib/data/lookups";
import {
  getTransactionsTotals,
  listTransactions,
  type TransactionFilters,
} from "@/lib/data/transactions";
import { formatDate } from "@/lib/format";
import { formatEUR, residuo, toNumber } from "@/lib/money";
import { deleteTransaction } from "./actions";
import { DeleteTransactionButton } from "./delete-button";

const selectClass =
  "rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";

function statoBadge(total: string, amountPaid: string | null) {
  const paid = toNumber(amountPaid);
  const tot = toNumber(total);
  if (paid <= 0)
    return { label: "Non pagato", cls: "bg-red-100 text-red-700" };
  if (paid < tot)
    return { label: "Parziale", cls: "bg-amber-100 text-amber-700" };
  return { label: "Pagato", cls: "bg-green-100 text-green-700" };
}

export default async function MovimentiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters: TransactionFilters = {
    q: sp.q,
    direction: sp.direction as TransactionFilters["direction"],
    companyId: sp.companyId,
    categoryId: sp.categoryId,
    carId: sp.carId,
    from: sp.from,
    to: sp.to,
    stato: sp.stato as TransactionFilters["stato"],
  };

  const [user, lookups, rows, totals] = await Promise.all([
    getCurrentUser(),
    getTransactionLookups(),
    listTransactions(filters),
    getTransactionsTotals(filters),
  ]);

  const isAdmin = user?.role === "admin";
  const { companyList, categoryList, carList } = lookups;

  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value) exportParams.set(key, value);
  }
  const exportQuery = exportParams.toString();
  const exportUrl = (format: string) =>
    `/movimenti/export?${exportQuery ? exportQuery + "&" : ""}format=${format}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Movimenti</h1>
        <div className="flex items-center gap-2">
          <a
            href={exportUrl("csv")}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            Esporta CSV
          </a>
          <a
            href={exportUrl("xlsx")}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            Esporta Excel
          </a>
          <Link
            href="/movimenti/nuovo"
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            + Nuovo movimento
          </Link>
        </div>
      </div>

      {/* Filtri */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-2 rounded-lg border border-neutral-200 p-3"
      >
        <input
          type="text"
          name="q"
          placeholder="Cerca…"
          defaultValue={sp.q ?? ""}
          className={selectClass}
        />
        <select name="direction" defaultValue={sp.direction ?? ""} className={selectClass}>
          <option value="">Tutti i tipi</option>
          <option value="entrata">Entrate</option>
          <option value="uscita">Uscite</option>
        </select>
        <select name="companyId" defaultValue={sp.companyId ?? ""} className={selectClass}>
          <option value="">Tutte le società</option>
          {companyList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="categoryId" defaultValue={sp.categoryId ?? ""} className={selectClass}>
          <option value="">Tutte le categorie</option>
          {categoryList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="carId" defaultValue={sp.carId ?? ""} className={selectClass}>
          <option value="">Tutte le auto</option>
          {carList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </select>
        <select name="stato" defaultValue={sp.stato ?? ""} className={selectClass}>
          <option value="">Tutti gli stati</option>
          <option value="pagato">Pagato</option>
          <option value="parziale">Parziale</option>
          <option value="nonpagato">Non pagato</option>
        </select>
        <input type="date" name="from" defaultValue={sp.from ?? ""} className={selectClass} />
        <input type="date" name="to" defaultValue={sp.to ?? ""} className={selectClass} />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Filtra
        </button>
        <Link
          href="/movimenti"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
        >
          Azzera
        </Link>
      </form>

      {/* Totali */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-xs text-neutral-500">Entrate</p>
          <p className="font-semibold text-green-700">
            {formatEUR(totals.entrate)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-xs text-neutral-500">Uscite</p>
          <p className="font-semibold text-red-700">
            {formatEUR(totals.uscite)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-xs text-neutral-500">Saldo</p>
          <p className="font-semibold">{formatEUR(totals.saldo)}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-xs text-neutral-500">Da incassare</p>
          <p className="font-semibold">{formatEUR(totals.residuoEntrate)}</p>
        </div>
      </div>

      {/* Tabella */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Descrizione</th>
              <th className="px-3 py-2">Società / Auto</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2 text-right">Imponibile</th>
              <th className="px-3 py-2 text-right">IVA</th>
              <th className="px-3 py-2 text-right">Totale</th>
              <th className="px-3 py-2 text-right">Residuo</th>
              <th className="px-3 py-2">Stato</th>
              <th className="px-3 py-2 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-3 py-8 text-center text-neutral-500"
                >
                  Nessun movimento trovato.
                </td>
              </tr>
            ) : (
              rows.map((t) => {
                const badge = statoBadge(t.total, t.amountPaid);
                return (
                  <tr key={t.id} className="hover:bg-neutral-50">
                    <td className="whitespace-nowrap px-3 py-2">
                      {formatDate(t.date)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          "rounded px-1.5 py-0.5 text-xs font-medium " +
                          (t.direction === "entrata"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700")
                        }
                      >
                        {t.direction === "entrata" ? "Entrata" : "Uscita"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">
                        {t.counterparty ?? "—"}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {t.description ?? ""}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>{t.company?.name ?? "—"}</div>
                      <div className="text-xs text-neutral-500">
                        {t.car?.code ?? ""}
                      </div>
                    </td>
                    <td className="px-3 py-2">{t.category?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-right">
                      {formatEUR(t.taxable)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatEUR(t.vatAmount)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {formatEUR(t.total)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatEUR(residuo(t.total, t.amountPaid))}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          "rounded px-1.5 py-0.5 text-xs font-medium " +
                          badge.cls
                        }
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/movimenti/${t.id}`}
                          className="font-medium text-neutral-700 hover:underline"
                        >
                          Modifica
                        </Link>
                        {isAdmin ? (
                          <DeleteTransactionButton
                            action={deleteTransaction.bind(null, t.id)}
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-neutral-500">
        {rows.length} movimenti (max 500 visualizzati).
      </p>
    </div>
  );
}
