import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { NavLink } from "@/components/nav-link";

export default async function AnagraficheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Anagrafiche</h1>
      <nav className="flex flex-wrap gap-1 border-b pb-3">
        <NavLink href="/anagrafiche/categorie">Categorie</NavLink>
        <NavLink href="/anagrafiche/metodi">Metodi di pagamento</NavLink>
      </nav>
      {children}
    </div>
  );
}
