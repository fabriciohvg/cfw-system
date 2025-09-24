// /src/app/(platform)/admin/tenants/new/actions.ts
"use server";
import { auth } from "@/auth";
import { createTenantAndAdmin } from "@/server/tenancy";
import { redirect } from "next/navigation";

export async function createTenant(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("unauthorized");

  const slug = String(formData.get("slug") || "").trim();
  const displayName = String(formData.get("displayName") || "").trim();
  const adminEmail = String(formData.get("adminEmail") || "").trim();
  const adminPassword = String(formData.get("adminPassword") || "").trim();

  const { slug: created } = await createTenantAndAdmin({
    requesterEmail: session.user.email,
    slug,
    displayName,
    adminEmail,
    adminPassword,
  });

  redirect(`/admin/tenants/${created}/ok`);
}
