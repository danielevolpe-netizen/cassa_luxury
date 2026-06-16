import { getCurrentUser } from "@/lib/auth-helpers";
import { getAllCars } from "@/lib/data/cars";
import { deadlineAlert, listDeadlines } from "@/lib/data/deadlines";
import { DeadlinesManager } from "../flotta/deadlines-manager";

export default async function ScadenzePage() {
  const [user, deadlines, cars] = await Promise.all([
    getCurrentUser(),
    listDeadlines(),
    getAllCars(),
  ]);
  const isAdmin = user?.role === "admin";

  let scadute = 0;
  let inScadenza = 0;
  for (const d of deadlines) {
    const a = deadlineAlert(d.dueDate, d.status);
    if (a === "scaduta") scadute++;
    else if (a === "in_scadenza") inScadenza++;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Scadenze</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-xs text-neutral-500">Scadute</p>
          <p className="text-xl font-semibold text-red-700">{scadute}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-xs text-neutral-500">In scadenza (≤30gg)</p>
          <p className="text-xl font-semibold text-amber-700">{inScadenza}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-3">
          <p className="text-xs text-neutral-500">Totale aperte/registrate</p>
          <p className="text-xl font-semibold">{deadlines.length}</p>
        </div>
      </div>

      <DeadlinesManager
        isAdmin={isAdmin}
        cars={cars.map((c) => ({ value: c.id, label: c.code }))}
        items={deadlines.map((d) => ({
          id: d.id,
          carId: d.carId,
          carCode: d.car?.code ?? null,
          type: d.type,
          dueDate: d.dueDate,
          amount: d.amount,
          status: d.status,
          notes: d.notes,
        }))}
      />
    </div>
  );
}
