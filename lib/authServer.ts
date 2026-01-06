import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "auth_token";

export async function getAuthPayload() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) return null;

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return payload as any;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const payload = await getAuthPayload();
  if (!payload) return { ok: false as const, status: 401 as const, error: "unauthorized" as const };

  if (payload.isAdmin !== true) {
    return { ok: false as const, status: 403 as const, error: "forbidden" as const };
  }

  return { ok: true as const, status: 200 as const, payload };
}
