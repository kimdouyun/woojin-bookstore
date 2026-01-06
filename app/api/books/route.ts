import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";

export const runtime = "nodejs";

export async function GET() {
  const { supabase, error } = getSupabaseAdmin();
  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

  const { data, error: dbErr } = await supabase.from("books").select("*").order("created_at", { ascending: false });
  if (dbErr) return NextResponse.json({ ok: false, error: "db_select_failed", details: dbErr }, { status: 500 });

  return NextResponse.json({ ok: true, books: data }, { status: 200 });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

  const payload = {
    title: String(body.title ?? ""),
    author: String(body.author ?? ""),
    cover_image: body.cover_image ? String(body.cover_image) : null,
    rating: body.rating !== undefined ? Number(body.rating) : 5,
    review: body.review ? String(body.review) : null,
    published_date: body.published_date ? String(body.published_date) : null,
    genre: body.genre ? String(body.genre) : null,
  };

  if (!payload.title || !payload.author) {
    return NextResponse.json({ ok: false, error: "title/author required" }, { status: 400 });
  }

  const { supabase, error } = getSupabaseAdmin();
  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

  const { data, error: insErr } = await supabase.from("books").insert(payload).select("*").single();
  if (insErr) return NextResponse.json({ ok: false, error: "db_insert_failed", details: insErr }, { status: 500 });

  return NextResponse.json({ ok: true, book: data }, { status: 201 });
}
