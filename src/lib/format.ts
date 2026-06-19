// Formattazione date (it-IT).

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Formatta una data (string "YYYY-MM-DD" o Date) in gg/mm/aaaa. */
export function formatDate(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value + "T00:00:00") : value;
  if (Number.isNaN(d.getTime())) return "";
  return dateFormatter.format(d);
}

/** Data odierna in formato "YYYY-MM-DD" (per default dei form). */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
