import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAllCars } from "@/lib/data/cars";

const STATUS_LABEL: Record<string, [string, string]> = {
  attiva: ["Attiva", "bg-green-100 text-green-700"],
  in_arrivo: ["In arrivo", "bg-amber-100 text-amber-700"],
  venduta: ["Venduta", "bg-neutral-200 text-neutral-600"],
};

export default async function FlottaPage() {
  const [user, items] = await Promise.all([getCurrentUser(), getAllCars()]);
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Flotta</h1>
        {isAdmin ? (
          <Link
            href="/flotta/nuova"
            className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            + Nuova auto
          </Link>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-3 py-2">Codice</th>
              <th className="px-3 py-2">Brand</th>
              <th className="px-3 py-2">Targa</th>
              <th className="px-3 py-2">Società</th>
              <th className="px-3 py-2">Stato</th>
              <th className="px-3 py-2 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-neutral-500">
                  Nessuna auto in flotta.
                </td>
              </tr>
            ) : (
              items.map((c) => {
                const [label, cls] = STATUS_LABEL[c.status] ?? ["", ""];
                return (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-3 py-2 font-medium">{c.code}</td>
                    <td className="px-3 py-2">{c.brand ?? "—"}</td>
                    <td className="px-3 py-2">{c.plate ?? "—"}</td>
                    <td className="px-3 py-2">{c.company?.name ?? "—"}</td>
                    <td className="px-3 py-2">
                      <span className={"rounded px-1.5 py-0.5 text-xs font-medium " + cls}>
                        {label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        href={`/flotta/${c.id}`}
                        className="font-medium text-neutral-700 hover:underline"
                      >
                        Dettaglio
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
