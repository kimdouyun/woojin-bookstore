"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { username?: string; isAdmin?: boolean };

type BookRow = {
  id: string;
  title: string;
  author: string;
  cover_image: string | null;
  rating: number;
  review: string | null;
  published_date: string | null;
  genre: string | null;
};

export default function AdminPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<BookRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BookRow | null>(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    cover_image: "",
    rating: 5,
    review: "",
    published_date: "",
    genre: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      // auth
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json().catch(() => null);
      if (!meRes.ok || !meData?.user?.isAdmin) {
        router.push("/login");
        return;
      }
      setMe(meData.user);

      // books
      const res = await fetch("/api/books");
      const data = await res.json().catch(() => null);
      setBooks(Array.isArray(data?.books) ? data.books : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const startCreate = () => {
    setEditing(null);
    setForm({ title: "", author: "", cover_image: "", rating: 5, review: "", published_date: "", genre: "" });
    setShowForm(true);
  };

  const startEdit = (b: BookRow) => {
    setEditing(b);
    setForm({
      title: b.title ?? "",
      author: b.author ?? "",
      cover_image: b.cover_image ?? "",
      rating: b.rating ?? 5,
      review: b.review ?? "",
      published_date: b.published_date ?? "",
      genre: b.genre ?? "",
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: form.title,
      author: form.author,
      cover_image: form.cover_image || null,
      rating: Number(form.rating),
      review: form.review || null,
      published_date: form.published_date || null,
      genre: form.genre || null,
    };

    const url = editing ? `/api/books/${editing.id}` : "/api/books";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error ?? "저장 실패");
      return;
    }

    setShowForm(false);
    setEditing(null);
    await load();
  };

  const del = async (id: string) => {
    if (!confirm("삭제할까?")) return;
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      alert(data?.error ?? "삭제 실패");
      return;
    }
    await load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">로딩...</div>;
  if (!me) return null;

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">관리자 페이지</h1>
            <p className="text-gray-600">{me.username} (admin)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push("/books")} className="px-4 py-2 rounded bg-gray-600 text-white">목록</button>
            <button onClick={logout} className="px-4 py-2 rounded bg-red-600 text-white">로그아웃</button>
            <button onClick={startCreate} className="px-4 py-2 rounded bg-amber-600 text-white">+ 새 책</button>
          </div>
        </div>

        {showForm ? (
          <form onSubmit={submit} className="bg-white p-5 rounded-xl shadow mb-6 space-y-3">
            <div className="font-bold">{editing ? "책 수정" : "책 추가"}</div>

            <input className="w-full border p-2 rounded" placeholder="제목" value={form.title}
              onChange={(e)=>setForm({ ...form, title: e.target.value })} required />
            <input className="w-full border p-2 rounded" placeholder="저자" value={form.author}
              onChange={(e)=>setForm({ ...form, author: e.target.value })} required />

            <input className="w-full border p-2 rounded" placeholder="표지 이미지 URL(https://...)" value={form.cover_image}
              onChange={(e)=>setForm({ ...form, cover_image: e.target.value })} />

            <input className="w-full border p-2 rounded" type="number" min={1} max={5} value={form.rating}
              onChange={(e)=>setForm({ ...form, rating: Number(e.target.value) })} />

            <input className="w-full border p-2 rounded" type="date" value={form.published_date}
              onChange={(e)=>setForm({ ...form, published_date: e.target.value })} />

            <input className="w-full border p-2 rounded" placeholder="장르" value={form.genre}
              onChange={(e)=>setForm({ ...form, genre: e.target.value })} />

            <textarea className="w-full border p-2 rounded" rows={6} placeholder="리뷰" value={form.review}
              onChange={(e)=>setForm({ ...form, review: e.target.value })} />

            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-amber-600 text-white" type="submit">
                {editing ? "수정" : "추가"}
              </button>
              <button className="px-4 py-2 rounded bg-gray-200" type="button" onClick={()=>setShowForm(false)}>
                취소
              </button>
            </div>
          </form>
        ) : null}

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="font-bold mb-3">등록된 책</div>
          <div className="space-y-3">
            {books.map((b) => (
              <div key={b.id} className="border rounded-lg p-3 flex gap-3 items-center">
                <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden">
                  {b.cover_image ? <Image src={b.cover_image} alt={b.title} fill className="object-cover" sizes="64px" /> : null}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{b.title}</div>
                  <div className="text-gray-600 text-sm">{b.author}</div>
                  <div className="text-gray-500 text-sm">⭐ {b.rating} / 5</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={()=>startEdit(b)}>수정</button>
                  <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={()=>del(b.id)}>삭제</button>
                </div>
              </div>
            ))}
            {books.length === 0 ? <div className="text-gray-500">등록된 책이 없습니다.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
