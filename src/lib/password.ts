// /src/lib/password.ts
import * as argon2 from "argon2";
export async function hashPassword(plain: string) {
  return argon2.hash(plain);
}
export async function verifyPassword(plain: string, hash: string) {
  return argon2.verify(hash, plain);
}
