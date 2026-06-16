import { getTransactionLookups } from "@/lib/data/lookups";
import { createTransaction } from "../actions";
import { TransactionForm } from "../transaction-form";

export default async function NuovoMovimentoPage() {
  const { companyList, categoryList, carList, paymentMethodList } =
    await getTransactionLookups();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Nuovo movimento
      </h1>
      <TransactionForm
        action={createTransaction}
        companies={companyList.map((c) => ({ value: c.id, label: c.name }))}
        categories={categoryList.map((c) => ({ value: c.id, label: c.name }))}
        cars={carList.map((c) => ({ value: c.id, label: c.code }))}
        paymentMethods={paymentMethodList.map((p) => ({
          value: p.id,
          label: p.name,
        }))}
        submitLabel="Crea movimento"
      />
    </div>
  );
}
