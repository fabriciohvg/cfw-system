// /src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
  }
}
