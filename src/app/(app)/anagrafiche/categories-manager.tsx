"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  type FormState,
} from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nativeSelect } from "@/lib/ui";

type Category = {
  id: string;
  name: string;
  kind: "costo" | "ricavo" | "entrambi";
  sortOrder: number;
  active: boolean;
};

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
      className="flex flex-wrap items-end gap-2 rounded-lg border p-3"
    >
      <div className="flex-1 space-y-1">
        <Label className="text-xs text-muted-foreground">Nome *</Label>
        <Input name="name" required />
      </div>
      <div className="w-36 space-y-1">
        <Label className="text-xs text-muted-foreground">Tipo</Label>
        <select name="kind" defaultValue="entrambi" className={nativeSelect + " w-full"}>
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>
      <div className="w-24 space-y-1">
        <Label className="text-xs text-muted-foreground">Ordine</Label>
        <Input name="sortOrder" type="number" defaultValue={0} />
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

function EditRow({ c }: { c: Category }) {
  const [state, action, pending] = useActionState(
    updateCategory.bind(null, c.id),
    empty,
  );
  return (
    <form action={action} className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
      <Input name="name" defaultValue={c.name} required className="flex-1" />
      <select name="kind" defaultValue={c.kind} className={nativeSelect + " w-36"}>
        {KINDS.map((k) => (
          <option key={k.value} value={k.value}>
            {k.label}
          </option>
        ))}
      </select>
      <Input name="sortOrder" type="number" defaultValue={c.sortOrder} className="w-20" />
      <Label className="flex items-center gap-1.5 font-normal text-muted-foreground">
        <Checkbox name="active" defaultChecked={c.active} /> attiva
      </Label>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Salva
      </Button>
      <DeleteButton
        action={deleteCategory.bind(null, c.id)}
        message={`Eliminare la categoria "${c.name}"?`}
      />
      {state.error ? (
        <p className="w-full text-sm text-destructive">{state.error}</p>
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
