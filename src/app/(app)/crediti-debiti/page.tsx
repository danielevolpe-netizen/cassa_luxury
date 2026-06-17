import {
  getDepositsByCompany,
  getLeasingResidualByCompany,
  getReceivablesPayables,
} from "@/lib/data/reports";
import { formatEUR } from "@/lib/money";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          <Card key={c.label} className="gap-0 p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className={"mt-1 text-xl font-semibold " + c.cls}>{formatEUR(c.value)}</p>
          </Card>
        ))}
      </div>

      {/* Residui per società */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Residui per società
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Società</TableHead>
                <TableHead className="text-right">Da incassare</TableHead>
                <TableHead className="text-right">Da pagare</TableHead>
                <TableHead className="text-right">Netto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rp.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                    Nessun residuo aperto.
                  </TableCell>
                </TableRow>
              ) : (
                rp.map((r) => {
                  const netto = r.crediti - r.debiti;
                  return (
                    <TableRow key={r.companyId ?? "none"}>
                      <TableCell className="font-medium">{r.companyName}</TableCell>
                      <TableCell className="text-right text-green-700">{formatEUR(r.crediti)}</TableCell>
                      <TableCell className="text-right text-red-700">{formatEUR(r.debiti)}</TableCell>
                      <TableCell className={"text-right font-semibold " + (netto >= 0 ? "text-green-700" : "text-red-700")}>
                        {formatEUR(netto)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Depositi cauzionali */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Depositi cauzionali
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Società</TableHead>
                  <TableHead className="text-right">Importo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-20 text-center text-muted-foreground">
                      Nessun deposito.
                    </TableCell>
                  </TableRow>
                ) : (
                  deposits.map((d) => (
                    <TableRow key={d.companyName}>
                      <TableCell>{d.companyName}</TableCell>
                      <TableCell className="text-right">{formatEUR(d.total)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Debito residuo leasing */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Debito residuo leasing
          </h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Società</TableHead>
                  <TableHead className="text-right">Debito residuo</TableHead>
                  <TableHead className="text-right">Valore riscatto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leasing.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                      Nessun dato leasing.
                    </TableCell>
                  </TableRow>
                ) : (
                  leasing.map((l) => (
                    <TableRow key={l.companyName}>
                      <TableCell>{l.companyName}</TableCell>
                      <TableCell className="text-right">{formatEUR(l.residual)}</TableCell>
                      <TableCell className="text-right">{formatEUR(l.buyout)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
