"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
import { withTenantBySlug } from "@/server/withTenant";
import { z } from "zod";

export type SaveChurchState = { ok: boolean; message?: string };

const schema = z.object({
  name: z.string().min(3),
  cnpj: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  addressLine: z.string().optional(),
  addressExtra: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  presbytery: z.string().optional(),
  organizedAt: z.string().optional(), // form envia string; convertemos se vier
  notes: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export async function saveChurch(
  _: SaveChurchState,
  formData: FormData
): Promise<SaveChurchState> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { ok: false, message: "unauthorized" };

    const headersList = await headers();
    const slug =
      headersList.get("x-tenant-slug") ?? process.env.DEFAULT_TENANT_SLUG ?? "";
    if (!slug) return { ok: false, message: "tenant missing" };

    const raw = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success) return { ok: false, message: "invalid data" };

    const data = parsed.data;
    const { organizedAt, ...restData } = data;
    const toUpdate: typeof restData & { organizedAt?: Date } = { ...restData };
    if (organizedAt) toUpdate.organizedAt = new Date(organizedAt);

    await withTenantBySlug(slug, async (tx, tenant) => {
      const me = await tx.userTenant.findUnique({
        where: {
          userId_tenantId: { userId: session.user.id, tenantId: tenant.id },
        },
        select: { role: true },
      });
      if (!me || me.role !== "ADMIN") throw new Error("forbidden");

      await tx.church.upsert({
        where: { id: tenant.id },
        update: toUpdate,
        create: { id: tenant.id, ...toUpdate },
      });
    });

    return { ok: true, message: "Igreja salva com sucesso" };
  } catch (e: unknown) {
    return { ok: false, message: String(e instanceof Error ? e.message : e) };
  }
}
