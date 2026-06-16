import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Colonna monetaria: numeric(12,2), default 0. */
const money = (name: string) =>
  numeric(name, { precision: 12, scale: 2 }).notNull().default("0");

/** Colonna monetaria opzionale (può essere NULL). */
const moneyNullable = (name: string) =>
  numeric(name, { precision: 12, scale: 2 });

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const userRole = pgEnum("user_role", ["admin", "collaboratore"]);

export const carStatus = pgEnum("car_status", [
  "attiva",
  "venduta",
  "in_arrivo",
]);

export const categoryKind = pgEnum("category_kind", [
  "costo",
  "ricavo",
  "entrambi",
]);

export const transactionDirection = pgEnum("transaction_direction", [
  "entrata",
  "uscita",
]);

export const deadlineType = pgEnum("deadline_type", [
  "assicurazione",
  "bollo",
  "revisione",
  "leasing",
  "altro",
]);

export const deadlineStatus = pgEnum("deadline_status", [
  "aperta",
  "pagata",
  "annullata",
]);

// ---------------------------------------------------------------------------
// Tabelle
// ---------------------------------------------------------------------------

/** Utenti dell'applicazione (con ruolo). */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("collaboratore"),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

/** Società / gruppi (Turrini/Fox, GTLink, Linkers, Panda Soleco). Tutte gestibili. */
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  code: text("code").unique(),
  active: boolean("active").notNull().default(true),
  notes: text("notes"),
  ...timestamps,
});

/** Flotta auto. `code` = "Modello | Targa". */
export const cars = pgTable("cars", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  brand: text("brand"),
  model: text("model").notNull(),
  plate: text("plate"),
  companyId: uuid("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  status: carStatus("status").notNull().default("attiva"),
  notes: text("notes"),
  ...timestamps,
});

/** Contratti di leasing/noleggio collegati a un'auto. */
export const leasingContracts = pgTable("leasing_contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  carId: uuid("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  lessor: text("lessor"),
  monthlyTaxable: money("monthly_taxable"),
  monthlyVat: money("monthly_vat"),
  monthlyTotal: money("monthly_total"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  residualDebt: moneyNullable("residual_debt"),
  residualDebtTaxable: moneyNullable("residual_debt_taxable"),
  buyoutValue: moneyNullable("buyout_value"),
  notes: text("notes"),
  ...timestamps,
});

/** Categorie (Conto Spesa): Canone mensile, Assicurazione, Vendita, ... */
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  kind: categoryKind("kind").notNull().default("entrambi"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/** Metodi di pagamento: Bonifico, Contanti, ... */
export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  active: boolean("active").notNull().default(true),
});

/** Movimenti di cassa (registro entrate/uscite). */
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  direction: transactionDirection("direction").notNull(),
  date: date("date").notNull(),
  competenceDate: date("competence_date"),
  counterparty: text("counterparty"),
  description: text("description"),
  carId: uuid("car_id").references(() => cars.id, { onDelete: "set null" }),
  companyId: uuid("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  taxable: money("taxable"),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("22"),
  vatAmount: money("vat_amount"),
  fee: money("fee"),
  total: money("total"),
  amountPaid: moneyNullable("amount_paid"),
  paymentMethodId: uuid("payment_method_id").references(
    () => paymentMethods.id,
    { onDelete: "set null" },
  ),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

/** Scadenze (bolli, assicurazioni, revisioni, leasing) con alert. */
export const deadlines = pgTable("deadlines", {
  id: uuid("id").primaryKey().defaultRandom(),
  carId: uuid("car_id").references(() => cars.id, { onDelete: "cascade" }),
  companyId: uuid("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  type: deadlineType("type").notNull().default("altro"),
  dueDate: date("due_date").notNull(),
  amount: moneyNullable("amount"),
  status: deadlineStatus("status").notNull().default("aperta"),
  notes: text("notes"),
  transactionId: uuid("transaction_id").references(() => transactions.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const companiesRelations = relations(companies, ({ many }) => ({
  cars: many(cars),
  transactions: many(transactions),
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
  company: one(companies, {
    fields: [cars.companyId],
    references: [companies.id],
  }),
  leasingContracts: many(leasingContracts),
  transactions: many(transactions),
  deadlines: many(deadlines),
}));

export const leasingContractsRelations = relations(
  leasingContracts,
  ({ one }) => ({
    car: one(cars, {
      fields: [leasingContracts.carId],
      references: [cars.id],
    }),
  }),
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const paymentMethodsRelations = relations(
  paymentMethods,
  ({ many }) => ({
    transactions: many(transactions),
  }),
);

export const transactionsRelations = relations(transactions, ({ one }) => ({
  car: one(cars, { fields: [transactions.carId], references: [cars.id] }),
  company: one(companies, {
    fields: [transactions.companyId],
    references: [companies.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [transactions.paymentMethodId],
    references: [paymentMethods.id],
  }),
  createdByUser: one(users, {
    fields: [transactions.createdBy],
    references: [users.id],
  }),
}));

export const deadlinesRelations = relations(deadlines, ({ one }) => ({
  car: one(cars, { fields: [deadlines.carId], references: [cars.id] }),
  company: one(companies, {
    fields: [deadlines.companyId],
    references: [companies.id],
  }),
  transaction: one(transactions, {
    fields: [deadlines.transactionId],
    references: [transactions.id],
  }),
}));

// ---------------------------------------------------------------------------
// Tipi inferiti
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Company = typeof companies.$inferSelect;
export type Car = typeof cars.$inferSelect;
export type LeasingContract = typeof leasingContracts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Deadline = typeof deadlines.$inferSelect;
