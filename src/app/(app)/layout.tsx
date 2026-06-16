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
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold uppercase tracking-widest text-neutral-800">
              Cassa Luxury
            </span>
            <nav className="flex items-center gap-1">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/movimenti">Movimenti</NavLink>
              <NavLink href="/flotta">Flotta</NavLink>
              <NavLink href="/scadenze">Scadenze</NavLink>
              {user?.role === "admin" ? (
                <NavLink href="/anagrafiche">Anagrafiche</NavLink>
              ) : null}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600">{user?.name}</span>
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
      </header>

      <main className="flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
