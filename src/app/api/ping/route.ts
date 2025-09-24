import { NextResponse } from "next/server";
import { withTenantBySlug } from "@/src/server/withTenant";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const slug = req.headers.get("x-tenant-slug") || "";
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "x-tenant-slug ausente" },
      { status: 400 }
    );
  }

  const data = await withTenantBySlug(slug, async (tx, tenant) => {
    const count = await tx.userTenant.count({ where: { tenantId: tenant.id } });
    return { tenant, usersInTenant: count };
  });

  return NextResponse.json({ ok: true, data });
}
