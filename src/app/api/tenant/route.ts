// /src/app/api/tenant/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { withTenantBySlug } from "@/server/withTenant";

export const runtime = "nodejs";

function getSlug(req: Request) {
  return (
    req.headers.get("x-tenant-slug") || process.env.DEFAULT_TENANT_SLUG || ""
  );
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }
  const slug = getSlug(req);
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "tenant slug missing" },
      { status: 400 }
    );
  }

  const data = await withTenantBySlug(slug, async (tx, tenant) => {
    // Confirma que o usuário pertence ao tenant
    const me = await tx.userTenant.findUnique({
      where: {
        userId_tenantId: { userId: session.user.id, tenantId: tenant.id },
      },
      select: { role: true },
    });
    if (!me) throw new Error("forbidden:not-member");

    const usersCount = await tx.userTenant.count({
      where: { tenantId: tenant.id },
    });

    // Pode ler o próprio Tenant graças ao RLS (id = app.tenant_id)
    const t = await tx.tenant.findUnique({
      where: { slug: tenant.slug },
      select: { id: true, slug: true, displayName: true, createdAt: true },
    });

    return { meRole: me.role, usersCount, tenant: t };
  });

  return NextResponse.json({ ok: true, data });
}

const PatchSchema = z.object({
  displayName: z.string().min(3).max(120),
});

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }
  const slug = getSlug(req);
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "tenant slug missing" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid body", details: parsed.error.format() },
      { status: 400 }
    );
  }

  try {
    const data = await withTenantBySlug(slug, async (tx, tenant) => {
      // Verifica papel do usuário no tenant
      const me = await tx.userTenant.findUnique({
        where: {
          userId_tenantId: { userId: session.user.id, tenantId: tenant.id },
        },
        select: { role: true },
      });
      if (!me) throw new Error("forbidden:not-member");
      if (me.role !== "ADMIN") throw new Error("forbidden:not-admin");

      // Atualiza o Tenant (RLS garante que é o tenant atual)
      const updated = await tx.tenant.update({
        where: { id: tenant.id },
        data: { displayName: parsed.data.displayName },
        select: { id: true, slug: true, displayName: true, updatedAt: true },
      });
      return updated;
    });

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    const msg = String(e?.message ?? e);
    if (msg.startsWith("forbidden")) {
      return NextResponse.json({ ok: false, error: msg }, { status: 403 });
    }
    return NextResponse.json(
      { ok: false, error: "unexpected_error", details: msg },
      { status: 500 }
    );
  }
}
