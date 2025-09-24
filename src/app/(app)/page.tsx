// /src/app/(app)/page.tsx
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=${encodeURIComponent("/")}`);
  return <div className="p-6">Bem-vindo, {session.user.email}</div>;
}
