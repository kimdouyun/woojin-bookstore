import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const sessionsFilePath = path.join(process.cwd(), 'data', 'sessions.json');
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// GET: 현재 로그인한 사용자 정보
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    if (!fs.existsSync(sessionsFilePath)) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const sessions = JSON.parse(fs.readFileSync(sessionsFilePath, 'utf-8'));
    const session = sessions[sessionToken];

    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 세션 만료 확인
    if (new Date(session.expiresAt) < new Date()) {
      delete sessions[sessionToken];
      fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2));
      return NextResponse.json(
        { error: '세션이 만료되었습니다.' },
        { status: 401 }
      );
    }

    // 사용자 정보 반환
    return NextResponse.json({
      user: {
        id: session.userId,
        username: session.username,
        isAdmin: session.isAdmin,
      },
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자 정보를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

