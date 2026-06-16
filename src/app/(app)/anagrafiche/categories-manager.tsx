"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type FormState,
} from "./actions";
import { DeleteButton } from "@/components/delete-button";

type Category = {
  id: string;
  name: string;
  kind: "costo" | "ricavo" | "entrambi";
  sortOrder: number;
  active: boolean;
};

const input =
  "w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";
const empty: FormState = {};

const KINDS = [
  { value: "costo", label: "Costo" },
  { value: "ricavo", label: "Ricavo" },
  { value: "entrambi", label: "Entrambi" },
];

function CreateForm() {
  const [state, action, pending] = useActionState(createCategory, empty);
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
      <div className="w-36 space-y-1">
        <label className="text-xs text-neutral-500">Tipo</label>
        <select name="kind" defaultValue="entrambi" className={input}>
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-24 space-y-1">
        <label className="text-xs text-neutral-500">Ordine</label>
        <input name="sortOrder" type="number" defaultValue={0} className={input} />
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

function EditRow({ c }: { c: Category }) {
  const [state, action, pending] = useActionState(
    updateCategory.bind(null, c.id),
    empty,
  );
  return (
    <form
      action={action}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 p-2"
    >
      <input name="name" defaultValue={c.name} required className={input + " flex-1"} />
      <select name="kind" defaultValue={c.kind} className={input + " w-36"}>
        {KINDS.map((k) => (
          <option key={k.value} value={k.value}>
            {k.label}
          </option>
        ))}
      </select>
      <input
        name="sortOrder"
        type="number"
        defaultValue={c.sortOrder}
        className={input + " w-20"}
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
        action={deleteCategory.bind(null, c.id)}
        message={`Eliminare la categoria "${c.name}"?`}
      />
      {state.error ? (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

export function CategoriesManager({ items }: { items: Category[] }) {
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
