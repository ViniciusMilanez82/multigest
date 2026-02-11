-- CreateEnum
CREATE TYPE "ProposalType" AS ENUM ('VENDA', 'LOCACAO', 'EVENTO');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('RASCUNHO', 'ENVIADA', 'ACEITA', 'RECUSADA', 'CONVERTIDA');

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "proposal_number" TEXT NOT NULL,
    "type" "ProposalType" NOT NULL DEFAULT 'LOCACAO',
    "status" "ProposalStatus" NOT NULL DEFAULT 'RASCUNHO',
    "items" JSONB NOT NULL DEFAULT '[]',
    "valor_total" DECIMAL(14,2) NOT NULL,
    "company_name" TEXT,
    "contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contract_id" TEXT,
    "invoice_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proposals_company_id_proposal_number_key" ON "proposals"("company_id", "proposal_number");

-- CreateIndex
CREATE INDEX "proposals_company_id_idx" ON "proposals"("company_id");

-- CreateIndex
CREATE INDEX "proposals_status_idx" ON "proposals"("status");

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
