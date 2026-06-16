"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createPaymentMethod,
  deletePaymentMethod,
  updatePaymentMethod,
  type FormState,
} from "./actions";
import { DeleteButton } from "@/components/delete-button";

type Method = { id: string; name: string; active: boolean };

const input =
  "w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-neutral-900";
const empty: FormState = {};

function CreateForm() {
  const [state, action, pending] = useActionState(createPaymentMethod, empty);
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

function EditRow({ m }: { m: Method }) {
  const [state, action, pending] = useActionState(
    updatePaymentMethod.bind(null, m.id),
    empty,
  );
  return (
    <form
      action={action}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 p-2"
    >
      <input name="name" defaultValue={m.name} required className={input + " flex-1"} />
      <label className="flex items-center gap-1 text-sm text-neutral-600">
        <input type="checkbox" name="active" defaultChecked={m.active} /> attivo
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 disabled:opacity-60"
      >
        Salva
      </button>
      <DeleteButton
        action={deletePaymentMethod.bind(null, m.id)}
        message={`Eliminare il metodo "${m.name}"?`}
      />
      {state.error ? (
        <p className="w-full text-sm text-red-600">{state.error}</p>
      ) : null}
    </form>
  );
}

export function PaymentMethodsManager({ items }: { items: Method[] }) {
  return (
    <div className="space-y-4">
      <CreateForm />
      <div className="space-y-2">
        {items.map((m) => (
          <EditRow key={m.id} m={m} />
        ))}
      </div>
    </div>
  );
}
