-- CreateTable
CREATE TABLE "item_families" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_subfamilies" (
    "id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "asset_type_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_subfamilies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "item_families_company_id_name_key" ON "item_families"("company_id", "name");

-- CreateIndex
CREATE INDEX "item_families_company_id_idx" ON "item_families"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_subfamilies_family_id_name_key" ON "item_subfamilies"("family_id", "name");

-- CreateIndex
CREATE INDEX "item_subfamilies_family_id_idx" ON "item_subfamilies"("family_id");

-- AddForeignKey
ALTER TABLE "item_families" ADD CONSTRAINT "item_families_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_subfamilies" ADD CONSTRAINT "item_subfamilies_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "item_families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_subfamilies" ADD CONSTRAINT "item_subfamilies_asset_type_id_fkey" FOREIGN KEY ("asset_type_id") REFERENCES "asset_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
