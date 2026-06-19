"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth-helpers";
import { toDecimalString } from "@/lib/money";

export type FormState = { error?: string };

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null));

const optionalId = z
  .string()
  .uuid()
  .optional()
  .nullable()
  .transform((v) => v ?? null);

const schema = z.object({
  direction: z.enum(["entrata", "uscita"]),
  date: z.string().min(1, "La data è obbligatoria."),
  counterparty: optionalText,
  description: optionalText,
  carId: optionalId,
  companyId: optionalId,
  categoryId: optionalId,
  taxable: z.coerce.number().min(0),
  vatRate: z.coerce.number().min(0).max(100),
  vatAmount: z.coerce.number(),
  fee: z.coerce.number(),
  total: z.coerce.number(),
  paymentMethodId: optionalId,
  notes: optionalText,
});

/** Normalizza FormData: stringhe vuote -> undefined. */
function parse(formData: FormData) {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    const v = typeof value === "string" ? value.trim() : value;
    raw[key] = v === "" ? undefined : v;
  }
  return schema.safeParse(raw);
}

function toValues(data: z.infer<typeof schema>) {
  return {
    direction: data.direction,
    date: data.date,
    counterparty: data.counterparty,
    description: data.description,
    carId: data.carId,
    companyId: data.companyId,
    categoryId: data.categoryId,
    taxable: toDecimalString(data.taxable),
    vatRate: toDecimalString(data.vatRate),
    vatAmount: toDecimalString(data.vatAmount),
    fee: toDecimalString(data.fee),
    total: toDecimalString(data.total),
    paymentMethodId: data.paymentMethodId,
    notes: data.notes,
  };
}

export async function createTransaction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  await db.insert(transactions).values({
    ...toValues(parsed.data),
    createdBy: user.id,
  });

  revalidatePath("/movimenti");
  redirect("/movimenti");
}

export async function updateTransaction(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser();
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  await db
    .update(transactions)
    .set({ ...toValues(parsed.data), updatedAt: new Date() })
    .where(eq(transactions.id, id));

  revalidatePath("/movimenti");
  revalidatePath(`/movimenti/${id}`);
  redirect("/movimenti");
}

export async function deleteTransaction(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(transactions).where(eq(transactions.id, id));
  revalidatePath("/movimenti");
  redirect("/movimenti");
}
