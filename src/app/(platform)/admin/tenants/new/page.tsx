// /src/app/(platform)/admin/tenants/new/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createTenant } from "./actions";

export const runtime = "nodejs";

export default async function NewTenantPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login?callbackUrl=/admin/tenants/new");

  // Checagem leve no server (UI final também pode esconder se não-admin)
  const allowed = (process.env.PLATFORM_ADMINS || "")
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(session.user.email.toLowerCase());

  if (!allowed) redirect("/");

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-semibold mb-4">Criar Tenant</h1>
      <form action={createTenant} className="space-y-3">
        <input
          name="slug"
          placeholder="slug (ex.: ipanapolis)"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="displayName"
          placeholder="Nome de exibição"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="adminEmail"
          type="email"
          placeholder="E-mail do Admin"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="adminPassword"
          type="password"
          placeholder="Senha inicial"
          required
          className="w-full border rounded px-3 py-2"
        />
        <button className="bg-black text-white rounded px-3 py-2">Criar</button>
      </form>
    </main>
  );
}
