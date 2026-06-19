import { NavLink } from "@/components/nav-link";

export default function RentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Numbers Rent</h1>
        <p className="text-sm text-muted-foreground">
          Dati in sola lettura dal gestionale noleggio.
        </p>
      </div>
      <nav className="flex flex-wrap gap-1 border-b pb-3">
        <NavLink href="/rent/veicoli">Veicoli</NavLink>
        <NavLink href="/rent/societa">Società</NavLink>
      </nav>
      {children}
    </div>
  );
}
