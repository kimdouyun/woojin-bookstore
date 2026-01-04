import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const sessionsFilePath = path.join(process.cwd(), 'data', 'sessions.json');

// GET: 모든 사용자 목록 (관리자만)
export async function GET(request: NextRequest) {
  try {
    // 세션 확인
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken || !fs.existsSync(sessionsFilePath)) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const sessions = JSON.parse(fs.readFileSync(sessionsFilePath, 'utf-8'));
    const session = sessions[sessionToken];

    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 사용자 목록 반환 (비밀번호 제외)
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const usersWithoutPassword = users.map((u: any) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: usersWithoutPassword });
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자 목록을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 사용자 관리자 권한 설정/해제
export async function PUT(request: NextRequest) {
  try {
    // 세션 확인
    const sessionToken = request.cookies.get('session_token')?.value;
    if (!sessionToken || !fs.existsSync(sessionsFilePath)) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const sessions = JSON.parse(fs.readFileSync(sessionsFilePath, 'utf-8'));
    const session = sessions[sessionToken];

    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, isAdmin } = body;

    if (!userId || typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: '사용자 ID와 관리자 권한 값이 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 업데이트
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    users[userIndex].isAdmin = isAdmin;
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    // 세션 정보도 업데이트
    Object.keys(sessions).forEach((token) => {
      if (sessions[token].userId === userId) {
        sessions[token].isAdmin = isAdmin;
      }
    });
    fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2));

    return NextResponse.json({
      message: '관리자 권한이 업데이트되었습니다.',
      user: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        isAdmin: users[userIndex].isAdmin,
      },
    });
  } catch (error) {
    console.error('관리자 권한 설정 오류:', error);
    return NextResponse.json(
      { error: '관리자 권한을 설정할 수 없습니다.' },
      { status: 500 }
    );
  }
}

