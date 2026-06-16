import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getActiveCompanies } from "@/lib/data/lookups";
import { createCar } from "../actions";
import { CarForm } from "../car-form";

export default async function NuovaAutoPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/flotta");

  const companies = await getActiveCompanies();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Nuova auto</h1>
      <CarForm
        action={createCar}
        companies={companies.map((c) => ({ value: c.id, label: c.name }))}
        submitLabel="Crea auto"
      />
    </div>
  );
}
