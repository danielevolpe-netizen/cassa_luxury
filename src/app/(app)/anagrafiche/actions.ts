"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, paymentMethods } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-helpers";

export type FormState = { error?: string; ok?: boolean };

function fail(message: string): FormState {
  return { error: message };
}

// (Le società sono gestite in Numbers Rent: niente CRUD locale.)

// ---------------------------------------------------------------------------
// Categorie
// ---------------------------------------------------------------------------

const categorySchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio."),
  kind: z.enum(["costo", "ricavo", "entrambi"]),
  sortOrder: z.coerce.number().int().default(0),
  active: z.coerce.boolean().optional().default(false),
});

export async function createCategory(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name") ?? "",
    kind: formData.get("kind") ?? "entrambi",
    sortOrder: formData.get("sortOrder") ?? 0,
    active: true,
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  try {
    await db.insert(categories).values(parsed.data);
  } catch {
    return fail("Nome categoria già esistente.");
  }
  revalidatePath("/anagrafiche/categorie");
  return { ok: true };
}

export async function updateCategory(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name") ?? "",
    kind: formData.get("kind") ?? "entrambi",
    sortOrder: formData.get("sortOrder") ?? 0,
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  try {
    await db
      .update(categories)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(categories.id, id));
  } catch {
    return fail("Nome categoria già esistente.");
  }
  revalidatePath("/anagrafiche/categorie");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/anagrafiche/categorie");
}

// ---------------------------------------------------------------------------
// Metodi di pagamento
// ---------------------------------------------------------------------------

const paymentMethodSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio."),
  active: z.coerce.boolean().optional().default(false),
});

export async function createPaymentMethod(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = paymentMethodSchema.safeParse({
    name: formData.get("name") ?? "",
    active: true,
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  try {
    await db.insert(paymentMethods).values(parsed.data);
  } catch {
    return fail("Metodo già esistente.");
  }
  revalidatePath("/anagrafiche/metodi");
  return { ok: true };
}

export async function updatePaymentMethod(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = paymentMethodSchema.safeParse({
    name: formData.get("name") ?? "",
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  try {
    await db
      .update(paymentMethods)
      .set(parsed.data)
      .where(eq(paymentMethods.id, id));
  } catch {
    return fail("Metodo già esistente.");
  }
  revalidatePath("/anagrafiche/metodi");
  return { ok: true };
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  revalidatePath("/anagrafiche/metodi");
}
