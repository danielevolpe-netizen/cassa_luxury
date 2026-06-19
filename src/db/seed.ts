import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { categories, paymentMethods, users } from "./schema";

const ADMIN_EMAIL = "daniele@numbersgroup.it";
const ADMIN_NAME = "Daniele Volpe";
// Password temporanea: da cambiare al primo accesso.
const ADMIN_DEFAULT_PASSWORD = "CassaLuxury2026!";

// Seed delle anagrafiche di base. Idempotente: usa onConflictDoNothing
// così può essere rieseguito senza creare duplicati.
// (Le società sono gestite in Numbers Rent, non più qui.)

const CATEGORIES: {
  name: string;
  kind: "costo" | "ricavo" | "entrambi";
  sortOrder: number;
}[] = [
  { name: "Canone mensile", kind: "costo", sortOrder: 10 },
  { name: "Assicurazione", kind: "entrambi", sortOrder: 20 },
  { name: "Bolli", kind: "costo", sortOrder: 30 },
  { name: "Acquisto auto", kind: "costo", sortOrder: 40 },
  { name: "Riscatto auto", kind: "costo", sortOrder: 50 },
  { name: "Deposito Cauzionale", kind: "costo", sortOrder: 60 },
  { name: "Spese varie", kind: "entrambi", sortOrder: 70 },
  { name: "Noleggio", kind: "entrambi", sortOrder: 80 },
  { name: "Vendita", kind: "ricavo", sortOrder: 90 },
];

const PAYMENT_METHODS = [{ name: "Bonifico" }, { name: "Contanti" }];

async function main() {
  console.log("Seed anagrafiche…");

  await db.insert(categories).values(CATEGORIES).onConflictDoNothing();
  console.log(`  categorie: ${CATEGORIES.length}`);

  await db
    .insert(paymentMethods)
    .values(PAYMENT_METHODS)
    .onConflictDoNothing();
  console.log(`  metodi di pagamento: ${PAYMENT_METHODS.length}`);

  // Utente admin di default (idempotente: non sovrascrive se già presente).
  const passwordHash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, 10);
  const inserted = await db
    .insert(users)
    .values({
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash,
      role: "admin",
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  if (inserted.length > 0) {
    console.log(`  admin creato: ${ADMIN_EMAIL} / ${ADMIN_DEFAULT_PASSWORD}`);
  } else {
    console.log(`  admin già esistente: ${ADMIN_EMAIL} (password invariata)`);
  }

  console.log("Seed completato.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Errore nel seed:", err);
    process.exit(1);
  });
