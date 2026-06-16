"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import type { FormState } from "./actions";
import { computeVat, round2 } from "@/lib/money";
import { todayISO } from "@/lib/format";

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

const inputClass =
  "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";
const labelClass = "text-sm font-medium text-neutral-700";

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

  // Valori calcolati da imponibile + aliquota.
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
        <div className="space-y-1">
          <label className={labelClass} htmlFor="direction">
            Tipo
          </label>
          <select
            id="direction"
            name="direction"
            defaultValue={init.direction}
            className={inputClass}
          >
            <option value="uscita">Uscita</option>
            <option value="entrata">Entrata</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClass} htmlFor="date">
              Data
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={init.date}
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass} htmlFor="competenceDate">
              Competenza
            </label>
            <input
              id="competenceDate"
              name="competenceDate"
              type="date"
              defaultValue={init.competenceDate}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="companyId">
            Società
          </label>
          <select
            id="companyId"
            name="companyId"
            defaultValue={init.companyId}
            className={inputClass}
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
          <label className={labelClass} htmlFor="categoryId">
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={init.categoryId}
            className={inputClass}
          >
            <option value="">—</option>
            {categories.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="carId">
            Auto
          </label>
          <select
            id="carId"
            name="carId"
            defaultValue={init.carId}
            className={inputClass}
          >
            <option value="">—</option>
            {cars.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="paymentMethodId">
            Metodo di pagamento
          </label>
          <select
            id="paymentMethodId"
            name="paymentMethodId"
            defaultValue={init.paymentMethodId}
            className={inputClass}
          >
            <option value="">—</option>
            {paymentMethods.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="counterparty">
            Mittente / Destinatario
          </label>
          <input
            id="counterparty"
            name="counterparty"
            defaultValue={init.counterparty}
            className={inputClass}
          />
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="description">
            Descrizione
          </label>
          <input
            id="description"
            name="description"
            defaultValue={init.description}
            className={inputClass}
          />
        </div>
      </div>

      {/* Importi */}
      <div className="rounded-lg border border-neutral-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-800">Importi</h2>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={manual}
              onChange={(e) => {
                const on = e.target.checked;
                setManual(on);
                if (on) {
                  // Passa a manuale partendo dai valori calcolati.
                  setVatAmount(computed.vat.toFixed(2));
                  setTotal(computed.total.toFixed(2));
                }
              }}
            />
            Importi manuali
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className={labelClass} htmlFor="taxable">
              Imponibile €
            </label>
            <input
              id="taxable"
              name="taxable"
              type="number"
              step="0.01"
              min="0"
              value={taxable}
              onChange={(e) => setTaxable(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="vatRate">
              Aliquota IVA %
            </label>
            <input
              id="vatRate"
              name="vatRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="vatAmount">
              IVA €
            </label>
            <input
              id="vatAmount"
              name="vatAmount"
              type="number"
              step="0.01"
              value={shownVat}
              readOnly={!manual}
              onChange={(e) => setVatAmount(e.target.value)}
              className={inputClass + (manual ? "" : " bg-neutral-100")}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="total">
              Totale €
            </label>
            <input
              id="total"
              name="total"
              type="number"
              step="0.01"
              value={shownTotal}
              readOnly={!manual}
              onChange={(e) => setTotal(e.target.value)}
              className={
                inputClass +
                " font-semibold" +
                (manual ? "" : " bg-neutral-100")
              }
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="fee">
              Fee € (commissione/margine)
            </label>
            <input
              id="fee"
              name="fee"
              type="number"
              step="0.01"
              defaultValue={init.fee || "0"}
              className={inputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClass} htmlFor="amountPaid">
              Importo pagato €
            </label>
            <input
              id="amountPaid"
              name="amountPaid"
              type="number"
              step="0.01"
              defaultValue={init.amountPaid}
              placeholder="vuoto = non pagato"
              className={inputClass}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Residuo:{" "}
          {round2(
            Number(shownTotal || 0) - Number(init.amountPaid || 0),
          ).toFixed(2)}{" "}
          € (ricalcolato al salvataggio)
        </p>
      </div>

      <div className="space-y-1">
        <label className={labelClass} htmlFor="notes">
          Note
        </label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={init.notes}
          rows={2}
          className={inputClass}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
        >
          {pending ? "Salvataggio…" : submitLabel}
        </button>
        <Link
          href="/movimenti"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Annulla
        </Link>
      </div>
    </form>
  );
}
