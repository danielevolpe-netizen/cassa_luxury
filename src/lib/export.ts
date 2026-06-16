import ExcelJS from "exceljs";

export type ExportColumn = {
  header: string;
  numeric?: boolean;
  width?: number;
};

export type Cell = string | number | null;

/** Formatta un numero in stile italiano (virgola decimale) per il CSV. */
function csvNumber(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

function csvEscape(value: string): string {
  if (/[";\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Genera un CSV compatibile con Excel italiano: separatore ";", BOM UTF-8,
 * numeri con virgola decimale.
 */
export function toCsv(columns: ExportColumn[], rows: Cell[][]): string {
  const head = columns.map((c) => csvEscape(c.header)).join(";");
  const body = rows.map((row) =>
    row
      .map((cell, i) => {
        if (cell === null || cell === undefined) return "";
        if (columns[i]?.numeric && typeof cell === "number") {
          return csvNumber(cell);
        }
        return csvEscape(String(cell));
      })
      .join(";"),
  );
  return "﻿" + [head, ...body].join("\r\n");
}

/** Genera un file XLSX (Buffer) con intestazione in grassetto e colonne numeriche formattate. */
export async function toXlsx(
  sheetName: string,
  columns: ExportColumn[],
  rows: Cell[][],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Cassa Luxury";
  const ws = wb.addWorksheet(sheetName);

  ws.columns = columns.map((c) => ({
    header: c.header,
    width: c.width ?? Math.max(12, c.header.length + 2),
  }));

  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];

  for (const row of rows) {
    const added = ws.addRow(row.map((cell) => cell ?? ""));
    columns.forEach((col, i) => {
      if (col.numeric) {
        added.getCell(i + 1).numFmt = "#,##0.00";
      }
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function exportHeaders(filename: string, format: "csv" | "xlsx") {
  if (format === "xlsx") {
    return {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
    };
  }
  return {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": `attachment; filename="${filename}.csv"`,
  };
}
