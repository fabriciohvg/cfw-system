import { prisma } from "./db";
import type { PrismaClient } from "@prisma/client";

/**
 * Usa o tenantId já conhecido: seta GUC e executa as queries dentro da MESMA conexão (transação).
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: PrismaClient) => Promise<T>
) {
  return prisma.$transaction(async (tx) => {
    // Garante isolamento por RLS (políticas com current_setting('app.tenant_id'))
    await tx.$executeRaw`SET LOCAL app.tenant_id = ${tenantId}`;
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
  fn: (tx: PrismaClient, tenant: { id: string; slug: string }) => Promise<T>
) {
  return prisma.$transaction(async (tx) => {
    // 1) Permite o SELECT por slug via RLS
    await tx.$executeRaw`SET LOCAL app.tenant_slug = ${slug}`;

    // 2) Resolve tenant
    const tenant = await tx.tenant.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    });
    if (!tenant) {
      throw new Error("Tenant não encontrado (slug inválido).");
    }

    // 3) Isola o restante das queries no tenant
    await tx.$executeRaw`SET LOCAL app.tenant_id = ${tenant.id}`;

    return fn(tx, tenant);
  });
}
