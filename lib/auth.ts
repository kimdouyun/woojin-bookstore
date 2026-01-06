import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sessionsFilePath = path.join(process.cwd(), 'data', 'sessions.json');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}


export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

// 현재 로그인한 사용자 정보 가져오기 (서버 컴포넌트용)
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken || !fs.existsSync(sessionsFilePath)) {
      return null;
    }

    const sessions = JSON.parse(fs.readFileSync(sessionsFilePath, 'utf-8'));
    const session = sessions[sessionToken];

    if (!session) {
      return null;
    }

    // 세션 만료 확인
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return {
      id: session.userId,
      username: session.username,
      isAdmin: session.isAdmin,
    };
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return null;
  }
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,{
  auth: { persistSession: false },
});



// 관리자 권한 확인
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  if (!user.isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  return user;
}

