import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAllCars } from "@/lib/data/cars";
import { buttonVariants } from "@/components/ui/button";
import { CarsTable, type CarRow } from "./cars-table";

export default async function FlottaPage() {
  const [user, items] = await Promise.all([getCurrentUser(), getAllCars()]);
  const isAdmin = user?.role === "admin";

  const rows: CarRow[] = items.map((c) => ({
    id: c.id,
    code: c.code,
    brand: c.brand,
    plate: c.plate,
    companyName: c.company?.name ?? null,
    status: c.status,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Flotta</h1>
        {isAdmin ? (
          <Link href="/flotta/nuova" className={buttonVariants({ size: "sm" })}>
            + Nuova auto
          </Link>
        ) : null}
      </div>

      <CarsTable rows={rows} />
    </div>
  );
}
