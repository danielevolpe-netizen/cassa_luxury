import { asc } from "drizzle-orm";
import { rentDb } from "@/db/rent";
import { rentCompany, rentVehicle } from "@/db/rent-schema";

// Accesso in sola lettura ai dati di numbers-rent.

export function getRentVehicles() {
  return rentDb
    .select()
    .from(rentVehicle)
    .orderBy(asc(rentVehicle.brand), asc(rentVehicle.model));
}

export function getRentCompanies() {
  return rentDb.select().from(rentCompany).orderBy(asc(rentCompany.name));
}
