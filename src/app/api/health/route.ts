// /src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const now = await prisma.$queryRaw<{ now: Date }[]>`SELECT now()`;
    return NextResponse.json({
      ok: true,
      db: "up",
      now: now?.[0]?.now ?? null,
      env: {
        databaseUrl: !!process.env.DATABASE_URL,
        directUrl: !!process.env.DIRECT_URL,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: String(e instanceof Error ? e.message : e) },
      { status: 500 }
    );
  }
}
