import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const commentsFilePath = path.join(process.cwd(), 'data', 'comments.json');

function ensureCommentsFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(commentsFilePath)) {
    fs.writeFileSync(commentsFilePath, JSON.stringify({}, null, 2));
  }
}

// GET: 특정 책의 댓글 목록 가져오기
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    ensureCommentsFile();
    const data = fs.readFileSync(commentsFilePath, 'utf-8');
    const allComments = JSON.parse(data);
    const comments = allComments[params.id] || [];
    
    // 최신순으로 정렬
    comments.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    return NextResponse.json({ error: '댓글을 불러올 수 없습니다.' }, { status: 500 });
  }
}

// POST: 새 댓글 추가
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    ensureCommentsFile();
    const body = await request.json();
    
    const data = fs.readFileSync(commentsFilePath, 'utf-8');
    const allComments = JSON.parse(data);
    
    if (!allComments[params.id]) {
      allComments[params.id] = [];
    }
    
    const newComment = {
      id: Date.now().toString(),
      author: body.author,
      content: body.content,
      createdAt: new Date().toISOString(),
    };
    
    allComments[params.id].push(newComment);
    fs.writeFileSync(commentsFilePath, JSON.stringify(allComments, null, 2));
    
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('댓글 추가 오류:', error);
    return NextResponse.json({ error: '댓글을 추가할 수 없습니다.' }, { status: 500 });
  }
}

