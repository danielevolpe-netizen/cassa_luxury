"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCompany,
  deleteCompany,
  updateCompany,
  type FormState,
} from "./actions";
import { DeleteButton } from "@/components/delete-button";

type Company = {
  id: string;
  name: string;
  code: string | null;
  active: boolean;
  notes: string | null;
};

const input =
  "w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";
const empty: FormState = {};

function CreateForm() {
  const [state, action, pending] = useActionState(createCompany, empty);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form
      ref={ref}
      action={action}
      className="flex flex-wrap items-end gap-2 rounded-lg border border-neutral-200 p-3"
    >
      <div className="flex-1 space-y-1">
        <label className="text-xs text-neutral-500">Nome *</label>
        <input name="name" required className={input} />
      </div>
      <div className="w-40 space-y-1">
        <label className="text-xs text-neutral-500">Codice</label>
        <input name="code" className={input} />
      </div>
      <div className="flex-1 space-y-1">
        <label className="text-xs text-neutral-500">Note</label>
        <input name="notes" className={input} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        + Aggiungi
      </button>
      {state.error ? (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

function EditRow({ c }: { c: Company }) {
  const [state, action, pending] = useActionState(
    updateCompany.bind(null, c.id),
    empty,
  );
  return (
    <form
      action={action}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 p-2"
    >
      <input name="name" defaultValue={c.name} required className={input + " flex-1"} />
      <input
        name="code"
        defaultValue={c.code ?? ""}
        placeholder="codice"
        className={input + " w-32"}
      />
      <input
        name="notes"
        defaultValue={c.notes ?? ""}
        placeholder="note"
        className={input + " flex-1"}
      />
      <label className="flex items-center gap-1 text-sm text-neutral-600">
        <input type="checkbox" name="active" defaultChecked={c.active} /> attiva
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 disabled:opacity-60"
      >
        Salva
      </button>
      <DeleteButton
        action={deleteCompany.bind(null, c.id)}
        message={`Eliminare la società "${c.name}"? I movimenti collegati resteranno senza società.`}
      />
      {state.error ? (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

export function CompaniesManager({ items }: { items: Company[] }) {
  return (
    <div className="space-y-4">
      <CreateForm />
      <div className="space-y-2">
        {items.map((c) => (
          <EditRow key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
