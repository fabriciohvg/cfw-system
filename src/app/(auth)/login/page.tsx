// /src/app/(auth)/login/page.tsx
"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget as HTMLFormElement & {
      email: { value: string };
      password: { value: string };
    };
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email.value,
      password: form.password.value,
      redirectTo: callbackUrl, // v5 aceita redirectTo para pós-login
    });
    if (res?.error) {
      toast.error("Credenciais inválidas");
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="text-2xl font-semibold mb-6">Entrar</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          className="w-full rounded-md border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          required
          className="w-full rounded-md border px-3 py-2"
        />
        <button
          disabled={loading}
          className="w-full rounded-md px-3 py-2 bg-black text-white disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="text-2xl font-semibold mb-6">Entrar</h1>
      <div className="space-y-4">
        <div className="w-full rounded-md border px-3 py-2 bg-gray-100 animate-pulse h-10"></div>
        <div className="w-full rounded-md border px-3 py-2 bg-gray-100 animate-pulse h-10"></div>
        <div className="w-full rounded-md px-3 py-2 bg-gray-300 animate-pulse h-10"></div>
      </div>
    </div>
  );
}
