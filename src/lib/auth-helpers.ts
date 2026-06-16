import { auth } from "@/auth";

/** Ritorna l'utente in sessione (o null). */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Lancia se l'utente non è admin. Da usare nelle azioni riservate. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Operazione riservata agli amministratori.");
  }
  return user;
}

/** Lancia se non autenticato. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Autenticazione richiesta.");
  }
  return user;
}
