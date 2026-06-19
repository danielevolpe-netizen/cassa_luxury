import { getRentCompanies } from "@/lib/data/rent";
import { RentCompaniesTable, type RentCompanyRow } from "../rent-companies-table";

export default async function RentSocietaPage() {
  const companies = await getRentCompanies();
  const rows: RentCompanyRow[] = companies.map((c) => ({
    id: c.id,
    name: c.name,
    vat: c.vat,
    address: c.address,
    iban: c.iban,
    isDefault: c.isDefault,
  }));

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{rows.length} società</p>
      <RentCompaniesTable rows={rows} />
    </div>
  );
}
