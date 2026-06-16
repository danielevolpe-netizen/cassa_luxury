import { auth, signOut } from "@/auth";
import { NavLink } from "@/components/nav-link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-neutral-200">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <span className="text-sm font-semibold uppercase tracking-widest text-neutral-800">
            Cassa Luxury
          </span>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-neutral-600 sm:inline">
              {user?.name}
            </span>
            <span
              className={
                "rounded px-1.5 py-0.5 text-xs font-medium " +
                (user?.role === "admin"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-200 text-neutral-700")
              }
            >
              {user?.role}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
              >
                Esci
              </button>
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
          {user?.role === "admin" ? (
            <NavLink href="/anagrafiche">Anagrafiche</NavLink>
          ) : null}
        </nav>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
