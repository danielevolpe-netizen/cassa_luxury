"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "./actions";

export type Option = { value: string; label: string };

const input =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";
const label = "text-sm font-medium text-neutral-700";

export type CarDefaults = {
  code: string;
  brand: string;
  model: string;
  plate: string;
  companyId: string;
  status: "attiva" | "venduta" | "in_arrivo";
  notes: string;
};

export function CarForm({
  action,
  companies,
  defaults,
  submitLabel,
  resetOnSuccess = false,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  companies: Option[];
  defaults?: Partial<CarDefaults>;
  submitLabel: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={ref}
      action={formAction}
      className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div className="space-y-1 sm:col-span-2">
        <label className={label} htmlFor="code">
          Codice (Modello | Targa) *
        </label>
        <input
          id="code"
          name="code"
          defaultValue={defaults?.code ?? ""}
          required
          placeholder="es. 812 GTS | GM812BW"
          className={input}
        />
      </div>
      <div className="space-y-1">
        <label className={label} htmlFor="brand">
          Brand
        </label>
        <input id="brand" name="brand" defaultValue={defaults?.brand ?? ""} className={input} />
      </div>
      <div className="space-y-1">
        <label className={label} htmlFor="model">
          Modello *
        </label>
        <input id="model" name="model" defaultValue={defaults?.model ?? ""} required className={input} />
      </div>
      <div className="space-y-1">
        <label className={label} htmlFor="plate">
          Targa
        </label>
        <input id="plate" name="plate" defaultValue={defaults?.plate ?? ""} className={input} />
      </div>
      <div className="space-y-1">
        <label className={label} htmlFor="companyId">
          Società
        </label>
        <select
          id="companyId"
          name="companyId"
          defaultValue={defaults?.companyId ?? ""}
          className={input}
        >
          <option value="">—</option>
          {companies.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className={label} htmlFor="status">
          Stato
        </label>
        <select
          id="status"
          name="status"
          defaultValue={defaults?.status ?? "attiva"}
          className={input}
        >
          <option value="attiva">Attiva</option>
          <option value="in_arrivo">In arrivo</option>
          <option value="venduta">Venduta</option>
        </select>
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className={label} htmlFor="notes">
          Note
        </label>
        <input id="notes" name="notes" defaultValue={defaults?.notes ?? ""} className={input} />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>
      ) : null}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
        >
          {pending ? "Salvataggio…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
