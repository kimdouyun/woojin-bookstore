import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";

export const runtime = "nodejs";

// GET /api/books/:id
export async function GET(_: Request, context: any) {
  const id = context?.params?.id as string;

  const { supabase, error } = getSupabaseAdmin();
  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

  const { data, error: dbErr } = await supabase.from("books").select("*").eq("id", id).maybeSingle();

  if (dbErr) return NextResponse.json({ ok: false, error: "db_select_failed", details: dbErr }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return NextResponse.json({ ok: true, book: data }, { status: 200 });
}

// PATCH /api/books/:id (관리자만)
export async function PATCH(req: Request, context: any) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const id = context?.params?.id as string;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });

  const patch: any = {};
  const allowed = ["title", "author", "cover_image", "rating", "review", "published_date", "genre"];
  for (const k of allowed) if (body[k] !== undefined) patch[k] = body[k];

  if (patch.title !== undefined) patch.title = String(patch.title);
  if (patch.author !== undefined) patch.author = String(patch.author);
  if (patch.cover_image !== undefined) patch.cover_image = patch.cover_image ? String(patch.cover_image) : null;
  if (patch.review !== undefined) patch.review = patch.review ? String(patch.review) : null;
  if (patch.genre !== undefined) patch.genre = patch.genre ? String(patch.genre) : null;
  if (patch.published_date !== undefined) patch.published_date = patch.published_date ? String(patch.published_date) : null;
  if (patch.rating !== undefined) patch.rating = Number(patch.rating);

  const { supabase, error } = getSupabaseAdmin();
  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

  const { data, error: updErr } = await supabase.from("books").update(patch).eq("id", id).select("*").single();
  if (updErr) return NextResponse.json({ ok: false, error: "db_update_failed", details: updErr }, { status: 500 });

  return NextResponse.json({ ok: true, book: data }, { status: 200 });
}

// DELETE /api/books/:id (관리자만)
export async function DELETE(_: Request, context: any) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const id = context?.params?.id as string;

  const { supabase, error } = getSupabaseAdmin();
  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

  const { error: delErr } = await supabase.from("books").delete().eq("id", id);
  if (delErr) return NextResponse.json({ ok: false, error: "db_delete_failed", details: delErr }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 200 });
}
