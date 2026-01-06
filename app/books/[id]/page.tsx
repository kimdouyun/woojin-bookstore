"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type BookRow = {
  id: string;
  title: string;
  author: string;
  cover_image: string | null;
  rating: number;
  review: string | null;
  published_date: string | null;
  genre: string | null;
  created_at?: string;
};

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [book, setBook] = useState<BookRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const res = await fetch(`/api/books/${id}`);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setBook(null);
          return;
        }

        setBook(data?.book ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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

  if (!book) {
    return (
      <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/books"
            className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium mb-6 transition-colors"
          >
            <span>←</span>
            <span>목록으로 돌아가기</span>
          </Link>
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">책을 찾을 수 없어요</h2>
            <p className="text-gray-600">요청하신 책이 존재하지 않습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/books"
          className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium mb-6 transition-colors"
        >
          <span>←</span>
          <span>목록으로 돌아가기</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="md:flex">
            <div className="relative w-full md:w-80 h-96 md:h-auto bg-gradient-to-br from-amber-100 to-orange-100 flex-shrink-0">
              {book.cover_image ? (
                <Image
                  src={book.cover_image}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-8xl opacity-30">📚</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{book.author}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-lg font-semibold text-gray-700">
                    {book.rating} / 5
                  </span>
                </div>
                {book.genre && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                    {book.genre}
                  </span>
                )}
                {book.published_date && (
                  <span className="text-sm text-gray-500">
                    출판일: {new Date(book.published_date).toLocaleDateString("ko-KR")}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">리뷰</h2>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {book.review ?? (
                      <span className="text-gray-400 italic">리뷰가 없습니다.</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
