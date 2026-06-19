import { getRentVehicles } from "@/lib/data/rent";
import { RentVehiclesTable, type RentVehicleRow } from "../rent-vehicles-table";

export default async function RentVeicoliPage() {
  const vehicles = await getRentVehicles();
  const rows: RentVehicleRow[] = vehicles.map((v) => ({
    id: v.id,
    brand: v.brand,
    model: v.model,
    plate: v.plate,
    year: v.year,
    fuelType: v.fuelType,
    transmission: v.transmission,
    ownership: v.ownership,
    isActive: v.isActive,
  }));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{rows.length} veicoli</p>
      <RentVehiclesTable rows={rows} />
    </div>
  );
}
