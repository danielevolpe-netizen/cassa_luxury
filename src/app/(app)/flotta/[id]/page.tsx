import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getCar } from "@/lib/data/cars";
import { getActiveCompanies } from "@/lib/data/lookups";
import { listTransactions } from "@/lib/data/transactions";
import { formatDate } from "@/lib/format";
import { formatEUR } from "@/lib/money";
import { deleteCar, updateCar } from "../actions";
import { CarForm } from "../car-form";
import { DeleteButton } from "@/components/delete-button";
import { LeasingManager } from "../leasing-manager";
import { DeadlinesManager } from "../deadlines-manager";
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

const sectionTitle =
  "text-sm font-semibold uppercase tracking-wide text-muted-foreground";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, car] = await Promise.all([getCurrentUser(), getCar(id)]);
  if (!car) notFound();

  const isAdmin = user?.role === "admin";
  const [companies, txs] = await Promise.all([
    getActiveCompanies(),
    listTransactions({ carId: id }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/flotta" className="text-sm text-muted-foreground hover:underline">
            ← Flotta
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{car.code}</h1>
          <p className="text-sm text-muted-foreground">
            {car.brand ?? ""} {car.company?.name ? `· ${car.company.name}` : ""}
          </p>
        </div>
        {isAdmin ? (
          <DeleteButton
            action={deleteCar.bind(null, car.id)}
            message={`Eliminare l'auto "${car.code}"? Verranno eliminati anche i suoi contratti di leasing e scadenze.`}
            label="Elimina auto"
          />
        ) : null}
      </div>

      {/* Dati auto */}
      <section className="space-y-3">
        <h2 className={sectionTitle}>Dati auto</h2>
        {isAdmin ? (
          <CarForm
            action={updateCar.bind(null, car.id)}
            companies={companies.map((c) => ({ value: c.id, label: c.name }))}
            defaults={{
              code: car.code,
              brand: car.brand ?? "",
              model: car.model,
              plate: car.plate ?? "",
              companyId: car.companyId ?? "",
              status: car.status,
              notes: car.notes ?? "",
            }}
            submitLabel="Salva modifiche"
          />
        ) : (
          <Card className="gap-1 p-4 text-sm">
            <p>Modello: {car.model}</p>
            <p>Targa: {car.plate ?? "—"}</p>
            <p>Stato: {car.status}</p>
            {car.notes ? <p>Note: {car.notes}</p> : null}
          </Card>
        )}
      </section>

      {/* Leasing */}
      <section className="space-y-3">
        <h2 className={sectionTitle}>Contratti di leasing</h2>
        <LeasingManager
          carId={car.id}
          isAdmin={isAdmin}
          items={car.leasingContracts.map((l) => ({
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
          fixedCarId={car.id}
          items={car.deadlines.map((d) => ({
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
                    Nessun movimento collegato a questa auto.
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
