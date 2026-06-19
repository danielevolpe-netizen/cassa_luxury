import { asc, eq } from "drizzle-orm";
import { rentDb } from "@/db/rent";
import { rentCompany, rentVehicle, type RentVehicle } from "@/db/rent-schema";

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

export function getRentVehicle(id: string) {
  return rentDb
    .select()
    .from(rentVehicle)
    .where(eq(rentVehicle.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
}

/** Etichetta leggibile di un veicolo: "Brand Modello | Targa". */
export function vehicleLabel(
  v: Pick<RentVehicle, "brand" | "model" | "plate">,
): string {
  const base = `${v.brand} ${v.model}`.trim();
  return v.plate ? `${base} | ${v.plate}` : base;
}

/** Opzioni {value,label} dei veicoli per i menu a tendina. */
export async function getRentVehicleOptions() {
  const vs = await getRentVehicles();
  return vs.map((v) => ({ value: v.id, label: vehicleLabel(v) }));
}

/** Opzioni {value,label} delle società. */
export async function getRentCompanyOptions() {
  const cs = await getRentCompanies();
  return cs.map((c) => ({ value: c.id, label: c.name }));
}

/** Mappa id veicolo -> etichetta. */
export async function getRentVehicleMap() {
  const vs = await getRentVehicles();
  return new Map(vs.map((v) => [v.id, vehicleLabel(v)]));
}

/** Mappa id società -> nome. */
export async function getRentCompanyMap() {
  const cs = await getRentCompanies();
  return new Map(cs.map((c) => [c.id, c.name]));
}
