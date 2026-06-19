// Schema (parziale, SOLA LETTURA) del database esterno "numbers-rent".
// NON è gestito da drizzle-kit: le migrazioni riguardano solo src/db/schema.ts.
// Definiamo solo le colonne che ci servono delle tabelle vehicle e company.

import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const rentVehicle = pgTable("vehicle", {
  id: uuid("id").primaryKey(),
  vehicleType: text("vehicle_type"),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  categories: text("categories").array(),
  plate: text("plate"),
  year: integer("year"),
  color: text("color"),
  fuelType: text("fuel_type"),
  transmission: text("transmission"),
  odometer: integer("odometer"),
  vin: text("vin"),
  ownership: text("ownership").notNull(),
  photoUrl: text("photo_url"),
  note: text("note"),
  isActive: boolean("is_active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const rentCompany = pgTable("company", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  address: text("address"),
  vat: text("vat"),
  bankName: text("bank_name"),
  iban: text("iban"),
  swift: text("swift"),
  isDefault: boolean("is_default").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export type RentVehicle = typeof rentVehicle.$inferSelect;
export type RentCompany = typeof rentCompany.$inferSelect;
