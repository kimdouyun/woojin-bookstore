import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

function ensureUsersFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
  }
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST: 로그인
export async function POST(request: NextRequest) {
  try {
    ensureUsersFile();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const data = fs.readFileSync(usersFilePath, 'utf-8');
    const users = JSON.parse(data);

    const hashedPassword = hashPassword(password);
    const user = users.find(
      (u: any) => u.username === username && u.password === hashedPassword
    );

    if (!user) {
      return NextResponse.json(
        { error: '사용자명 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 세션 토큰 생성
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

    // 세션 정보를 쿠키에 저장
    const response = NextResponse.json(
      {
        message: '로그인 성공',
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      },
      { status: 200 }
    );

    // 쿠키 설정
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    });

    // 세션 정보를 파일에 저장 (실제로는 Redis나 DB 사용 권장)
    const sessionsFilePath = path.join(process.cwd(), 'data', 'sessions.json');
    let sessions: any = {};
    if (fs.existsSync(sessionsFilePath)) {
      sessions = JSON.parse(fs.readFileSync(sessionsFilePath, 'utf-8'));
    }
    sessions[sessionToken] = {
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      expiresAt: expiresAt.toISOString(),
    };
    fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2));

    return response;
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

