import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'books.json');

function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
  }
}

// GET: 특정 책 정보 가져오기
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const books = JSON.parse(data);
    const book = books.find((b: any) => b.id === params.id);
    
    if (!book) {
      return NextResponse.json({ error: '책을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json(book);
  } catch (error) {
    console.error('책 조회 오류:', error);
    return NextResponse.json({ error: '책 정보를 불러올 수 없습니다.' }, { status: 500 });
  }
}

// PUT: 책 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    ensureDataFile();
    const body = await request.json();
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const books = JSON.parse(data);
    
    const index = books.findIndex((b: any) => b.id === params.id);
    if (index === -1) {
      return NextResponse.json({ error: '책을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    books[index] = {
      ...books[index],
      title: body.title,
      author: body.author,
      coverImage: body.coverImage,
      rating: body.rating,
      review: body.review,
      publishedDate: body.publishedDate || null,
      genre: body.genre || null,
      updatedAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(dataFilePath, JSON.stringify(books, null, 2));
    
    return NextResponse.json(books[index]);
  } catch (error) {
    console.error('책 수정 오류:', error);
    return NextResponse.json({ error: '책을 수정할 수 없습니다.' }, { status: 500 });
  }
}

// DELETE: 책 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    ensureDataFile();
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    const books = JSON.parse(data);
    
    const filteredBooks = books.filter((b: any) => b.id !== params.id);
    
    if (filteredBooks.length === books.length) {
      return NextResponse.json({ error: '책을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    fs.writeFileSync(dataFilePath, JSON.stringify(filteredBooks, null, 2));
    
    return NextResponse.json({ message: '책이 삭제되었습니다.' });
  } catch (error) {
    console.error('책 삭제 오류:', error);
    return NextResponse.json({ error: '책을 삭제할 수 없습니다.' }, { status: 500 });
  }
}

