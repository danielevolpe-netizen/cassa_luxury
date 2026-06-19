import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getLeasingByCar } from "@/lib/data/leasing";
import { listDeadlines } from "@/lib/data/deadlines";
import { getRentVehicle, vehicleLabel } from "@/lib/data/rent";
import { listTransactions } from "@/lib/data/transactions";
import { formatDate } from "@/lib/format";
import { formatEUR } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeasingManager } from "../../leasing-manager";
import { DeadlinesManager } from "../../deadlines-manager";

const sectionTitle =
  "text-sm font-semibold uppercase tracking-wide text-muted-foreground";

export default async function RentVehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, vehicle] = await Promise.all([
    getCurrentUser(),
    getRentVehicle(id),
  ]);
  if (!vehicle) notFound();

  const isAdmin = user?.role === "admin";
  const [leasing, deadlines, txs] = await Promise.all([
    getLeasingByCar(id),
    listDeadlines({ carId: id }),
    listTransactions({ carId: id }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/rent/veicoli"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Veicoli
        </Link>
        <h2 className="text-xl font-semibold tracking-tight">
          {vehicleLabel(vehicle)}
        </h2>
        <p className="text-sm text-muted-foreground">
          {vehicle.brand} {vehicle.model}
          {vehicle.year ? ` · ${vehicle.year}` : ""} · {vehicle.ownership}
        </p>
      </div>

      {/* Dati veicolo (sola lettura da Numbers Rent) */}
      <section className="space-y-3">
        <h2 className={sectionTitle}>Dati veicolo (Numbers Rent)</h2>
        <Card className="grid grid-cols-2 gap-2 p-4 text-sm sm:grid-cols-3">
          <div>
            <span className="text-muted-foreground">Targa: </span>
            {vehicle.plate ?? "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Anno: </span>
            {vehicle.year ?? "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Colore: </span>
            {vehicle.color ?? "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Alimentazione: </span>
            {vehicle.fuelType ?? "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Cambio: </span>
            {vehicle.transmission ?? "—"}
          </div>
          <div>
            <span className="text-muted-foreground">Km: </span>
            {vehicle.odometer ?? "—"}
          </div>
        </Card>
      </section>

      {/* Leasing */}
      <section className="space-y-3">
        <h2 className={sectionTitle}>Contratti di leasing</h2>
        <LeasingManager
          carId={id}
          isAdmin={isAdmin}
          items={leasing.map((l) => ({
            id: l.id,
            lessor: l.lessor,
            monthlyTaxable: l.monthlyTaxable,
            monthlyVat: l.monthlyVat,
            monthlyTotal: l.monthlyTotal,
            startDate: l.startDate,
            endDate: l.endDate,
            residualDebt: l.residualDebt,
            residualDebtTaxable: l.residualDebtTaxable,
            buyoutValue: l.buyoutValue,
            notes: l.notes,
          }))}
        />
      </section>

      {/* Scadenze */}
      <section className="space-y-3">
        <h2 className={sectionTitle}>Scadenze</h2>
        <DeadlinesManager
          isAdmin={isAdmin}
          fixedCarId={id}
          items={deadlines.map((d) => ({
            id: d.id,
            carId: d.carId,
            carCode: null,
            type: d.type,
            dueDate: d.dueDate,
            amount: d.amount,
            status: d.status,
            notes: d.notes,
          }))}
        />
      </section>

      {/* Movimenti collegati */}
      <section className="space-y-3">
        <h2 className={sectionTitle}>Movimenti collegati ({txs.length})</h2>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Totale</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-20 text-center text-muted-foreground">
                    Nessun movimento collegato a questo veicolo.
                  </TableCell>
                </TableRow>
              ) : (
                txs.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(t.date)}</TableCell>
                    <TableCell>{t.direction === "entrata" ? "Entrata" : "Uscita"}</TableCell>
                    <TableCell>
                      {t.counterparty ?? "—"}
                      {t.description ? (
                        <span className="text-muted-foreground"> · {t.description}</span>
                      ) : null}
                    </TableCell>
                    <TableCell>{t.category?.name ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">{formatEUR(t.total)}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/movimenti/${t.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        Apri
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
