-- AlterTable: add unique constraint on contract_id for Proposal-Contract relation
CREATE UNIQUE INDEX IF NOT EXISTS "proposals_contract_id_key" ON "proposals"("contract_id");
