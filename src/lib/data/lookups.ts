import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, paymentMethods } from "@/db/schema";
import { getRentCompanyOptions, getRentVehicleOptions } from "./rent";

export type Option = { value: string; label: string };

export function getActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export function getActivePaymentMethods() {
  return db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.active, true))
    .orderBy(asc(paymentMethods.name));
}

/**
 * Anagrafiche per i form/filtri dei movimenti.
 * Auto e società provengono da Numbers Rent (sola lettura); categorie e
 * metodi di pagamento sono locali. Tutte come opzioni {value,label}.
 */
export async function getTransactionLookups() {
  const [companies, cars, categoryList, paymentMethodList] = await Promise.all([
    getRentCompanyOptions(),
    getRentVehicleOptions(),
    getActiveCategories(),
    getActivePaymentMethods(),
  ]);
  return {
    companies,
    cars,
    categories: categoryList.map((c) => ({ value: c.id, label: c.name })),
    paymentMethods: paymentMethodList.map((p) => ({
      value: p.id,
      label: p.name,
    })),
  };
}
