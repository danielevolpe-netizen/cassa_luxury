import {
  getDepositsByCompany,
  getLeasingResidualByCompany,
  getReceivablesPayables,
} from "@/lib/data/reports";
import { formatEUR } from "@/lib/money";

export default async function CreditiDebitiPage() {
  const [rp, deposits, leasing] = await Promise.all([
    getReceivablesPayables(),
    getDepositsByCompany(),
    getLeasingResidualByCompany(),
  ]);

  const totCrediti = rp.reduce((s, r) => s + r.crediti, 0);
  const totDebiti = rp.reduce((s, r) => s + r.debiti, 0);
  const totDepositi = deposits.reduce((s, r) => s + r.total, 0);
  const totResidualLeasing = leasing.reduce((s, r) => s + r.residual, 0);

  const cards = [
    { label: "Da incassare (crediti)", value: totCrediti, cls: "text-green-700" },
    { label: "Da pagare (debiti)", value: totDebiti, cls: "text-red-700" },
    { label: "Depositi cauzionali", value: totDepositi, cls: "" },
    { label: "Debito residuo leasing", value: totResidualLeasing, cls: "" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Crediti & Debiti</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500">{c.label}</p>
            <p className={"mt-1 text-xl font-semibold " + c.cls}>
              {formatEUR(c.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Residui per società */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Residui per società
        </h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">Società</th>
                <th className="px-3 py-2 text-right">Da incassare</th>
                <th className="px-3 py-2 text-right">Da pagare</th>
                <th className="px-3 py-2 text-right">Netto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rp.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-neutral-500">
                    Nessun residuo aperto.
                  </td>
                </tr>
              ) : (
                rp.map((r) => {
                  const netto = r.crediti - r.debiti;
                  return (
                    <tr key={r.companyId ?? "none"} className="hover:bg-neutral-50">
                      <td className="px-3 py-2 font-medium">{r.companyName}</td>
                      <td className="px-3 py-2 text-right text-green-700">{formatEUR(r.crediti)}</td>
                      <td className="px-3 py-2 text-right text-red-700">{formatEUR(r.debiti)}</td>
                      <td className={"px-3 py-2 text-right font-semibold " + (netto >= 0 ? "text-green-700" : "text-red-700")}>
                        {formatEUR(netto)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Depositi cauzionali */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Depositi cauzionali
          </h2>
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Società</th>
                  <th className="px-3 py-2 text-right">Importo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-6 text-center text-neutral-500">
                      Nessun deposito.
                    </td>
                  </tr>
                ) : (
                  deposits.map((d) => (
                    <tr key={d.companyName} className="hover:bg-neutral-50">
                      <td className="px-3 py-2">{d.companyName}</td>
                      <td className="px-3 py-2 text-right">{formatEUR(d.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Debito residuo leasing */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Debito residuo leasing
          </h2>
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Società</th>
                  <th className="px-3 py-2 text-right">Debito residuo</th>
                  <th className="px-3 py-2 text-right">Valore riscatto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {leasing.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-neutral-500">
                      Nessun dato leasing.
                    </td>
                  </tr>
                ) : (
                  leasing.map((l) => (
                    <tr key={l.companyName} className="hover:bg-neutral-50">
                      <td className="px-3 py-2">{l.companyName}</td>
                      <td className="px-3 py-2 text-right">{formatEUR(l.residual)}</td>
                      <td className="px-3 py-2 text-right">{formatEUR(l.buyout)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
