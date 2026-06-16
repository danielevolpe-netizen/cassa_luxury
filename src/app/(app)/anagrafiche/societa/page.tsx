import { getAllCompanies } from "@/lib/data/anagrafiche";
import { CompaniesManager } from "../companies-manager";

export default async function SocietaPage() {
  const items = await getAllCompanies();
  return (
    <CompaniesManager
      items={items.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        active: c.active,
        notes: c.notes,
      }))}
    />
  );
}
