import "dotenv/config";
import { db } from "./index";
import { categories, companies, paymentMethods } from "./schema";

// Seed delle anagrafiche di base. Idempotente: usa onConflictDoNothing
// così può essere rieseguito senza creare duplicati.

const COMPANIES = [
  { name: "Turrini/Fox", code: "Tfox" },
  { name: "GTLink", code: "GTLink" },
  { name: "Linkers", code: "Linkers" },
  { name: "Panda Soleco", code: "PandaSoleco" },
];

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

  await db.insert(companies).values(COMPANIES).onConflictDoNothing();
  console.log(`  società: ${COMPANIES.length}`);

  await db.insert(categories).values(CATEGORIES).onConflictDoNothing();
  console.log(`  categorie: ${CATEGORIES.length}`);

  await db
    .insert(paymentMethods)
    .values(PAYMENT_METHODS)
    .onConflictDoNothing();
  console.log(`  metodi di pagamento: ${PAYMENT_METHODS.length}`);

  console.log("Seed completato.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Errore nel seed:", err);
    process.exit(1);
  });
