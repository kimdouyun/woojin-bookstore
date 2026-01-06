import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: any) {
  const id = String(ctx?.params?.id ?? "");

  const { supabase, error } = getSupabaseAdmin();
  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

  const { data, error: dbErr } = await supabase.from("books").select("*").eq("id", id).maybeSingle();
  if (dbErr) return NextResponse.json({ ok: false, error: "db_select_failed", details: dbErr }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return NextResponse.json({ ok: true, book: data }, { status: 200 });
}

export async function PATCH(req: Request, ctx: any) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const id = String(ctx?.params?.id ?? "");
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

  const patch: any = {};
  const allowed = ["title", "author", "cover_image", "rating", "review", "published_date", "genre"];
  for (const k of allowed) if (body[k] !== undefined) patch[k] = body[k];
  if (patch.rating !== undefined) patch.rating = Number(patch.rating);

  const { supabase, error } = getSupabaseAdmin();
  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

  const { data, error: upErr } = await supabase.from("books").update(patch).eq("id", id).select("*").single();
  if (upErr) return NextResponse.json({ ok: false, error: "db_update_failed", details: upErr }, { status: 500 });

  return NextResponse.json({ ok: true, book: data }, { status: 200 });
}

export async function DELETE(_: Request, ctx: any) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const id = String(ctx?.params?.id ?? "");

  const { supabase, error } = getSupabaseAdmin();
  if (error) return NextResponse.json({ ok: false, error }, { status: 500 });

  const { error: delErr } = await supabase.from("books").delete().eq("id", id);
  if (delErr) return NextResponse.json({ ok: false, error: "db_delete_failed", details: delErr }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 200 });
}
