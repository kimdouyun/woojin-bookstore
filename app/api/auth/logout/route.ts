import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const sessionsFilePath = path.join(process.cwd(), 'data', 'sessions.json');

// POST: 로그아웃
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (sessionToken && fs.existsSync(sessionsFilePath)) {
      const sessions = JSON.parse(fs.readFileSync(sessionsFilePath, 'utf-8'));
      delete sessions[sessionToken];
      fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 2));
    }

    const response = NextResponse.json({ message: '로그아웃되었습니다.' });
    response.cookies.delete('session_token');

    return response;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

