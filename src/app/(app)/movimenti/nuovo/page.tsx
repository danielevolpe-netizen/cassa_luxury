import { getTransactionLookups } from "@/lib/data/lookups";
import { createTransaction } from "../actions";
import { TransactionForm } from "../transaction-form";

export default async function NuovoMovimentoPage() {
  const { companies, categories, cars, paymentMethods } =
    await getTransactionLookups();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Nuovo movimento
      </h1>
      <TransactionForm
        action={createTransaction}
        companies={companies}
        categories={categories}
        cars={cars}
        paymentMethods={paymentMethods}
        submitLabel="Crea movimento"
      />
    </div>
  );
}
