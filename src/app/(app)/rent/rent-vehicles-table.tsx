"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export type RentVehicleRow = {
  id: string;
  brand: string;
  model: string;
  plate: string | null;
  year: number | null;
  fuelType: string | null;
  transmission: string | null;
  ownership: string;
  isActive: boolean;
};

export function RentVehiclesTable({ rows }: { rows: RentVehicleRow[] }) {
  const columns: ColumnDef<RentVehicleRow>[] = [
    {
      accessorKey: "brand",
      header: "Brand",
      cell: ({ row }) => <span className="font-medium">{row.original.brand}</span>,
    },
    { accessorKey: "model", header: "Modello" },
    {
      accessorKey: "plate",
      header: "Targa",
      cell: ({ row }) => row.original.plate ?? "—",
    },
    {
      accessorKey: "year",
      header: "Anno",
      cell: ({ row }) => row.original.year ?? "—",
    },
    {
      accessorKey: "fuelType",
      header: "Alimentazione",
      cell: ({ row }) => row.original.fuelType ?? "—",
    },
    {
      accessorKey: "transmission",
      header: "Cambio",
      cell: ({ row }) => row.original.transmission ?? "—",
    },
    { accessorKey: "ownership", header: "Proprietà" },
    {
      accessorKey: "isActive",
      header: "Stato",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            "border-transparent " +
            (row.original.isActive
              ? "bg-green-100 text-green-700"
              : "bg-muted text-muted-foreground")
          }
        >
          {row.original.isActive ? "Attivo" : "Non attivo"}
        </Badge>
      ),
    },
    {
      id: "azioni",
      header: "",
      meta: { align: "right" },
      cell: ({ row }) => (
        <Link
          href={`/rent/veicoli/${row.original.id}`}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Dettaglio
        </Link>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={rows} emptyMessage="Nessun veicolo." />
  );
}
