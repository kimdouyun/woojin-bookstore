import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const sessionsFilePath = path.join(process.cwd(), 'data', 'sessions.json');

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

