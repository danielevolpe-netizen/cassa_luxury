import Link from "next/link";
import { getRentCompanyOptions } from "@/lib/data/rent";
import {
  getProfitLossByCategory,
  getProfitLossByCompany,
  type PeriodFilter,
} from "@/lib/data/reports";
import { formatEUR } from "@/lib/money";
import { nativeSelect } from "@/lib/ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function saldoClass(n: number) {
  return n >= 0 ? "text-green-700" : "text-red-700";
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filter: PeriodFilter = {
    from: sp.from,
    to: sp.to,
    companyId: sp.companyId,
  };

  const [companies, byCompany, byCategory] = await Promise.all([
    getRentCompanyOptions(),
    getProfitLossByCompany(filter),
    getProfitLossByCategory(filter),
  ]);

  const exportParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value) exportParams.set(key, value);
  }
  const eq = exportParams.toString();
  const exportUrl = (format: string) =>
    `/report/export?${eq ? eq + "&" : ""}format=${format}`;

  const tot = byCompany.reduce(
    (acc, r) => {
      acc.ricavi += r.ricavi;
      acc.costi += r.costi;
      return acc;
    },
    { ricavi: 0, costi: 0 },
  );
  const totSaldo = tot.ricavi - tot.costi;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Conto economico</h1>
        <div className="flex items-center gap-2">
          <a href={exportUrl("csv")} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Esporta CSV
          </a>
          <a href={exportUrl("xlsx")} className={buttonVariants({ variant: "outline", size: "sm" })}>
            Esporta Excel
          </a>
        </div>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-2 rounded-lg border p-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Dal</Label>
          <Input type="date" name="from" defaultValue={sp.from ?? ""} className="h-9 w-40" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Al</Label>
          <Input type="date" name="to" defaultValue={sp.to ?? ""} className="h-9 w-40" />
        </div>
        <select name="companyId" defaultValue={sp.companyId ?? ""} className={nativeSelect}>
          <option value="">Tutte le società</option>
          {companies.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          Filtra
        </Button>
        <Link href="/report" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Azzera
        </Link>
      </form>

      {/* P&L per società */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Per società
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Società</TableHead>
                <TableHead className="text-right">Ricavi</TableHead>
                <TableHead className="text-right">Costi</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byCompany.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                    Nessun dato nel periodo selezionato.
                  </TableCell>
                </TableRow>
              ) : (
                byCompany.map((r) => (
                  <TableRow key={r.companyId ?? "none"}>
                    <TableCell className="font-medium">{r.companyName}</TableCell>
                    <TableCell className="text-right text-green-700">{formatEUR(r.ricavi)}</TableCell>
                    <TableCell className="text-right text-red-700">{formatEUR(r.costi)}</TableCell>
                    <TableCell className={"text-right font-semibold " + saldoClass(r.saldo)}>
                      {formatEUR(r.saldo)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {byCompany.length > 0 ? (
              <TableFooter>
                <TableRow>
                  <TableCell>Totale</TableCell>
                  <TableCell className="text-right text-green-700">{formatEUR(tot.ricavi)}</TableCell>
                  <TableCell className="text-right text-red-700">{formatEUR(tot.costi)}</TableCell>
                  <TableCell className={"text-right " + saldoClass(totSaldo)}>
                    {formatEUR(totSaldo)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            ) : null}
          </Table>
        </div>
      </section>

      {/* Dettaglio per categoria */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Per categoria
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Ricavi</TableHead>
                <TableHead className="text-right">Costi</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byCategory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                    Nessun dato.
                  </TableCell>
                </TableRow>
              ) : (
                byCategory.map((r) => {
                  const saldo = r.ricavi - r.costi;
                  return (
                    <TableRow key={r.categoryName}>
                      <TableCell>{r.categoryName}</TableCell>
                      <TableCell className="text-right text-green-700">{formatEUR(r.ricavi)}</TableCell>
                      <TableCell className="text-right text-red-700">{formatEUR(r.costi)}</TableCell>
                      <TableCell className={"text-right " + saldoClass(saldo)}>
                        {formatEUR(saldo)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
