import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "auth_token";

export async function requireAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return { ok: false as const, status: 401 as const, error: "unauthorized" as const };

  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) return { ok: false as const, status: 500 as const, error: "missing_jwt_secret" as const };

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);

    // ✅ payload에 isAdmin이 true면 관리자
    const isAdmin = (payload as any).isAdmin === true || (payload as any).role === "admin";
    if (!isAdmin) return { ok: false as const, status: 403 as const, error: "forbidden" as const };

    return { ok: true as const, status: 200 as const, payload };
  } catch {
    return { ok: false as const, status: 401 as const, error: "invalid_token" as const };
  }
}
