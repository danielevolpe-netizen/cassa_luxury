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
          <Link href="/flotta" className="text-sm text-neutral-500 hover:underline">
            ← Flotta
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{car.code}</h1>
          <p className="text-sm text-neutral-500">
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Dati auto
        </h2>
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
          <div className="rounded-lg border border-neutral-200 p-4 text-sm">
            <p>Modello: {car.model}</p>
            <p>Targa: {car.plate ?? "—"}</p>
            <p>Stato: {car.status}</p>
            {car.notes ? <p>Note: {car.notes}</p> : null}
          </div>
        )}
      </section>

      {/* Leasing */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Contratti di leasing
        </h2>
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Scadenze
        </h2>
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Movimenti collegati ({txs.length})
        </h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">Data</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Descrizione</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2 text-right">Totale</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-neutral-500">
                    Nessun movimento collegato a questa auto.
                  </td>
                </tr>
              ) : (
                txs.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50">
                    <td className="whitespace-nowrap px-3 py-2">{formatDate(t.date)}</td>
                    <td className="px-3 py-2">
                      {t.direction === "entrata" ? "Entrata" : "Uscita"}
                    </td>
                    <td className="px-3 py-2">
                      {t.counterparty ?? "—"}
                      {t.description ? (
                        <span className="text-neutral-500"> · {t.description}</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">{t.category?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-medium">
                      {formatEUR(t.total)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/movimenti/${t.id}`}
                        className="text-neutral-700 hover:underline"
                      >
                        Apri
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
