import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { SignJWT } from "jose";

export const runtime = "nodejs";
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "auth_token";

async function signToken(payload: any) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("Missing AUTH_JWT_SECRET");
  const key = new TextEncoder().encode(secret);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "사용자명과 비밀번호는 필수입니다." }, { status: 400 });
    }

    const { supabase, error } = getSupabaseAdmin();
    if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

    const { data: user, error: selErr } = await supabase
      .from("users")
      .select("id, username, password_hash, is_admin")
      .eq("username", username)
      .maybeSingle();

    if (selErr) return NextResponse.json({ ok: false, error: "db_select_failed", details: selErr }, { status: 500 });
    if (!user) return NextResponse.json({ ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return NextResponse.json({ ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });

    const token = await signToken({ sub: user.id, username: user.username, isAdmin: user.is_admin });

    const res = NextResponse.json({ ok: true, user: { id: user.id, username: user.username, isAdmin: user.is_admin } });
    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
