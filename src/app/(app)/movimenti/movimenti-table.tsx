"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DeleteButton } from "@/components/delete-button";
import { formatDate } from "@/lib/format";
import { formatEUR } from "@/lib/money";
import { deleteTransaction } from "./actions";

export type MovimentoRow = {
  id: string;
  date: string;
  direction: "entrata" | "uscita";
  counterparty: string | null;
  description: string | null;
  companyName: string | null;
  carCode: string | null;
  categoryName: string | null;
  taxable: number;
  vatAmount: number;
  total: number;
};

const right = { meta: { align: "right" } } as const;

export function MovimentiTable({
  rows,
  isAdmin,
}: {
  rows: MovimentoRow[];
  isAdmin: boolean;
}) {
  const columns: ColumnDef<MovimentoRow>[] = [
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{formatDate(row.original.date)}</span>
      ),
    },
    {
      accessorKey: "direction",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.direction === "entrata"
              ? "border-transparent bg-green-100 text-green-700"
              : "border-transparent bg-red-100 text-red-700"
          }
        >
          {row.original.direction === "entrata" ? "Entrata" : "Uscita"}
        </Badge>
      ),
    },
    {
      accessorKey: "counterparty",
      header: "Descrizione",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.counterparty ?? "—"}</div>
          {row.original.description ? (
            <div className="text-xs text-muted-foreground">
              {row.original.description}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      id: "societaAuto",
      header: "Società / Auto",
      cell: ({ row }) => (
        <div>
          <div>{row.original.companyName ?? "—"}</div>
          {row.original.carCode ? (
            <div className="text-xs text-muted-foreground">
              {row.original.carCode}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Categoria",
      cell: ({ row }) => row.original.categoryName ?? "—",
    },
    {
      accessorKey: "taxable",
      header: "Imponibile",
      ...right,
      cell: ({ row }) => formatEUR(row.original.taxable),
    },
    {
      accessorKey: "vatAmount",
      header: "IVA",
      ...right,
      cell: ({ row }) => formatEUR(row.original.vatAmount),
    },
    {
      accessorKey: "total",
      header: "Totale",
      ...right,
      cell: ({ row }) => (
        <span className="font-semibold">{formatEUR(row.original.total)}</span>
      ),
    },
    {
      id: "azioni",
      header: "",
      ...right,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/movimenti/${row.original.id}`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Modifica
          </Link>
          {isAdmin ? (
            <DeleteButton
              action={deleteTransaction.bind(null, row.original.id)}
              message="Eliminare definitivamente questo movimento?"
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      emptyMessage="Nessun movimento trovato."
    />
  );
}
