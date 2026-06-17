"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCompany,
  deleteCompany,
  updateCompany,
  type FormState,
} from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Company = {
  id: string;
  name: string;
  code: string | null;
  active: boolean;
  notes: string | null;
};

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
      className="flex flex-wrap items-end gap-2 rounded-lg border p-3"
    >
      <div className="flex-1 space-y-1">
        <Label className="text-xs text-muted-foreground">Nome *</Label>
        <Input name="name" required />
      </div>
      <div className="w-40 space-y-1">
        <Label className="text-xs text-muted-foreground">Codice</Label>
        <Input name="code" />
      </div>
      <div className="flex-1 space-y-1">
        <Label className="text-xs text-muted-foreground">Note</Label>
        <Input name="notes" />
      </div>
      <Button type="submit" disabled={pending}>
        + Aggiungi
      </Button>
      {state.error ? (
        <p className="w-full text-sm text-destructive">{state.error}</p>
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
    <form action={action} className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
      <Input name="name" defaultValue={c.name} required className="flex-1" />
      <Input name="code" defaultValue={c.code ?? ""} placeholder="codice" className="w-32" />
      <Input name="notes" defaultValue={c.notes ?? ""} placeholder="note" className="flex-1" />
      <Label className="flex items-center gap-1.5 font-normal text-muted-foreground">
        <Checkbox name="active" defaultChecked={c.active} /> attiva
      </Label>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Salva
      </Button>
      <DeleteButton
        action={deleteCompany.bind(null, c.id)}
        message={`Eliminare la società "${c.name}"? I movimenti collegati resteranno senza società.`}
      />
      {state.error ? (
        <p className="w-full text-sm text-destructive">{state.error}</p>
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
