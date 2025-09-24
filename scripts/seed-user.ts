// /scripts/seed-user.ts
import { prisma } from "@/src/server/db";
import { hashPassword } from "@/src/lib/password";

const slug = process.argv[2] || "demo";
const email = process.argv[3] || "admin@demo.local";
const pass = process.argv[4] || "Senha123!";

async function main() {
  // habilita SELECT por slug e resolve tenantId
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_slug', ${slug}, true)`;
    const tenant = await tx.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!tenant) throw new Error(`Tenant '${slug}' não existe`);
    const passwordHash = await hashPassword(pass);
    const user = await tx.user.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
      select: { id: true },
    });
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenant.id}, true)`;
    await tx.userTenant.upsert({
      where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
      update: { role: "ADMIN", isPrimaryAdmin: true },
      create: {
        userId: user.id,
        tenantId: tenant.id,
        role: "ADMIN",
        isPrimaryAdmin: true,
      },
    });
    console.log(`OK: ${email} / ${pass}`);
  });
}
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
