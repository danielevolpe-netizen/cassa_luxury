"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createPaymentMethod,
  deletePaymentMethod,
  updatePaymentMethod,
  type FormState,
} from "./actions";
import { DeleteButton } from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Method = { id: string; name: string; active: boolean };

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
      className="flex flex-wrap items-end gap-2 rounded-lg border p-3"
    >
      <div className="flex-1 space-y-1">
        <Label className="text-xs text-muted-foreground">Nome *</Label>
        <Input name="name" required />
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

function EditRow({ m }: { m: Method }) {
  const [state, action, pending] = useActionState(
    updatePaymentMethod.bind(null, m.id),
    empty,
  );
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2">
      <form action={action} className="flex flex-1 flex-wrap items-center gap-2">
        <Input name="name" defaultValue={m.name} required className="flex-1" />
        <Label className="flex items-center gap-1.5 font-normal text-muted-foreground">
          <Checkbox name="active" defaultChecked={m.active} /> attivo
        </Label>
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          Salva
        </Button>
        {state.error ? (
          <p className="w-full text-sm text-destructive">{state.error}</p>
        ) : null}
      </form>
      <DeleteButton
        action={deletePaymentMethod.bind(null, m.id)}
        message={`Eliminare il metodo "${m.name}"?`}
      />
    </div>
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
