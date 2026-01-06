import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

    const username = String(body.username ?? "").trim();
    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json({ ok: false, error: "사용자명과 비밀번호는 필수입니다." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: "비밀번호는 최소 6자 이상이어야 합니다." }, { status: 400 });
    }

    const { supabase, error } = getSupabaseAdmin();
    if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

    // username 중복 체크
    const { data: existU, error: existUErr } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existUErr) return NextResponse.json({ ok: false, error: "db_select_failed", details: existUErr }, { status: 500 });
    if (existU) return NextResponse.json({ ok: false, error: "이미 존재하는 사용자명입니다." }, { status: 409 });

    if (email) {
      const { data: existE, error: existEErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existEErr) return NextResponse.json({ ok: false, error: "db_select_failed", details: existEErr }, { status: 500 });
      if (existE) return NextResponse.json({ ok: false, error: "이미 존재하는 이메일입니다." }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: inserted, error: insErr } = await supabase
      .from("users")
      .insert({ username, email, password_hash, is_admin: false })
      .select("id, username, is_admin, created_at")
      .single();

    if (insErr) return NextResponse.json({ ok: false, error: "db_insert_failed", details: insErr }, { status: 500 });

    return NextResponse.json({ ok: true, user: { id: inserted.id, username: inserted.username } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
