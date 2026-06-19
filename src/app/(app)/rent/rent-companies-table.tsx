"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";

export type RentCompanyRow = {
  id: string;
  name: string;
  vat: string | null;
  address: string | null;
  iban: string | null;
  isDefault: boolean;
};

export function RentCompaniesTable({ rows }: { rows: RentCompanyRow[] }) {
  const columns: ColumnDef<RentCompanyRow>[] = [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.name}
          {row.original.isDefault ? (
            <Badge variant="secondary" className="ml-2">
              default
            </Badge>
          ) : null}
        </span>
      ),
    },
    {
      accessorKey: "vat",
      header: "P. IVA",
      cell: ({ row }) => row.original.vat ?? "—",
    },
    {
      accessorKey: "address",
      header: "Indirizzo",
      cell: ({ row }) => row.original.address ?? "—",
    },
    {
      accessorKey: "iban",
      header: "IBAN",
      cell: ({ row }) => row.original.iban ?? "—",
    },
  ];

  return (
    <DataTable columns={columns} data={rows} emptyMessage="Nessuna società." />
  );
}
