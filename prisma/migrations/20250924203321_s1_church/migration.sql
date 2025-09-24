-- CreateTable
CREATE TABLE "public"."Church" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" VARCHAR(20),
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "addressLine" TEXT,
    "addressExtra" TEXT,
    "district" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "presbytery" TEXT,
    "organizedAt" TIMESTAMP(3),
    "logoUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Church_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Church" ADD CONSTRAINT "Church_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Church" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS church_isolation_select ON "Church";
CREATE POLICY church_isolation_select
  ON "Church" FOR SELECT
  USING ("id" = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS church_isolation_mod ON "Church";
CREATE POLICY church_isolation_mod
  ON "Church" FOR ALL
  USING ("id" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("id" = current_setting('app.tenant_id', true)::uuid);
