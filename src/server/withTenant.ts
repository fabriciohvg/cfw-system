import { prisma } from "./db";
import type { PrismaClient, Prisma } from "@prisma/client";

// Type alias for better readability
type PrismaTransaction = Prisma.TransactionClient;

/**
 * Usa o tenantId já conhecido: seta GUC e executa as queries dentro da MESMA conexão (transação).
 */

export async function withTenant<T>(
  tenantId: string,
  fn: (tx: PrismaTransaction) => Promise<T>
) {
  return prisma.$transaction(async (tx) => {
    // Em vez de: SET LOCAL app.tenant_id = ${tenantId}
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    return fn(tx);
  });
}

/**
 * Resolve o tenant a partir do slug (subdomínio):
 * 1) Seta app.tenant_slug para permitir SELECT em "Tenant" pela política;
 * 2) Busca o tenant pelo slug;
 * 3) Seta app.tenant_id e executa as queries isoladas no tenant.
 */
export async function withTenantBySlug<T>(
  slug: string,
  fn: (
    tx: PrismaTransaction,
    tenant: { id: string; slug: string }
  ) => Promise<T>
) {
  return prisma.$transaction(async (tx) => {
    // 1) Permite SELECT por slug via política RLS
    await tx.$executeRaw`SELECT set_config('app.tenant_slug', ${slug}, true)`;

    // 2) Resolve tenant pelo slug (corrige o objeto)
    const tenant = await tx.tenant.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });
    if (!tenant) throw new Error("Tenant não encontrado (slug inválido).");

    // 3) Isola o restante das queries no tenant
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenant.id}, true)`;

    return fn(tx, tenant);
  });
}
