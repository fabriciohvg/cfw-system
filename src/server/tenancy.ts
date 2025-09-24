// /src/server/tenancy.ts
import { prisma } from "@/server/db";
import { hashPassword } from "@/lib/password";

function isPlatformAdmin(email?: string | null) {
  if (!email) return false;
  const raw = process.env.PLATFORM_ADMINS || "";
  const list = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export async function createTenantAndAdmin(params: {
  requesterEmail: string;
  slug: string;
  displayName: string;
  adminEmail: string;
  adminPassword: string;
}) {
  const { requesterEmail, slug, displayName, adminEmail, adminPassword } =
    params;
  if (!isPlatformAdmin(requesterEmail))
    throw new Error("forbidden:not-platform-admin");

  // Regras simples
  if (!/^[a-z0-9-]{3,32}$/.test(slug)) throw new Error("invalid:slug");
  if (displayName.length < 3) throw new Error("invalid:displayName");

  const tenantId = crypto.randomUUID();
  const passHash = await hashPassword(adminPassword);

  // Transação: fixa app.tenant_id = tenantId e cria tudo dentro do RLS
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;

    // 1) Cria o tenant com ID explícito (bate no WITH CHECK do RLS)
    await tx.tenant.create({
      data: { id: tenantId, slug, displayName },
    });

    // 2) Upsert do usuário admin (global)
    const user = await tx.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: { passwordHash: passHash },
      create: { email: adminEmail.toLowerCase(), passwordHash: passHash },
      select: { id: true },
    });

    // 3) Vincula ao tenant como ADMIN
    await tx.userTenant.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId } },
      update: { role: "ADMIN", isPrimaryAdmin: true },
      create: {
        userId: user.id,
        tenantId,
        role: "ADMIN",
        isPrimaryAdmin: true,
      },
    });

    return { tenantId, slug };
  });
}
