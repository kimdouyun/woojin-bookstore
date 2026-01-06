import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { SignJWT } from "jose";

export const runtime = "nodejs";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "auth_token";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

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
    // ✅ env 체크 (지금 같은 문제 재발 방지)
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json(
        { ok: false, error: "Missing supabase env in login route", hasUrl: !!url, hasKey: !!key },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "사용자명과 비밀번호는 필수입니다." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const normUsername = String(username).trim();

    // ✅ DB에서 유저 찾기
    const { data: user, error: selectErr } = await supabase
      .from("users")
      .select("id, username, password_hash, is_admin")
      .eq("username", normUsername)
      .maybeSingle();

    if (selectErr) {
      console.error("LOGIN_SELECT_ERROR:", selectErr);
      return NextResponse.json({ ok: false, error: "db_select_failed", details: selectErr }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    // ✅ bcrypt 비교
    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    // ✅ JWT 발급 + httpOnly 쿠키 저장
    const token = await signToken({
      sub: user.id,
      username: user.username,
      isAdmin: user.is_admin,
    });

    const res = NextResponse.json(
      { ok: true, message: "로그인 성공", user: { id: user.id, username: user.username, isAdmin: user.is_admin } },
      { status: 200 }
    );

    res.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: true,     // Amplify HTTPS라 true 권장
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (e: any) {
    console.error("로그인 오류:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
