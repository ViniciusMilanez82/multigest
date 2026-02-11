-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR', 'FINANCIAL', 'READONLY');

-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('FISICA', 'JURIDICA');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'RENTED', 'IN_MAINTENANCE', 'IN_TRANSIT', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AddendumType" AS ENUM ('EXTENSION', 'ITEM_ADDITION', 'ITEM_REMOVAL', 'PRICE_ADJUSTMENT', 'PARTIAL_CLOSURE', 'OTHER');

-- CreateEnum
CREATE TYPE "MeasurementStatus" AS ENUM ('DRAFT', 'APPROVED', 'INVOICED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('DELIVERY', 'PICKUP', 'SWAP');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'IN_OPERATION', 'IN_MAINTENANCE', 'DECOMMISSIONED');

-- CreateEnum
CREATE TYPE "TransportOrderType" AS ENUM ('DELIVERY', 'PICKUP', 'TRANSFER');

-- CreateEnum
CREATE TYPE "TransportOrderStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('OPEN', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'IN_AGREEMENT', 'CANCELLED', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "CollectionActionType" AS ENUM ('PHONE_CALL', 'EMAIL', 'LETTER', 'PROTEST', 'LEGAL', 'VISIT', 'OTHER');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'BROKEN', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BiddingStatus" AS ENUM ('OPEN', 'IN_ANALYSIS', 'WON', 'LOST', 'CANCELLED');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "inscricao_estadual" TEXT,
    "inscricao_municipal" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_companies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,

    CONSTRAINT "user_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "company_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT,
    "type" "PersonType" NOT NULL DEFAULT 'JURIDICA',
    "cpf_cnpj" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "inscricao_estadual" TEXT,
    "inscricao_municipal" TEXT,
    "segment" TEXT,
    "notes" TEXT,
    "is_defaulter" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT,
    "type" "PersonType" NOT NULL DEFAULT 'JURIDICA',
    "cpf_cnpj" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "category" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT,
    "label" TEXT,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "customer_id" TEXT,
    "supplier_id" TEXT,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "phone" TEXT,
    "cellphone" TEXT,
    "email" TEXT,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "customer_id" TEXT,
    "supplier_id" TEXT,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "asset_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "asset_type_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "serial_number" TEXT,
    "manufacturing_year" INTEGER,
    "manufacturer" TEXT,
    "width" DECIMAL(10,2),
    "height" DECIMAL(10,2),
    "length" DECIMAL(10,2),
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "status" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "current_location" TEXT,
    "daily_rate" DECIMAL(12,2),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_status_history" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "from_status" "AssetStatus",
    "to_status" "AssetStatus" NOT NULL,
    "reason" TEXT,
    "changed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_maintenances" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "type" "MaintenanceType" NOT NULL DEFAULT 'CORRECTIVE',
    "description" TEXT NOT NULL,
    "cost" DECIMAL(12,2),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "payment_terms" TEXT,
    "payment_method" TEXT,
    "notes" TEXT,
    "total_monthly_value" DECIMAL(14,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_items" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "daily_rate" DECIMAL(12,2) NOT NULL,
    "monthly_rate" DECIMAL(12,2),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_addendums" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "addendum_number" INTEGER NOT NULL,
    "type" "AddendumType" NOT NULL,
    "description" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_addendums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_value" DECIMAL(14,2) NOT NULL,
    "status" "MeasurementStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_items" (
    "id" TEXT NOT NULL,
    "measurement_id" TEXT NOT NULL,
    "contract_item_id" TEXT NOT NULL,
    "days" INTEGER NOT NULL,
    "daily_rate" DECIMAL(12,2) NOT NULL,
    "total_value" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "measurement_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_movements" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "asset_code" TEXT,
    "movement_date" TIMESTAMP(3) NOT NULL,
    "address" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "renavam" TEXT,
    "load_capacity_kg" DECIMAL(10,2),
    "current_km" INTEGER,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cnh_number" TEXT NOT NULL,
    "cnh_category" TEXT NOT NULL,
    "cnh_expiry" TIMESTAMP(3) NOT NULL,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_checklists" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "check_date" TIMESTAMP(3) NOT NULL,
    "checked_by" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "overall_status" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_orders" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "driver_id" TEXT,
    "asset_id" TEXT,
    "requested_by" TEXT,
    "order_number" TEXT NOT NULL,
    "type" "TransportOrderType" NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "completed_date" TIMESTAMP(3),
    "status" "TransportOrderStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_records" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "liters" DECIMAL(10,2) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "current_km" INTEGER NOT NULL,
    "station" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_maintenances" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "type" "MaintenanceType" NOT NULL DEFAULT 'CORRECTIVE',
    "description" TEXT NOT NULL,
    "cost" DECIMAL(12,2),
    "current_km" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "parts_replaced" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "contract_id" TEXT,
    "measurement_id" TEXT,
    "invoice_number" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "paid_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_payments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "payment_method" TEXT,
    "bank_account" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defaulter_records" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "total_debt" DECIMAL(14,2) NOT NULL,
    "reason" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "defaulter_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_actions" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "performed_by_id" TEXT,
    "type" "CollectionActionType" NOT NULL,
    "action_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "result" TEXT,
    "next_action_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_agreements" (
    "id" TEXT NOT NULL,
    "defaulter_record_id" TEXT NOT NULL,
    "agreement_date" TIMESTAMP(3) NOT NULL,
    "original_debt" DECIMAL(14,2) NOT NULL,
    "discount_percent" DECIMAL(5,2),
    "final_amount" DECIMAL(14,2) NOT NULL,
    "installments" INTEGER NOT NULL,
    "notes" TEXT,
    "status" "AgreementStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biddings" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "bidding_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "opening_date" TIMESTAMP(3) NOT NULL,
    "closing_date" TIMESTAMP(3),
    "estimated_value" DECIMAL(14,2),
    "status" "BiddingStatus" NOT NULL DEFAULT 'OPEN',
    "required_docs" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_companies_user_id_company_id_key" ON "user_companies"("user_id", "company_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "customers_company_id_idx" ON "customers"("company_id");

-- CreateIndex
CREATE INDEX "customers_razao_social_idx" ON "customers"("razao_social");

-- CreateIndex
CREATE UNIQUE INDEX "customers_company_id_cpf_cnpj_key" ON "customers"("company_id", "cpf_cnpj");

-- CreateIndex
CREATE INDEX "suppliers_company_id_idx" ON "suppliers"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_company_id_cpf_cnpj_key" ON "suppliers"("company_id", "cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "asset_types_name_key" ON "asset_types"("name");

-- CreateIndex
CREATE INDEX "assets_company_id_idx" ON "assets"("company_id");

-- CreateIndex
CREATE INDEX "assets_status_idx" ON "assets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "assets_company_id_code_key" ON "assets"("company_id", "code");

-- CreateIndex
CREATE INDEX "asset_status_history_asset_id_idx" ON "asset_status_history"("asset_id");

-- CreateIndex
CREATE INDEX "asset_maintenances_asset_id_idx" ON "asset_maintenances"("asset_id");

-- CreateIndex
CREATE INDEX "contracts_company_id_idx" ON "contracts"("company_id");

-- CreateIndex
CREATE INDEX "contracts_customer_id_idx" ON "contracts"("customer_id");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_company_id_contract_number_key" ON "contracts"("company_id", "contract_number");

-- CreateIndex
CREATE INDEX "contract_items_contract_id_idx" ON "contract_items"("contract_id");

-- CreateIndex
CREATE INDEX "contract_addendums_contract_id_idx" ON "contract_addendums"("contract_id");

-- CreateIndex
CREATE INDEX "measurements_contract_id_idx" ON "measurements"("contract_id");

-- CreateIndex
CREATE INDEX "contract_movements_contract_id_idx" ON "contract_movements"("contract_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "vehicles_company_id_idx" ON "vehicles"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_cpf_key" ON "drivers"("cpf");

-- CreateIndex
CREATE INDEX "drivers_company_id_idx" ON "drivers"("company_id");

-- CreateIndex
CREATE INDEX "vehicle_checklists_vehicle_id_idx" ON "vehicle_checklists"("vehicle_id");

-- CreateIndex
CREATE INDEX "transport_orders_status_idx" ON "transport_orders"("status");

-- CreateIndex
CREATE INDEX "fuel_records_vehicle_id_idx" ON "fuel_records"("vehicle_id");

-- CreateIndex
CREATE INDEX "vehicle_maintenances_vehicle_id_idx" ON "vehicle_maintenances"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_measurement_id_key" ON "invoices"("measurement_id");

-- CreateIndex
CREATE INDEX "invoices_company_id_idx" ON "invoices"("company_id");

-- CreateIndex
CREATE INDEX "invoices_customer_id_idx" ON "invoices"("customer_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_due_date_idx" ON "invoices"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_company_id_invoice_number_key" ON "invoices"("company_id", "invoice_number");

-- CreateIndex
CREATE INDEX "invoice_payments_invoice_id_idx" ON "invoice_payments"("invoice_id");

-- CreateIndex
CREATE INDEX "defaulter_records_customer_id_idx" ON "defaulter_records"("customer_id");

-- CreateIndex
CREATE INDEX "collection_actions_invoice_id_idx" ON "collection_actions"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_agreements_defaulter_record_id_key" ON "payment_agreements"("defaulter_record_id");

-- CreateIndex
CREATE INDEX "biddings_company_id_idx" ON "biddings"("company_id");

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_companies" ADD CONSTRAINT "user_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_asset_type_id_fkey" FOREIGN KEY ("asset_type_id") REFERENCES "asset_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_status_history" ADD CONSTRAINT "asset_status_history_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenances" ADD CONSTRAINT "asset_maintenances_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_maintenances" ADD CONSTRAINT "asset_maintenances_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_items" ADD CONSTRAINT "contract_items_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_items" ADD CONSTRAINT "contract_items_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_addendums" ADD CONSTRAINT "contract_addendums_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_items" ADD CONSTRAINT "measurement_items_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "measurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_items" ADD CONSTRAINT "measurement_items_contract_item_id_fkey" FOREIGN KEY ("contract_item_id") REFERENCES "contract_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_movements" ADD CONSTRAINT "contract_movements_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_checklists" ADD CONSTRAINT "vehicle_checklists_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_orders" ADD CONSTRAINT "transport_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_orders" ADD CONSTRAINT "transport_orders_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_orders" ADD CONSTRAINT "transport_orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_orders" ADD CONSTRAINT "transport_orders_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_records" ADD CONSTRAINT "fuel_records_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_maintenances" ADD CONSTRAINT "vehicle_maintenances_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_maintenances" ADD CONSTRAINT "vehicle_maintenances_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "measurements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defaulter_records" ADD CONSTRAINT "defaulter_records_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_actions" ADD CONSTRAINT "collection_actions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_actions" ADD CONSTRAINT "collection_actions_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_agreements" ADD CONSTRAINT "payment_agreements_defaulter_record_id_fkey" FOREIGN KEY ("defaulter_record_id") REFERENCES "defaulter_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biddings" ADD CONSTRAINT "biddings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
