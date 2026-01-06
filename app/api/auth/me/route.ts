import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const runtime = "nodejs";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "auth_token";

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ ok: false, user: null }, { status: 401 });

  const secret = process.env.AUTH_JWT_SECRET!;
  const key = new TextEncoder().encode(secret);

  try {
    const { payload } = await jwtVerify(token, key);
    return NextResponse.json({ ok: true, user: payload });
  } catch {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }
}
