import Link from "next/link";
import { deadlineAlert, listDeadlines } from "@/lib/data/deadlines";
import { getTransactionsTotals } from "@/lib/data/transactions";
import { formatEUR } from "@/lib/money";

export default async function DashboardPage() {
  const [totals, deadlines] = await Promise.all([
    getTransactionsTotals(),
    listDeadlines({ status: "aperta" }),
  ]);

  let scadute = 0;
  let inScadenza = 0;
  for (const d of deadlines) {
    const a = deadlineAlert(d.dueDate, d.status);
    if (a === "scaduta") scadute++;
    else if (a === "in_scadenza") inScadenza++;
  }

  const cards = [
    { label: "Entrate (totali)", value: formatEUR(totals.entrate) },
    { label: "Uscite (totali)", value: formatEUR(totals.uscite) },
    { label: "Saldo", value: formatEUR(totals.saldo) },
    { label: "Da incassare", value: formatEUR(totals.residuoEntrate) },
  ];

  const links = [
    { href: "/movimenti", title: "Movimenti", desc: "Registro entrate/uscite" },
    { href: "/flotta", title: "Flotta", desc: "Auto, leasing, scadenze" },
    { href: "/report", title: "Report", desc: "Conto economico per società" },
    { href: "/crediti-debiti", title: "Crediti/Debiti", desc: "Residui e depositi" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Link
          href="/movimenti/nuovo"
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          + Nuovo movimento
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-1 text-xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      {(scadute > 0 || inScadenza > 0) && (
        <Link
          href="/scadenze"
          className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100"
        >
          {scadute > 0 ? (
            <span className="text-sm font-medium text-red-700">
              {scadute} scadenz{scadute === 1 ? "a" : "e"} scadut{scadute === 1 ? "a" : "e"}
            </span>
          ) : null}
          {inScadenza > 0 ? (
            <span className="text-sm font-medium text-amber-700">
              {inScadenza} in scadenza (≤30 giorni)
            </span>
          ) : null}
          <span className="ml-auto text-sm text-neutral-600">Vai allo scadenzario →</span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50"
          >
            <p className="font-medium">{l.title}</p>
            <p className="mt-1 text-sm text-neutral-500">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
