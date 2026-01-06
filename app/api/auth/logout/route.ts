import { NextResponse } from "next/server";

export const runtime = "nodejs";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "auth_token";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: COOKIE_NAME, value: "", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
