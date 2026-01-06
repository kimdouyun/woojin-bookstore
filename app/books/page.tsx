"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Book = {
  id: string;
  title: string;
  author: string;
  cover_image: string | null;
  rating: number;
  review: string | null;
  published_date: string | null;
  genre: string | null;
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();
        setBooks(Array.isArray(data?.books) ? data.books : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-spin">📚</div>
          <p className="text-gray-600 text-lg">책을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">책 목록</h1>
          <p className="text-gray-600">읽어온 책들을 둘러보세요</p>
        </div>

        {books.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-gray-500 text-lg">등록된 책이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="relative w-full h-64 bg-gradient-to-br from-amber-100 to-orange-100">
                  {book.cover_image ? (
                    <Image
                      src={book.cover_image}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-6xl opacity-30">📚</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {book.title}
                  </h2>
                  <p className="text-gray-600 mb-3">{book.author}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-amber-500">⭐</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {book.rating} / 5
                      </span>
                    </div>
                    {book.genre && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                        {book.genre}
                      </span>
                    )}
                  </div>
                  {book.review && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{book.review}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
