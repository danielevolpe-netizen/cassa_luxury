import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cars } from "@/db/schema";

export function getAllCars() {
  return db.query.cars.findMany({
    orderBy: [asc(cars.code)],
    with: { company: true },
  });
}

export function getCar(id: string) {
  return db.query.cars.findFirst({
    where: eq(cars.id, id),
    with: {
      company: true,
      leasingContracts: true,
      deadlines: { with: { transaction: true } },
    },
  });
}
