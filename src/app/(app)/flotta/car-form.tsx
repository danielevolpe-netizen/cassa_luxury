"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "./actions";
import { nativeSelect } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Option = { value: string; label: string };

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
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="code">Codice (Modello | Targa) *</Label>
        <Input
          id="code"
          name="code"
          defaultValue={defaults?.code ?? ""}
          required
          placeholder="es. 812 GTS | GM812BW"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="brand">Brand</Label>
        <Input id="brand" name="brand" defaultValue={defaults?.brand ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="model">Modello *</Label>
        <Input id="model" name="model" defaultValue={defaults?.model ?? ""} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="plate">Targa</Label>
        <Input id="plate" name="plate" defaultValue={defaults?.plate ?? ""} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="companyId">Società</Label>
        <select id="companyId" name="companyId" defaultValue={defaults?.companyId ?? ""} className={nativeSelect + " w-full"}>
          <option value="">—</option>
          {companies.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="status">Stato</Label>
        <select id="status" name="status" defaultValue={defaults?.status ?? "attiva"} className={nativeSelect + " w-full"}>
          <option value="attiva">Attiva</option>
          <option value="in_arrivo">In arrivo</option>
          <option value="venduta">Venduta</option>
        </select>
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="notes">Note</Label>
        <Input id="notes" name="notes" defaultValue={defaults?.notes ?? ""} />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>
      ) : null}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvataggio…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
