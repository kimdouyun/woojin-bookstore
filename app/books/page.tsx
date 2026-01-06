"use client";

import Image from "next/image";
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩...</div>;

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <h1 className="text-3xl font-bold mb-6">책 목록</h1>
      <div className="space-y-4">
        {books.map((b) => (
          <div key={b.id} className="bg-white p-4 rounded-xl shadow flex gap-4">
            <div className="relative w-20 h-28 bg-gray-100 rounded overflow-hidden">
              {b.cover_image ? (
                <Image src={b.cover_image} alt={b.title} fill className="object-cover" sizes="80px" />
              ) : null}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg">{b.title}</div>
              <div className="text-gray-600">{b.author}</div>
              <div className="text-sm text-gray-500 mt-1">⭐ {b.rating} / 5</div>
              {b.review ? <p className="mt-2 text-sm">{b.review}</p> : null}
            </div>
          </div>
        ))}
        {books.length === 0 ? <div className="text-gray-500">등록된 책이 없습니다.</div> : null}
      </div>
    </div>
  );
}
