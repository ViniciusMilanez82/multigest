-- AlterTable: contracts - add contract_signed_at
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "contract_signed_at" TIMESTAMP(3);

-- AlterTable: contract_items - add scheduled_delivery_date, delivery_blocked_reason
ALTER TABLE "contract_items" ADD COLUMN IF NOT EXISTS "scheduled_delivery_date" TIMESTAMP(3);
ALTER TABLE "contract_items" ADD COLUMN IF NOT EXISTS "delivery_blocked_reason" TEXT;

-- AlterEnum: MovementType - add RETIRADA, REMOCAO, TROCA_AR
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'RETIRADA';
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'REMOCAO';
ALTER TYPE "MovementType" ADD VALUE IF NOT EXISTS 'TROCA_AR';

-- CreateEnum ServiceOrderType
CREATE TYPE "ServiceOrderType" AS ENUM ('INSTALACAO', 'RETIRADA', 'REMOCAO', 'TROCA_AR', 'MANUTENCAO');

-- CreateEnum ServiceOrderStatus
CREATE TYPE "ServiceOrderStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable contract_analyses
CREATE TABLE IF NOT EXISTS "contract_analyses" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "proposal_number" TEXT,
    "proposal_date" TIMESTAMP(3),
    "customer_name" TEXT,
    "cnpj" TEXT,
    "address_cnpj" TEXT,
    "address_install" TEXT,
    "contact_comercial" TEXT,
    "contact_financeiro" TEXT,
    "contact_recebimento" TEXT,
    "responsible" TEXT,
    "witness" TEXT,
    "equipment_models" TEXT,
    "monthly_value" DECIMAL(14,2),
    "months_rental" INTEGER,
    "expected_exit" TIMESTAMP(3),
    "extra_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable supply_orders
CREATE TABLE IF NOT EXISTS "supply_orders" (
    "id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "supply_number" TEXT NOT NULL,
    "customer_name" TEXT,
    "mobilization" BOOLEAN NOT NULL DEFAULT false,
    "equipment_count" INTEGER,
    "delivery_date" TIMESTAMP(3),
    "layout_notes" TEXT,
    "technical_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supply_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable service_orders
CREATE TABLE IF NOT EXISTS "service_orders" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "type" "ServiceOrderType" NOT NULL,
    "address" TEXT,
    "address_to" TEXT,
    "phone" TEXT,
    "scheduled_date" TIMESTAMP(3),
    "freight_value" DECIMAL(14,2),
    "extra_tax" DECIMAL(14,2),
    "notes" TEXT,
    "status" "ServiceOrderStatus" NOT NULL DEFAULT 'PENDING',
    "emit_nf" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "contract_analyses_contract_id_idx" ON "contract_analyses"("contract_id");
CREATE UNIQUE INDEX IF NOT EXISTS "supply_orders_contract_id_supply_number_key" ON "supply_orders"("contract_id", "supply_number");
CREATE INDEX IF NOT EXISTS "supply_orders_contract_id_idx" ON "supply_orders"("contract_id");
CREATE UNIQUE INDEX IF NOT EXISTS "service_orders_company_id_order_number_key" ON "service_orders"("company_id", "order_number");
CREATE INDEX IF NOT EXISTS "service_orders_contract_id_idx" ON "service_orders"("contract_id");
CREATE INDEX IF NOT EXISTS "service_orders_company_id_idx" ON "service_orders"("company_id");

-- AddForeignKey
ALTER TABLE "contract_analyses" ADD CONSTRAINT "contract_analyses_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supply_orders" ADD CONSTRAINT "supply_orders_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
