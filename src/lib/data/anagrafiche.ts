import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories, companies, paymentMethods } from "@/db/schema";

export function getAllCompanies() {
  return db.select().from(companies).orderBy(asc(companies.name));
}

export function getAllCategories() {
  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export function getAllPaymentMethods() {
  return db
    .select()
    .from(paymentMethods)
    .orderBy(asc(paymentMethods.name));
}
