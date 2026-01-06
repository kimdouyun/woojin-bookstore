import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// 서버 전용 Supabase 클라이언트 (service role key 사용)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    // ENV 체크 (배포에서 누락되면 여기서 바로 잡힘)
    if (!process.env.SUPABASE_URL) {
      return NextResponse.json({ error: "Missing SUPABASE_URL" }, { status: 500 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { username, email, password } = body;

    // 입력 검증 (원래 코드 스타일 유지)
    if (!username || !password) {
      return NextResponse.json(
        { error: "사용자명과 비밀번호는 필수입니다." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const normUsername = String(username).trim();
    const normEmail = email ? String(email).trim().toLowerCase() : null;

    // username 중복 체크
    const { data: existingUser, error: userSelectErr } = await supabase
      .from("users")
      .select("id")
      .eq("username", normUsername)
      .maybeSingle();

    if (userSelectErr) {
      console.error("REGISTER_SELECT_USERNAME_ERROR:", userSelectErr);
      return NextResponse.json(
        { error: "db_select_failed", details: userSelectErr },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 존재하는 사용자명입니다." },
        { status: 400 }
      );
    }

    // email 중복 체크(이메일을 받는다면)
    if (normEmail) {
      const { data: existingEmail, error: emailSelectErr } = await supabase
        .from("users")
        .select("id")
        .eq("email", normEmail)
        .maybeSingle();

      if (emailSelectErr) {
        console.error("REGISTER_SELECT_EMAIL_ERROR:", emailSelectErr);
        return NextResponse.json(
          { error: "db_select_failed", details: emailSelectErr },
          { status: 500 }
        );
      }

      if (existingEmail) {
        return NextResponse.json(
          { error: "이미 존재하는 이메일입니다." },
          { status: 400 }
        );
      }
    }

    // 비밀번호 해시(bcrypt)
    const password_hash = await bcrypt.hash(String(password), 12);

    // insert
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
      return NextResponse.json(
        { error: "db_insert_failed", details: insertErr },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user: { id: inserted.id, username: inserted.username, isAdmin: inserted.is_admin },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("회원가입 오류:", error);
    return NextResponse.json(
      { error: error?.message ?? "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
