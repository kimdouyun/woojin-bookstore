import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { username, email, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, error: "사용자명과 비밀번호는 필수입니다." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { ok: false, error: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const normUsername = String(username).trim();
    const normEmail = email ? String(email).trim().toLowerCase() : null;

    // username 중복 체크
    const { data: existU, error: existUErr } = await supabase
      .from("users")
      .select("id")
      .eq("username", normUsername)
      .maybeSingle();

    if (existUErr) {
      console.error("REGISTER_SELECT_USERNAME_ERROR:", existUErr);
      return NextResponse.json({ ok: false, error: "db_select_failed", details: existUErr }, { status: 500 });
    }
    if (existU) {
      return NextResponse.json({ ok: false, error: "이미 존재하는 사용자명입니다." }, { status: 409 });
    }

    // email 중복 체크(있으면)
    if (normEmail) {
      const { data: existE, error: existEErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", normEmail)
        .maybeSingle();

      if (existEErr) {
        console.error("REGISTER_SELECT_EMAIL_ERROR:", existEErr);
        return NextResponse.json({ ok: false, error: "db_select_failed", details: existEErr }, { status: 500 });
      }
      if (existE) {
        return NextResponse.json({ ok: false, error: "이미 존재하는 이메일입니다." }, { status: 409 });
      }
    }

    const password_hash = await bcrypt.hash(String(password), 12);

    const { data: inserted, error: insertErr } = await supabase
      .from("users")
      .insert({
        username: normUsername,
        email: normEmail,
        password_hash,
        is_admin: false,
      })
      .select("id, username, email, is_admin, created_at")
      .single();

    if (insertErr) {
      console.error("REGISTER_INSERT_ERROR:", insertErr);
      return NextResponse.json({ ok: false, error: "db_insert_failed", details: insertErr }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true, message: "회원가입이 완료되었습니다.", user: { id: inserted.id, username: inserted.username } },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("REGISTER_UNKNOWN_ERROR:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
