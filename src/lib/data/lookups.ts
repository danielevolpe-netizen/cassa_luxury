import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cars, categories, companies, paymentMethods } from "@/db/schema";

export function getActiveCompanies() {
  return db
    .select()
    .from(companies)
    .where(eq(companies.active, true))
    .orderBy(asc(companies.name));
}

export function getActiveCategories() {
  return db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export function getActiveCars() {
  return db.select().from(cars).orderBy(asc(cars.code));
}

export function getActivePaymentMethods() {
  return db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.active, true))
    .orderBy(asc(paymentMethods.name));
}

/** Carica tutte le anagrafiche necessarie ai form dei movimenti. */
export async function getTransactionLookups() {
  const [companyList, categoryList, carList, paymentMethodList] =
    await Promise.all([
      getActiveCompanies(),
      getActiveCategories(),
      getActiveCars(),
      getActivePaymentMethods(),
    ]);
  return { companyList, categoryList, carList, paymentMethodList };
}
