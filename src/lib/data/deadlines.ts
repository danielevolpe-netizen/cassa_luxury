import { and, asc, eq, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { deadlines } from "@/db/schema";

export type DeadlineFilters = {
  status?: "aperta" | "pagata" | "annullata";
  carId?: string;
};

export function listDeadlines(f: DeadlineFilters = {}) {
  const conds: SQL[] = [];
  if (f.status) conds.push(eq(deadlines.status, f.status));
  if (f.carId) conds.push(eq(deadlines.carId, f.carId));

  return db.query.deadlines.findMany({
    where: conds.length ? and(...conds) : undefined,
    orderBy: [asc(deadlines.dueDate)],
  });
}

/** Classifica una scadenza in base alla data e allo stato. */
export function deadlineAlert(
  dueDate: string,
  status: string,
  today = new Date(),
): "scaduta" | "in_scadenza" | "ok" | "chiusa" {
  if (status !== "aperta") return "chiusa";
  const due = new Date(dueDate + "T00:00:00");
  const days = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return "scaduta";
  if (days <= 30) return "in_scadenza";
  return "ok";
}
