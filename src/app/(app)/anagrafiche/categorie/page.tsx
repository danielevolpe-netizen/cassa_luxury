import { getAllCategories } from "@/lib/data/anagrafiche";
import { CategoriesManager } from "../categories-manager";

export default async function CategoriePage() {
  const items = await getAllCategories();
  return (
    <CategoriesManager
      items={items.map((c) => ({
        id: c.id,
        name: c.name,
        kind: c.kind,
        sortOrder: c.sortOrder,
        active: c.active,
      }))}
    />
  );
}
