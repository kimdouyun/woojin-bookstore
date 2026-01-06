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

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩...</div>;

  if (!book) {
    return (
      <div className="min-h-screen bg-amber-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/books" className="text-blue-600 underline">← 목록으로</Link>
          <div className="mt-6 bg-white p-6 rounded-xl shadow">
            <div className="text-xl font-bold">책을 찾을 수 없어요.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/books" className="text-blue-600 underline">← 목록으로</Link>

        <div className="mt-4 bg-white p-6 rounded-xl shadow">
          <div className="flex gap-6">
            <div className="relative w-40 h-56 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {book.cover_image ? (
                <Image src={book.cover_image} alt={book.title} fill className="object-cover" sizes="160px" />
              ) : null}
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold">{book.title}</h1>
              <div className="text-gray-600 mt-1">{book.author}</div>
              <div className="text-gray-500 mt-2">⭐ {book.rating} / 5</div>
              {book.genre ? <div className="mt-2 text-sm">장르: {book.genre}</div> : null}
              {book.published_date ? <div className="text-sm">출판일: {book.published_date}</div> : null}
            </div>
          </div>

          <hr className="my-6" />

          <div>
            <div className="text-lg font-bold mb-2">리뷰</div>
            <p className="whitespace-pre-wrap text-gray-800">{book.review ?? "리뷰가 없습니다."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
