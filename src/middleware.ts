// /src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const IGNORED_SUBS = new Set(["www", "app"]);
const SKIP_PREFIXES = ["/api/auth", "/_next/", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Ignore rotas/ativos que não precisam do header
  // - /api/auth (NextAuth), _next/*, favicon, e QUALQUER arquivo com extensão (ex.: .png, .css, .js)
  if (
    SKIP_PREFIXES.some((p) => pathname.startsWith(p)) ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2) Extrai subdomínio
  const host = (req.headers.get("host") ?? "").split(":")[0];
  let sub: string | null = null;

  // Dev: demo.localhost:3000 → "demo"
  if (host.endsWith(".localhost")) {
    const parts = host.split(".");
    if (parts.length >= 2) sub = parts[0];
  } else {
    // Prod: foo.seu-dominio.com.br → "foo"
    const parts = host.split(".");
    if (parts.length >= 3) sub = parts[0];
  }

  if (sub && IGNORED_SUBS.has(sub)) sub = null;

  // 3) Injeta o header x-tenant-slug (ou fallback do .env)
  const requestHeaders = new Headers(req.headers);
  if (sub) {
    requestHeaders.set("x-tenant-slug", sub);
  } else if (process.env.DEFAULT_TENANT_SLUG) {
    requestHeaders.set("x-tenant-slug", process.env.DEFAULT_TENANT_SLUG!);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

// Matcher amplo (sem grupos de captura); filtramos dentro do middleware
export const config = {
  matcher: "/:path*",
};
