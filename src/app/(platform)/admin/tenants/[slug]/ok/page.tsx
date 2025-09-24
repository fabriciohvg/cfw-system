// /src/app/(platform)/admin/tenants/[slug]/ok/page.tsx
export default function Ok({ params }: { params: { slug: string } }) {
  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-xl font-semibold">Tenant criado</h1>
      <p className="mt-2 text-sm text-gray-600">
        Slug: <b>{params.slug}</b>
      </p>
    </main>
  );
}
