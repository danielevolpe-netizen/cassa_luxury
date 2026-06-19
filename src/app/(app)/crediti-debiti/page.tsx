import {
  getDepositsByCompany,
  getLeasingResidualByVehicle,
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
  const [deposits, leasing] = await Promise.all([
    getDepositsByCompany(),
    getLeasingResidualByVehicle(),
  ]);

  const totDepositi = deposits.reduce((s, r) => s + r.total, 0);
  const totResidualLeasing = leasing.reduce((s, r) => s + r.residual, 0);

  const cards = [
    { label: "Depositi cauzionali", value: totDepositi },
    { label: "Debito residuo leasing", value: totResidualLeasing },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Crediti & Debiti</h1>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="gap-0 p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-xl font-semibold">{formatEUR(c.value)}</p>
          </Card>
        ))}
      </div>

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
                  <TableHead>Veicolo</TableHead>
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
                    <TableRow key={l.vehicleLabel}>
                      <TableCell>{l.vehicleLabel}</TableCell>
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
