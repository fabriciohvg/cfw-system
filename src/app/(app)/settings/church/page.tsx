// /src/app/(app)/settings/church/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { withTenantBySlug } from "@/server/withTenant";
import ChurchForm from "./ChurchForm";

export default async function ChurchSettingsPage() {
  const session = await auth();
  if (!session?.user?.id)
    redirect(`/login?callbackUrl=${encodeURIComponent("/settings/church")}`);

  const headersList = await headers();
  const slug =
    headersList.get("x-tenant-slug") ?? process.env.DEFAULT_TENANT_SLUG ?? "";
  const data = await withTenantBySlug(slug, async (tx, tenant) => {
    const me = await tx.userTenant.findUnique({
      where: {
        userId_tenantId: { userId: session.user.id, tenantId: tenant.id },
      },
      select: { role: true },
    });
    if (!me) redirect("/"); // não-membro
    const church = await tx.church.findUnique({ where: { id: tenant.id } });
    return {
      role: me.role as "ADMIN" | "APPROVER" | "CONTRIBUTOR" | "READER",
      church: church
        ? {
            ...church,
            organizedAt:
              church.organizedAt?.toISOString().split("T")[0] ?? null,
          }
        : null,
    };
  });

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Configurações da Igreja</h1>
      <ChurchForm initial={data.church} role={data.role} />
    </main>
  );
}
