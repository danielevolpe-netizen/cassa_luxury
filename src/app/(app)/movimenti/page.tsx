import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getTransactionLookups } from "@/lib/data/lookups";
import {
  getTransactionsTotals,
  listTransactions,
  type TransactionFilters,
} from "@/lib/data/transactions";
import { getRentCompanyMap, getRentVehicleMap } from "@/lib/data/rent";
import { toNumber } from "@/lib/money";
import { formatEUR } from "@/lib/money";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { nativeSelect } from "@/lib/ui";
import { MovimentiTable, type MovimentoRow } from "./movimenti-table";

export default async function MovimentiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filters: TransactionFilters = {
    q: sp.q,
    direction: sp.direction as TransactionFilters["direction"],
    companyId: sp.companyId,
    categoryId: sp.categoryId,
    carId: sp.carId,
    from: sp.from,
    to: sp.to,
  };

  const [user, lookups, rows, totals, companyMap, vehicleMap] =
    await Promise.all([
      getCurrentUser(),
      getTransactionLookups(),
      listTransactions(filters),
      getTransactionsTotals(filters),
      getRentCompanyMap(),
      getRentVehicleMap(),
    ]);

  const isAdmin = user?.role === "admin";

  const tableRows: MovimentoRow[] = rows.map((t) => ({
    id: t.id,
    date: t.date,
    direction: t.direction,
    counterparty: t.counterparty,
    description: t.description,
    companyName: t.companyId ? (companyMap.get(t.companyId) ?? null) : null,
    carCode: t.carId ? (vehicleMap.get(t.carId) ?? null) : null,
    categoryName: t.category?.name ?? null,
    taxable: toNumber(t.taxable),
    vatAmount: toNumber(t.vatAmount),
    total: toNumber(t.total),
  }));

  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value) exportParams.set(key, value);
  }
  const exportQuery = exportParams.toString();
  const exportUrl = (format: string) =>
    `/movimenti/export?${exportQuery ? exportQuery + "&" : ""}format=${format}`;

  const totalCards = [
    { label: "Entrate", value: formatEUR(totals.entrate), cls: "text-green-700" },
    { label: "Uscite", value: formatEUR(totals.uscite), cls: "text-red-700" },
    { label: "Saldo", value: formatEUR(totals.saldo), cls: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Movimenti</h1>
        <div className="flex items-center gap-2">
          <a href={exportUrl("csv")} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Esporta CSV
          </a>
          <a href={exportUrl("xlsx")} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Esporta Excel
          </a>
          <Link href="/movimenti/nuovo" className={buttonVariants({ size: "sm" })}>
            + Nuovo movimento
          </Link>
        </div>
      </div>

      {/* Filtri */}
      <form
        method="get"
        className="flex flex-wrap items-end gap-2 rounded-lg border p-3"
      >
        <Input
          type="text"
          name="q"
          placeholder="Cerca…"
          defaultValue={sp.q ?? ""}
          className="h-9 w-40"
        />
        <select name="direction" defaultValue={sp.direction ?? ""} className={nativeSelect}>
          <option value="">Tutti i tipi</option>
          <option value="entrata">Entrate</option>
          <option value="uscita">Uscite</option>
        </select>
        <select name="companyId" defaultValue={sp.companyId ?? ""} className={nativeSelect}>
          <option value="">Tutte le società</option>
          {lookups.companies.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select name="categoryId" defaultValue={sp.categoryId ?? ""} className={nativeSelect}>
          <option value="">Tutte le categorie</option>
          {lookups.categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select name="carId" defaultValue={sp.carId ?? ""} className={nativeSelect}>
          <option value="">Tutte le auto</option>
          {lookups.cars.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <Input type="date" name="from" defaultValue={sp.from ?? ""} className="h-9 w-40" />
        <Input type="date" name="to" defaultValue={sp.to ?? ""} className="h-9 w-40" />
        <Button type="submit" size="sm">
          Filtra
        </Button>
        <Link href="/movimenti" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Azzera
        </Link>
      </form>

      {/* Totali */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {totalCards.map((c) => (
          <Card key={c.label} className="gap-0 p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className={"mt-1 text-lg font-semibold " + c.cls}>{c.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabella */}
      <MovimentiTable rows={tableRows} isAdmin={isAdmin} />

      <p className="text-xs text-muted-foreground">
        {rows.length} movimenti (max 500 visualizzati).
      </p>
    </div>
  );
}
