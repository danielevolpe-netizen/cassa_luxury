ALTER TABLE "cars" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "companies" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "cars" CASCADE;--> statement-breakpoint
DROP TABLE "companies" CASCADE;--> statement-breakpoint
ALTER TABLE "deadlines" DROP CONSTRAINT "deadlines_car_id_cars_id_fk";
--> statement-breakpoint
ALTER TABLE "deadlines" DROP CONSTRAINT "deadlines_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "leasing_contracts" DROP CONSTRAINT "leasing_contracts_car_id_cars_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_car_id_cars_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_company_id_companies_id_fk";
--> statement-breakpoint
DROP TYPE "public"."car_status";