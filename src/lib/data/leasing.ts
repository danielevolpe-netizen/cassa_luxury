import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { leasingContracts } from "@/db/schema";

/** Contratti di leasing collegati a un veicolo (id Numbers Rent). */
export function getLeasingByCar(carId: string) {
  return db
    .select()
    .from(leasingContracts)
    .where(eq(leasingContracts.carId, carId))
    .orderBy(asc(leasingContracts.createdAt));
}
