import Link from "next/link";
import { getTransactionsTotals } from "@/lib/data/transactions";
import { formatEUR } from "@/lib/money";

export default async function DashboardPage() {
  const totals = await getTransactionsTotals();

  const cards = [
    { label: "Entrate (totali)", value: formatEUR(totals.entrate) },
    { label: "Uscite (totali)", value: formatEUR(totals.uscite) },
    { label: "Saldo", value: formatEUR(totals.saldo) },
    {
      label: "Da incassare",
      value: formatEUR(totals.residuoEntrate),
    },
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
          <div
            key={c.label}
            className="rounded-xl border border-neutral-200 p-4"
          >
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-1 text-xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-neutral-500">
        Report per società, flotta e scadenze in arrivo nelle prossime fasi.
      </p>
    </div>
  );
}
