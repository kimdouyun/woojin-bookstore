import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    has_SUPABASE_URL: !!process.env.SUPABASE_URL,
    has_SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    has_AUTH_JWT_SECRET: !!process.env.AUTH_JWT_SECRET,
    node_env: process.env.NODE_ENV,
  });
}
