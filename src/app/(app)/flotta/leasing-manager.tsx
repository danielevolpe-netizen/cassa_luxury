"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createLeasing,
  deleteLeasing,
  updateLeasing,
  type FormState,
} from "./actions";
import { DeleteButton } from "@/components/delete-button";
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

const input =
  "w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";
const lbl = "text-xs text-neutral-500";
const empty: FormState = {};

function Fields({ l }: { l?: Leasing }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="space-y-1 sm:col-span-2">
        <label className={lbl}>Ente / Lessor</label>
        <input name="lessor" defaultValue={l?.lessor ?? ""} className={input} />
      </div>
      <div className="space-y-1">
        <label className={lbl}>Canone imponibile €</label>
        <input name="monthlyTaxable" type="number" step="0.01" defaultValue={l?.monthlyTaxable ?? "0"} className={input} />
      </div>
      <div className="space-y-1">
        <label className={lbl}>Canone IVA €</label>
        <input name="monthlyVat" type="number" step="0.01" defaultValue={l?.monthlyVat ?? "0"} className={input} />
      </div>
      <div className="space-y-1">
        <label className={lbl}>Canone totale €</label>
        <input name="monthlyTotal" type="number" step="0.01" defaultValue={l?.monthlyTotal ?? "0"} className={input} />
      </div>
      <div className="space-y-1">
        <label className={lbl}>Inizio</label>
        <input name="startDate" type="date" defaultValue={l?.startDate ?? ""} className={input} />
      </div>
      <div className="space-y-1">
        <label className={lbl}>Fine</label>
        <input name="endDate" type="date" defaultValue={l?.endDate ?? ""} className={input} />
      </div>
      <div className="space-y-1">
        <label className={lbl}>Debito residuo €</label>
        <input name="residualDebt" type="number" step="0.01" defaultValue={l?.residualDebt ?? ""} className={input} />
      </div>
      <div className="space-y-1">
        <label className={lbl}>Debito residuo imp. €</label>
        <input name="residualDebtTaxable" type="number" step="0.01" defaultValue={l?.residualDebtTaxable ?? ""} className={input} />
      </div>
      <div className="space-y-1">
        <label className={lbl}>Valore riscatto €</label>
        <input name="buyoutValue" type="number" step="0.01" defaultValue={l?.buyoutValue ?? ""} className={input} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className={lbl}>Note</label>
        <input name="notes" defaultValue={l?.notes ?? ""} className={input} />
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
    <form action={action} className="space-y-3 rounded-lg border border-neutral-200 p-4">
      <Fields l={l} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 disabled:opacity-60">
          Salva
        </button>
        <DeleteButton action={deleteLeasing.bind(null, l.id, carId)} message="Eliminare questo contratto di leasing?" />
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
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
    <form
      ref={ref}
      action={action}
      className="space-y-3 rounded-lg border border-dashed border-neutral-300 p-4"
    >
      <p className="text-sm font-medium text-neutral-600">
        Aggiungi contratto di leasing
      </p>
      <Fields />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60">
          Aggiungi
        </button>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      </div>
    </form>
  );
}

function ReadOnly({ l }: { l: Leasing }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4 text-sm">
      <div className="font-medium">{l.lessor ?? "Contratto"}</div>
      <div className="mt-1 text-neutral-600">
        Canone: {formatEUR(l.monthlyTotal)} · Debito residuo:{" "}
        {l.residualDebt ? formatEUR(l.residualDebt) : "—"} · Riscatto:{" "}
        {l.buyoutValue ? formatEUR(l.buyoutValue) : "—"}
      </div>
    </div>
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
        <p className="text-sm text-neutral-500">Nessun contratto di leasing.</p>
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
