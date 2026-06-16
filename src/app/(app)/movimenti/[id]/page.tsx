import { notFound } from "next/navigation";
import { getTransactionLookups } from "@/lib/data/lookups";
import { getTransaction } from "@/lib/data/transactions";
import { updateTransaction } from "../actions";
import {
  TransactionForm,
  type TransactionDefaults,
} from "../transaction-form";

export default async function ModificaMovimentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tx, lookups] = await Promise.all([
    getTransaction(id),
    getTransactionLookups(),
  ]);

  if (!tx) notFound();

  const defaults: Partial<TransactionDefaults> = {
    direction: tx.direction,
    date: tx.date,
    competenceDate: tx.competenceDate ?? "",
    companyId: tx.companyId ?? "",
    categoryId: tx.categoryId ?? "",
    carId: tx.carId ?? "",
    counterparty: tx.counterparty ?? "",
    description: tx.description ?? "",
    taxable: tx.taxable,
    vatRate: tx.vatRate,
    vatAmount: tx.vatAmount,
    fee: tx.fee,
    total: tx.total,
    amountPaid: tx.amountPaid ?? "",
    paymentMethodId: tx.paymentMethodId ?? "",
    notes: tx.notes ?? "",
  };

  const { companyList, categoryList, carList, paymentMethodList } = lookups;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Modifica movimento
      </h1>
      <TransactionForm
        action={updateTransaction.bind(null, id)}
        companies={companyList.map((c) => ({ value: c.id, label: c.name }))}
        categories={categoryList.map((c) => ({ value: c.id, label: c.name }))}
        cars={carList.map((c) => ({ value: c.id, label: c.code }))}
        paymentMethods={paymentMethodList.map((p) => ({
          value: p.id,
          label: p.name,
        }))}
        defaults={defaults}
        submitLabel="Salva modifiche"
      />
    </div>
  );
}
