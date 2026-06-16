import { auth, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-neutral-700">
          Cassa Luxury
        </p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-600">
            {user?.name}
            {user?.role === "admin" ? (
              <span className="ml-2 rounded bg-neutral-900 px-1.5 py-0.5 text-xs font-medium text-white">
                admin
              </span>
            ) : (
              <span className="ml-2 rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium text-neutral-700">
                collaboratore
              </span>
            )}
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
      </header>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Benvenuto, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-3 text-neutral-500">
            Autenticazione attiva. Le sezioni Registro movimenti, Flotta e
            Report arriveranno nelle prossime fasi.
          </p>
        </div>
      </div>
    </main>
  );
}
