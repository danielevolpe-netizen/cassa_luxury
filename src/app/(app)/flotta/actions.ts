"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { cars, deadlines, leasingContracts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";
import { toDecimalString } from "@/lib/money";

export type FormState = { error?: string; ok?: boolean };

const fail = (m: string): FormState => ({ error: m });

/** Legge un campo monetario: "" -> null, altrimenti decimale a 2 cifre. */
function money(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? toDecimalString(n) : null;
}
function moneyOrZero(v: FormDataEntryValue | null): string {
  return money(v) ?? "0";
}
function text(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}
function uuidOrNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

// ---------------------------------------------------------------------------
// Auto
// ---------------------------------------------------------------------------

const carSchema = z.object({
  code: z.string().trim().min(1, "Il codice (Modello | Targa) è obbligatorio."),
  brand: z.string().trim().optional(),
  model: z.string().trim().min(1, "Il modello è obbligatorio."),
  plate: z.string().trim().optional(),
  status: z.enum(["attiva", "venduta", "in_arrivo"]),
});

function carValues(formData: FormData) {
  const parsed = carSchema.safeParse({
    code: formData.get("code") ?? "",
    brand: formData.get("brand") ?? undefined,
    model: formData.get("model") ?? "",
    plate: formData.get("plate") ?? undefined,
    status: formData.get("status") ?? "attiva",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return {
    values: {
      code: parsed.data.code,
      brand: text(formData.get("brand")),
      model: parsed.data.model,
      plate: text(formData.get("plate")),
      companyId: uuidOrNull(formData.get("companyId")),
      status: parsed.data.status,
      notes: text(formData.get("notes")),
    },
  };
}

export async function createCar(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const res = carValues(formData);
  if (res.error) return fail(res.error);
  try {
    await db.insert(cars).values(res.values!);
  } catch {
    return fail("Codice auto già esistente.");
  }
  revalidatePath("/flotta");
  redirect("/flotta");
}

export async function updateCar(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const res = carValues(formData);
  if (res.error) return fail(res.error);
  try {
    await db
      .update(cars)
      .set({ ...res.values!, updatedAt: new Date() })
      .where(eq(cars.id, id));
  } catch {
    return fail("Codice auto già esistente.");
  }
  revalidatePath("/flotta");
  revalidatePath(`/flotta/${id}`);
  return { ok: true };
}

export async function deleteCar(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(cars).where(eq(cars.id, id));
  revalidatePath("/flotta");
  redirect("/flotta");
}

// ---------------------------------------------------------------------------
// Contratti di leasing
// ---------------------------------------------------------------------------

export async function createLeasing(
  carId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  await db.insert(leasingContracts).values({
    carId,
    lessor: text(formData.get("lessor")),
    monthlyTaxable: moneyOrZero(formData.get("monthlyTaxable")),
    monthlyVat: moneyOrZero(formData.get("monthlyVat")),
    monthlyTotal: moneyOrZero(formData.get("monthlyTotal")),
    startDate: text(formData.get("startDate")),
    endDate: text(formData.get("endDate")),
    residualDebt: money(formData.get("residualDebt")),
    residualDebtTaxable: money(formData.get("residualDebtTaxable")),
    buyoutValue: money(formData.get("buyoutValue")),
    notes: text(formData.get("notes")),
  });
  revalidatePath(`/flotta/${carId}`);
  return { ok: true };
}

export async function updateLeasing(
  id: string,
  carId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  await db
    .update(leasingContracts)
    .set({
      lessor: text(formData.get("lessor")),
      monthlyTaxable: moneyOrZero(formData.get("monthlyTaxable")),
      monthlyVat: moneyOrZero(formData.get("monthlyVat")),
      monthlyTotal: moneyOrZero(formData.get("monthlyTotal")),
      startDate: text(formData.get("startDate")),
      endDate: text(formData.get("endDate")),
      residualDebt: money(formData.get("residualDebt")),
      residualDebtTaxable: money(formData.get("residualDebtTaxable")),
      buyoutValue: money(formData.get("buyoutValue")),
      notes: text(formData.get("notes")),
      updatedAt: new Date(),
    })
    .where(eq(leasingContracts.id, id));
  revalidatePath(`/flotta/${carId}`);
  return { ok: true };
}

export async function deleteLeasing(
  id: string,
  carId: string,
): Promise<void> {
  await requireAdmin();
  await db.delete(leasingContracts).where(eq(leasingContracts.id, id));
  revalidatePath(`/flotta/${carId}`);
}

// ---------------------------------------------------------------------------
// Scadenze
// ---------------------------------------------------------------------------

const deadlineSchema = z.object({
  type: z.enum(["assicurazione", "bollo", "revisione", "leasing", "altro"]),
  dueDate: z.string().min(1, "La data di scadenza è obbligatoria."),
  status: z.enum(["aperta", "pagata", "annullata"]),
});

function deadlineValues(formData: FormData) {
  const parsed = deadlineSchema.safeParse({
    type: formData.get("type") ?? "altro",
    dueDate: formData.get("dueDate") ?? "",
    status: formData.get("status") ?? "aperta",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  return {
    values: {
      carId: uuidOrNull(formData.get("carId")),
      type: parsed.data.type,
      dueDate: parsed.data.dueDate,
      amount: money(formData.get("amount")),
      status: parsed.data.status,
      notes: text(formData.get("notes")),
    },
  };
}

export async function createDeadline(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const res = deadlineValues(formData);
  if (res.error) return fail(res.error);
  await db.insert(deadlines).values(res.values!);
  revalidatePath("/scadenze");
  if (res.values!.carId) revalidatePath(`/flotta/${res.values!.carId}`);
  return { ok: true };
}

export async function updateDeadline(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const res = deadlineValues(formData);
  if (res.error) return fail(res.error);
  await db
    .update(deadlines)
    .set({ ...res.values!, updatedAt: new Date() })
    .where(eq(deadlines.id, id));
  revalidatePath("/scadenze");
  if (res.values!.carId) revalidatePath(`/flotta/${res.values!.carId}`);
  return { ok: true };
}

export async function deleteDeadline(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(deadlines).where(eq(deadlines.id, id));
  revalidatePath("/scadenze");
}
