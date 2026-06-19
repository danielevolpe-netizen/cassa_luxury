import { getCurrentUser } from "@/lib/auth-helpers";
import { deadlineAlert, listDeadlines } from "@/lib/data/deadlines";
import { getRentVehicleMap, getRentVehicleOptions } from "@/lib/data/rent";
import { DeadlinesManager } from "../rent/deadlines-manager";
import { Card } from "@/components/ui/card";

export default async function ScadenzePage() {
  const [user, deadlines, vehicleOptions, vehicleMap] = await Promise.all([
    getCurrentUser(),
    listDeadlines(),
    getRentVehicleOptions(),
    getRentVehicleMap(),
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
        <Card className="gap-0 p-3">
          <p className="text-xs text-muted-foreground">Scadute</p>
          <p className="text-xl font-semibold text-red-700">{scadute}</p>
        </Card>
        <Card className="gap-0 p-3">
          <p className="text-xs text-muted-foreground">In scadenza (≤30gg)</p>
          <p className="text-xl font-semibold text-amber-700">{inScadenza}</p>
        </Card>
        <Card className="gap-0 p-3">
          <p className="text-xs text-muted-foreground">Totale aperte/registrate</p>
          <p className="text-xl font-semibold">{deadlines.length}</p>
        </Card>
      </div>

      <DeadlinesManager
        isAdmin={isAdmin}
        cars={vehicleOptions}
        items={deadlines.map((d) => ({
          id: d.id,
          carId: d.carId,
          carCode: d.carId ? (vehicleMap.get(d.carId) ?? null) : null,
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
