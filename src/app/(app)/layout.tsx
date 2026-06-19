import { auth, signOut } from "@/auth";
import { NavLink } from "@/components/nav-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <span className="text-sm font-semibold uppercase tracking-widest">
            Cassa Luxury
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user?.name}
            </span>
            <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
              {user?.role}
            </Badge>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Esci
              </Button>
            </form>
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/movimenti">Movimenti</NavLink>
          <NavLink href="/flotta">Flotta</NavLink>
          <NavLink href="/scadenze">Scadenze</NavLink>
          <NavLink href="/report">Report</NavLink>
          <NavLink href="/crediti-debiti">Crediti/Debiti</NavLink>
          <NavLink href="/rent">Numbers Rent</NavLink>
          {user?.role === "admin" ? (
            <NavLink href="/anagrafiche">Anagrafiche</NavLink>
          ) : null}
        </nav>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
