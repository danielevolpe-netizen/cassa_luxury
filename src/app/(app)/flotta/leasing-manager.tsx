"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createLeasing,
  deleteLeasing,
  updateLeasing,
  type FormState,
} from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEUR } from "@/lib/money";

export type Leasing = {
  id: string;
  lessor: string | null;
  monthlyTaxable: string;
  monthlyVat: string;
  monthlyTotal: string;
  startDate: string | null;
  endDate: string | null;
  residualDebt: string | null;
  residualDebtTaxable: string | null;
  buyoutValue: string | null;
  notes: string | null;
};

const empty: FormState = {};
const lbl = "text-xs text-muted-foreground";

function Fields({ l }: { l?: Leasing }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="space-y-1 sm:col-span-2">
        <Label className={lbl}>Ente / Lessor</Label>
        <Input name="lessor" defaultValue={l?.lessor ?? ""} />
      </div>
      <div className="space-y-1">
        <Label className={lbl}>Canone imponibile €</Label>
        <Input name="monthlyTaxable" type="number" step="0.01" defaultValue={l?.monthlyTaxable ?? "0"} />
      </div>
      <div className="space-y-1">
        <Label className={lbl}>Canone IVA €</Label>
        <Input name="monthlyVat" type="number" step="0.01" defaultValue={l?.monthlyVat ?? "0"} />
      </div>
      <div className="space-y-1">
        <Label className={lbl}>Canone totale €</Label>
        <Input name="monthlyTotal" type="number" step="0.01" defaultValue={l?.monthlyTotal ?? "0"} />
      </div>
      <div className="space-y-1">
        <Label className={lbl}>Inizio</Label>
        <Input name="startDate" type="date" defaultValue={l?.startDate ?? ""} />
      </div>
      <div className="space-y-1">
        <Label className={lbl}>Fine</Label>
        <Input name="endDate" type="date" defaultValue={l?.endDate ?? ""} />
      </div>
      <div className="space-y-1">
        <Label className={lbl}>Debito residuo €</Label>
        <Input name="residualDebt" type="number" step="0.01" defaultValue={l?.residualDebt ?? ""} />
      </div>
      <div className="space-y-1">
        <Label className={lbl}>Debito residuo imp. €</Label>
        <Input name="residualDebtTaxable" type="number" step="0.01" defaultValue={l?.residualDebtTaxable ?? ""} />
      </div>
      <div className="space-y-1">
        <Label className={lbl}>Valore riscatto €</Label>
        <Input name="buyoutValue" type="number" step="0.01" defaultValue={l?.buyoutValue ?? ""} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label className={lbl}>Note</Label>
        <Input name="notes" defaultValue={l?.notes ?? ""} />
      </div>
    </div>
  );
}

function EditCard({ l, carId }: { l: Leasing; carId: string }) {
  const [state, action, pending] = useActionState(
    updateLeasing.bind(null, l.id, carId),
    empty,
  );
  return (
    <form action={action} className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <Fields l={l} />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          Salva
        </Button>
        <DeleteButton action={deleteLeasing.bind(null, l.id, carId)} message="Eliminare questo contratto di leasing?" />
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      </div>
    </form>
  );
}

function CreateCard({ carId }: { carId: string }) {
  const [state, action, pending] = useActionState(
    createLeasing.bind(null, carId),
    empty,
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-3 rounded-xl border border-dashed bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">
        Aggiungi contratto di leasing
      </p>
      <Fields />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          Aggiungi
        </Button>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      </div>
    </form>
  );
}

function ReadOnly({ l }: { l: Leasing }) {
  return (
    <Card className="gap-1 p-4 text-sm">
      <div className="font-medium">{l.lessor ?? "Contratto"}</div>
      <div className="text-muted-foreground">
        Canone: {formatEUR(l.monthlyTotal)} · Debito residuo:{" "}
        {l.residualDebt ? formatEUR(l.residualDebt) : "—"} · Riscatto:{" "}
        {l.buyoutValue ? formatEUR(l.buyoutValue) : "—"}
      </div>
    </Card>
  );
}

export function LeasingManager({
  carId,
  items,
  isAdmin,
}: {
  carId: string;
  items: Leasing[];
  isAdmin: boolean;
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessun contratto di leasing.</p>
      ) : (
        items.map((l) =>
          isAdmin ? (
            <EditCard key={l.id} l={l} carId={carId} />
          ) : (
            <ReadOnly key={l.id} l={l} />
          ),
        )
      )}
      {isAdmin ? <CreateCard carId={carId} /> : null}
    </div>
  );
}
