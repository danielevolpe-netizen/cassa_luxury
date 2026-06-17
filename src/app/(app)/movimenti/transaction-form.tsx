"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { FormState } from "./actions";
import { computeVat, round2 } from "@/lib/money";
import { todayISO } from "@/lib/format";
import { nativeSelect } from "@/lib/ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type Option = { value: string; label: string };

export type TransactionDefaults = {
  direction: "entrata" | "uscita";
  date: string;
  competenceDate: string;
  companyId: string;
  categoryId: string;
  carId: string;
  counterparty: string;
  description: string;
  taxable: string;
  vatRate: string;
  vatAmount: string;
  fee: string;
  total: string;
  amountPaid: string;
  paymentMethodId: string;
  notes: string;
};

const EMPTY: TransactionDefaults = {
  direction: "uscita",
  date: "",
  competenceDate: "",
  companyId: "",
  categoryId: "",
  carId: "",
  counterparty: "",
  description: "",
  taxable: "",
  vatRate: "22",
  vatAmount: "",
  fee: "",
  total: "",
  amountPaid: "",
  paymentMethodId: "",
  notes: "",
};

export function TransactionForm({
  action,
  companies,
  categories,
  cars,
  paymentMethods,
  defaults,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  companies: Option[];
  categories: Option[];
  cars: Option[];
  paymentMethods: Option[];
  defaults?: Partial<TransactionDefaults>;
  submitLabel: string;
}) {
  const init = { ...EMPTY, date: todayISO(), ...defaults };
  const [state, formAction, pending] = useActionState(action, {});

  const [taxable, setTaxable] = useState(init.taxable);
  const [vatRate, setVatRate] = useState(init.vatRate);
  const [manual, setManual] = useState(false);
  const [vatAmount, setVatAmount] = useState(init.vatAmount);
  const [total, setTotal] = useState(init.total);

  const computed = useMemo(() => {
    const t = Number(taxable || 0);
    const r = Number(vatRate || 0);
    return computeVat(t, r);
  }, [taxable, vatRate]);

  const shownVat = manual ? vatAmount : computed.vat.toFixed(2);
  const shownTotal = manual ? total : computed.total.toFixed(2);

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="direction">Tipo</Label>
          <select
            id="direction"
            name="direction"
            defaultValue={init.direction}
            className={nativeSelect + " w-full"}
          >
            <option value="uscita">Uscita</option>
            <option value="entrata">Entrata</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">Data</Label>
            <Input id="date" name="date" type="date" defaultValue={init.date} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="competenceDate">Competenza</Label>
            <Input
              id="competenceDate"
              name="competenceDate"
              type="date"
              defaultValue={init.competenceDate}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="companyId">Società</Label>
          <select id="companyId" name="companyId" defaultValue={init.companyId} className={nativeSelect + " w-full"}>
            <option value="">—</option>
            {companies.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Categoria</Label>
          <select id="categoryId" name="categoryId" defaultValue={init.categoryId} className={nativeSelect + " w-full"}>
            <option value="">—</option>
            {categories.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="carId">Auto</Label>
          <select id="carId" name="carId" defaultValue={init.carId} className={nativeSelect + " w-full"}>
            <option value="">—</option>
            {cars.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="paymentMethodId">Metodo di pagamento</Label>
          <select id="paymentMethodId" name="paymentMethodId" defaultValue={init.paymentMethodId} className={nativeSelect + " w-full"}>
            <option value="">—</option>
            {paymentMethods.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="counterparty">Mittente / Destinatario</Label>
          <Input id="counterparty" name="counterparty" defaultValue={init.counterparty} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descrizione</Label>
          <Input id="description" name="description" defaultValue={init.description} />
        </div>
      </div>

      {/* Importi */}
      <Card className="gap-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Importi</h2>
          <Label className="flex items-center gap-2 font-normal text-muted-foreground">
            <Checkbox
              checked={manual}
              onCheckedChange={(v) => {
                const on = v === true;
                setManual(on);
                if (on) {
                  setVatAmount(computed.vat.toFixed(2));
                  setTotal(computed.total.toFixed(2));
                }
              }}
            />
            Importi manuali
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="taxable">Imponibile €</Label>
            <Input
              id="taxable"
              name="taxable"
              type="number"
              step="0.01"
              min="0"
              value={taxable}
              onChange={(e) => setTaxable(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vatRate">Aliquota IVA %</Label>
            <Input
              id="vatRate"
              name="vatRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vatAmount">IVA €</Label>
            <Input
              id="vatAmount"
              name="vatAmount"
              type="number"
              step="0.01"
              value={shownVat}
              readOnly={!manual}
              onChange={(e) => setVatAmount(e.target.value)}
              className={manual ? "" : "bg-muted"}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="total">Totale €</Label>
            <Input
              id="total"
              name="total"
              type="number"
              step="0.01"
              value={shownTotal}
              readOnly={!manual}
              onChange={(e) => setTotal(e.target.value)}
              className={"font-semibold " + (manual ? "" : "bg-muted")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fee">Fee € (commissione/margine)</Label>
            <Input id="fee" name="fee" type="number" step="0.01" defaultValue={init.fee || "0"} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amountPaid">Importo pagato €</Label>
            <Input
              id="amountPaid"
              name="amountPaid"
              type="number"
              step="0.01"
              defaultValue={init.amountPaid}
              placeholder="vuoto = non pagato"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Residuo:{" "}
          {round2(Number(shownTotal || 0) - Number(init.amountPaid || 0)).toFixed(2)} €
          (ricalcolato al salvataggio)
        </p>
      </Card>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Note</Label>
        <Textarea id="notes" name="notes" defaultValue={init.notes} rows={2} />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvataggio…" : submitLabel}
        </Button>
        <Link href="/movimenti" className={buttonVariants({ variant: "outline" })}>
          Annulla
        </Link>
      </div>
    </form>
  );
}
