-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'APPROVER', 'CONTRIBUTOR', 'READER');

-- CreateTable
CREATE TABLE "public"."Tenant" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password_hash" TEXT,
    "two_factor_secret" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserTenant" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "role" "public"."Role" NOT NULL,
    "isPrimaryAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "oauth_token_secret" TEXT,
    "oauth_token" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "public"."Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "UserTenant_tenantId_idx" ON "public"."UserTenant"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTenant_userId_tenantId_key" ON "public"."UserTenant"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "public"."UserTenant" ADD CONSTRAINT "UserTenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserTenant" ADD CONSTRAINT "UserTenant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- RLS
ALTER TABLE "Tenant"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserTenant" ENABLE ROW LEVEL SECURITY;

-- Tenant: SELECT por slug (descobrir tenant antes do app.tenant_id)
DROP POLICY IF EXISTS tenant_select_by_slug ON "Tenant";
CREATE POLICY tenant_select_by_slug
  ON "Tenant" FOR SELECT
  USING ("slug" = current_setting('app.tenant_slug', true));

-- Tenant: isolamento por id (UUID)
DROP POLICY IF EXISTS tenant_isolation_select ON "Tenant";
CREATE POLICY tenant_isolation_select
  ON "Tenant" FOR SELECT
  USING ("id" = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS tenant_isolation_mod ON "Tenant";
CREATE POLICY tenant_isolation_mod
  ON "Tenant" FOR ALL
  USING ("id" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("id" = current_setting('app.tenant_id', true)::uuid);

-- UserTenant: isolamento por tenantId (UUID)
DROP POLICY IF EXISTS usertenant_isolation_select ON "UserTenant";
CREATE POLICY usertenant_isolation_select
  ON "UserTenant" FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS usertenant_isolation_mod ON "UserTenant";
CREATE POLICY usertenant_isolation_mod
  ON "UserTenant" FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);
