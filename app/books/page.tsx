'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  rating: number;
}

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('책 목록을 불러오는 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">책을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">📚 내가 읽은 책들</h1>
          <p className="text-xl text-gray-600">책을 클릭하여 리뷰를 확인하세요</p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              관리자 페이지
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              홈으로
            </button>
          </div>
        </div>

        {/* 책 그리드 */}
        {books.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-2xl text-gray-600 mb-4">아직 등록된 책이 없습니다</p>
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              첫 번째 책 추가하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                onClick={() => handleBookClick(book.id)}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-4xl">📖</div>
                    )}
                    <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded text-sm font-semibold">
                      ⭐ {book.rating}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 truncate group-hover:text-amber-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{book.author}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

