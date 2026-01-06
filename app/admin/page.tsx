"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { username?: string; isAdmin?: boolean };

type AdminUser = {
  id: string;
  username: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
};

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
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json().catch(() => null);
      if (!meRes.ok || !meData?.user?.isAdmin) {
        router.push("/login");
        return;
      }
      setMe(meData.user);

      const res = await fetch("/api/books");
      const data = await res.json().catch(() => null);
      setBooks(Array.isArray(data?.books) ? data.books : []);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/auth/admin");
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "사용자 목록 조회 실패");
        setUsers([]);
        return;
      }

      setUsers(Array.isArray(data?.users) ? data.users : []);
    } finally {
      setUsersLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    if (!confirm(`정말로 관리자 권한을 ${currentIsAdmin ? "해제" : "부여"}하시겠습니까?`)) return;

    try {
      const res = await fetch("/api/auth/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isAdmin: !currentIsAdmin }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "관리자 권한 변경 실패");
        return;
      }

      await fetchUsers();
    } catch {
      setError("관리자 권한 변경 중 오류");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm({ title: "", author: "", cover_image: "", rating: 5, review: "", published_date: "", genre: "" });
    setShowForm(true);
    setError("");
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
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
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
        setError(data?.error ?? "저장 실패");
        return;
      }

      setShowForm(false);
      setEditing(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("정말로 이 책을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "삭제 실패");
        return;
      }
      await load();
    } catch {
      setError("삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-spin">📚</div>
          <p className="text-gray-600 text-lg">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!me) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">관리자 페이지</h1>
              <p className="text-gray-600">
                안녕하세요, <span className="font-semibold text-amber-600">{me.username}</span>님
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push("/books")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                📚 목록 보기
              </button>
              <button
                onClick={startCreate}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-lg hover:shadow-xl"
              >
                ➕ 새 책 추가
              </button>
              <button
                onClick={async () => {
                  const next = !showUserManagement;
                  setShowUserManagement(next);
                  if (next) await fetchUsers();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showUserManagement
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {showUserManagement ? "👥 사용자 관리 닫기" : "👥 사용자 관리"}
              </button>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 책 추가/수정 폼 */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editing ? "📝 책 수정" : "➕ 새 책 추가"}
            </h2>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="책 제목"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">저자 *</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="저자명"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">표지 이미지 URL</label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="https://..."
                  value={form.cover_image}
                  onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">평점</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">출판일</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    type="date"
                    value={form.published_date}
                    onChange={(e) => setForm({ ...form, published_date: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">장르</label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                    placeholder="장르"
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">리뷰</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  rows={6}
                  placeholder="책에 대한 리뷰를 작성하세요"
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "저장 중..." : editing ? "수정하기" : "추가하기"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                    setError("");
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={submitting}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 사용자 관리 */}
        {showUserManagement && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 사용자 관리</h2>

            {usersLoading ? (
              <div className="text-center py-8">
                <div className="text-4xl animate-spin mb-4">⏳</div>
                <p className="text-gray-600">로딩 중...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">등록된 사용자가 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{u.username}</span>
                        {u.is_admin && (
                          <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                            관리자
                          </span>
                        )}
                      </div>
                      {u.email && <div className="text-sm text-gray-600 mb-1">{u.email}</div>}
                      <div className="text-xs text-gray-500">
                        가입일: {new Date(u.created_at).toLocaleDateString("ko-KR")}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleAdmin(u.id, u.is_admin)}
                      className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors whitespace-nowrap ${
                        u.is_admin
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {u.is_admin ? "관리자 해제" : "관리자 지정"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 책 목록 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">📚 등록된 책 ({books.length}권)</h2>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">📖</div>
              <p>등록된 책이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((b) => (
                <div
                  key={b.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex gap-4 mb-3">
                    <div className="relative w-16 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded overflow-hidden flex-shrink-0">
                      {b.cover_image ? (
                        <Image
                          src={b.cover_image}
                          alt={b.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-2xl opacity-30">📚</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{b.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{b.author}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-amber-500">⭐</span>
                        <span className="text-sm text-gray-700">{b.rating} / 5</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(b)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => del(b.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
