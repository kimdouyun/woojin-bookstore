import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'books.json');

// 데이터 파일 초기화
function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
  }
}

// GET: 모든 책 목록 가져오기
export async function GET() {
  try {
    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const books = JSON.parse(data);
    return NextResponse.json(books);
  } catch (error) {
    console.error('책 목록 조회 오류:', error);
    return NextResponse.json({ error: '책 목록을 불러올 수 없습니다.' }, { status: 500 });
  }
}

// POST: 새 책 추가
export async function POST(request: NextRequest) {
  try {
    ensureDataFile();
    const body = await request.json();
    
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const books = JSON.parse(data);
    
    const newBook = {
      id: Date.now().toString(),
      title: body.title,
      author: body.author,
      coverImage: body.coverImage,
      rating: body.rating,
      review: body.review,
      publishedDate: body.publishedDate || null,
      genre: body.genre || null,
      createdAt: new Date().toISOString(),
    };
    
    books.push(newBook);
    fs.writeFileSync(dataFilePath, JSON.stringify(books, null, 2));
    
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('책 추가 오류:', error);
    return NextResponse.json({ error: '책을 추가할 수 없습니다.' }, { status: 500 });
  }
}

