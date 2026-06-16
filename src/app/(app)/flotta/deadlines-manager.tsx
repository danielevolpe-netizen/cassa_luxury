"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createDeadline,
  deleteDeadline,
  updateDeadline,
  type FormState,
} from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { formatDate } from "@/lib/format";
import { formatEUR } from "@/lib/money";

export type Option = { value: string; label: string };

export type DeadlineItem = {
  id: string;
  carId: string | null;
  carCode: string | null;
  type: "assicurazione" | "bollo" | "revisione" | "leasing" | "altro";
  dueDate: string;
  amount: string | null;
  status: "aperta" | "pagata" | "annullata";
  notes: string | null;
};

const input =
  "w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";
const empty: FormState = {};

const TYPES = [
  { value: "assicurazione", label: "Assicurazione" },
  { value: "bollo", label: "Bollo" },
  { value: "revisione", label: "Revisione" },
  { value: "leasing", label: "Leasing" },
  { value: "altro", label: "Altro" },
];
const STATUSES = [
  { value: "aperta", label: "Aperta" },
  { value: "pagata", label: "Pagata" },
  { value: "annullata", label: "Annullata" },
];

// Versione pura dell'alert (no import server-side).
function alertOf(dueDate: string, status: string) {
  if (status !== "aperta") return "chiusa";
  const due = new Date(dueDate + "T00:00:00");
  const days = Math.floor((due.getTime() - Date.now()) / 86400000);
  if (days < 0) return "scaduta";
  if (days <= 30) return "in_scadenza";
  return "ok";
}

function AlertBadge({ dueDate, status }: { dueDate: string; status: string }) {
  const a = alertOf(dueDate, status);
  const map: Record<string, [string, string]> = {
    scaduta: ["Scaduta", "bg-red-100 text-red-700"],
    in_scadenza: ["In scadenza", "bg-amber-100 text-amber-700"],
    ok: ["OK", "bg-green-100 text-green-700"],
    chiusa: [status === "pagata" ? "Pagata" : "Chiusa", "bg-neutral-200 text-neutral-600"],
  };
  const [label, cls] = map[a];
  return <span className={"rounded px-1.5 py-0.5 text-xs font-medium " + cls}>{label}</span>;
}

function Fields({
  d,
  cars,
  fixedCarId,
}: {
  d?: DeadlineItem;
  cars?: Option[];
  fixedCarId?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {fixedCarId ? (
        <input type="hidden" name="carId" value={fixedCarId} />
      ) : (
        <select name="carId" defaultValue={d?.carId ?? ""} className={input + " w-48"}>
          <option value="">— nessuna auto —</option>
          {cars?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
      <select name="type" defaultValue={d?.type ?? "assicurazione"} className={input + " w-36"}>
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input name="dueDate" type="date" defaultValue={d?.dueDate ?? ""} required className={input + " w-40"} />
      <input name="amount" type="number" step="0.01" placeholder="importo €" defaultValue={d?.amount ?? ""} className={input + " w-28"} />
      <select name="status" defaultValue={d?.status ?? "aperta"} className={input + " w-32"}>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <input name="notes" placeholder="note" defaultValue={d?.notes ?? ""} className={input + " flex-1"} />
    </div>
  );
}

function EditRow({
  d,
  cars,
  fixedCarId,
}: {
  d: DeadlineItem;
  cars?: Option[];
  fixedCarId?: string;
}) {
  const [state, action, pending] = useActionState(
    updateDeadline.bind(null, d.id),
    empty,
  );
  return (
    <form action={action} className="space-y-2 rounded-lg border border-neutral-200 p-2">
      <div className="flex items-center gap-2">
        <AlertBadge dueDate={d.dueDate} status={d.status} />
        <Fields d={d} cars={cars} fixedCarId={fixedCarId} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-md border border-neutral-300 px-3 py-1 text-sm font-medium hover:bg-neutral-100 disabled:opacity-60">
          Salva
        </button>
        <DeleteButton action={deleteDeadline.bind(null, d.id)} message="Eliminare questa scadenza?" />
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      </div>
    </form>
  );
}

function ReadRow({ d }: { d: DeadlineItem }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 p-2 text-sm">
      <AlertBadge dueDate={d.dueDate} status={d.status} />
      <span className="font-medium">{TYPES.find((t) => t.value === d.type)?.label}</span>
      {d.carCode ? <span className="text-neutral-500">{d.carCode}</span> : null}
      <span>{formatDate(d.dueDate)}</span>
      <span>{d.amount ? formatEUR(d.amount) : ""}</span>
      {d.notes ? <span className="text-neutral-500">{d.notes}</span> : null}
    </div>
  );
}

function CreateRow({ cars, fixedCarId }: { cars?: Option[]; fixedCarId?: string }) {
  const [state, action, pending] = useActionState(createDeadline, empty);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form
      ref={ref}
      action={action}
      className="space-y-2 rounded-lg border border-dashed border-neutral-300 p-2"
    >
      <p className="text-sm font-medium text-neutral-600">Aggiungi scadenza</p>
      <Fields cars={cars} fixedCarId={fixedCarId} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-md bg-neutral-900 px-3 py-1 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60">
          Aggiungi
        </button>
        {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      </div>
    </form>
  );
}

export function DeadlinesManager({
  items,
  isAdmin,
  cars,
  fixedCarId,
}: {
  items: DeadlineItem[];
  isAdmin: boolean;
  cars?: Option[];
  fixedCarId?: string;
}) {
  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Nessuna scadenza.</p>
      ) : (
        items.map((d) =>
          isAdmin ? (
            <EditRow key={d.id} d={d} cars={cars} fixedCarId={fixedCarId} />
          ) : (
            <ReadRow key={d.id} d={d} />
          ),
        )
      )}
      {isAdmin ? <CreateRow cars={cars} fixedCarId={fixedCarId} /> : null}
    </div>
  );
}
