"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export type CarRow = {
  id: string;
  code: string;
  brand: string | null;
  plate: string | null;
  companyName: string | null;
  status: "attiva" | "venduta" | "in_arrivo";
};

const STATUS: Record<string, { label: string; cls: string }> = {
  attiva: { label: "Attiva", cls: "bg-green-100 text-green-700" },
  in_arrivo: { label: "In arrivo", cls: "bg-amber-100 text-amber-700" },
  venduta: { label: "Venduta", cls: "bg-muted text-muted-foreground" },
};

export function CarsTable({ rows }: { rows: CarRow[] }) {
  const columns: ColumnDef<CarRow>[] = [
    {
      accessorKey: "code",
      header: "Codice",
      cell: ({ row }) => <span className="font-medium">{row.original.code}</span>,
    },
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => row.original.brand ?? "—",
    },
    {
      accessorKey: "plate",
      header: "Targa",
      cell: ({ row }) => row.original.plate ?? "—",
    },
    {
      accessorKey: "companyName",
      header: "Società",
      cell: ({ row }) => row.original.companyName ?? "—",
    },
    {
      accessorKey: "status",
      header: "Stato",
      cell: ({ row }) => {
        const s = STATUS[row.original.status] ?? { label: "", cls: "" };
        return (
          <Badge variant="outline" className={"border-transparent " + s.cls}>
            {s.label}
          </Badge>
        );
      },
    },
    {
      id: "azioni",
      header: "",
      meta: { align: "right" },
      cell: ({ row }) => (
        <Link
          href={`/flotta/${row.original.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Dettaglio
        </Link>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={rows} emptyMessage="Nessuna auto in flotta." />
  );
}
