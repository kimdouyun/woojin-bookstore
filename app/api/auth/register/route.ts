import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// 데이터 파일 초기화
function ensureUsersFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
  }
}

// 비밀번호 해시 생성 (간단한 해시, 프로덕션에서는 bcrypt 사용 권장)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST: 회원가입
export async function POST(request: NextRequest) {
  try {
    ensureUsersFile();
    const body = await request.json();
    const { username, email, password } = body;

    // 입력 검증
    if (!username || !password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 기존 사용자 확인
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    const users = JSON.parse(data);

    if (users.find((u: any) => u.username === username)) {
      return NextResponse.json(
        { error: '이미 존재하는 사용자명입니다.' },
        { status: 400 }
      );
    }

    // 새 사용자 생성
    const newUser = {
      id: Date.now().toString(),
      username,
      email: email || null,
      password: hashPassword(password),
      isAdmin: false, // 기본값은 false, 관리자는 수동으로 설정
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.', user: { id: newUser.id, username: newUser.username } },
      { status: 201 }
    );
  } catch (error) {
    console.error('회원가입 오류:', error);
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

