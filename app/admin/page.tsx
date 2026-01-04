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
  review: string;
  publishedDate?: string;
  genre?: string;
}

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    coverImage: '',
    rating: 5,
    review: '',
    publishedDate: '',
    genre: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user.isAdmin) {
          setUser(data.user);
          fetchBooks();
        } else {
          alert('관리자 권한이 필요합니다.');
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('인증 확인 오류:', error);
      router.push('/login');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/admin');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error);
    }
  };

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const response = await fetch('/api/auth/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isAdmin: !currentIsAdmin,
        }),
      });

      if (response.ok) {
        fetchUsers();
        if (userId === user?.id) {
          // 현재 사용자의 권한이 변경되면 다시 인증 확인
          checkAuth();
        }
      } else {
        alert('관리자 권한 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('관리자 권한 변경 오류:', error);
      alert('관리자 권한 변경 중 오류가 발생했습니다.');
    }
  };

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

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      rating: book.rating,
      review: book.review,
      publishedDate: book.publishedDate || '',
      genre: book.genre || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm('정말 이 책을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBooks();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 중 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingBook
        ? `/api/books/${editingBook.id}`
        : '/api/books';
      const method = editingBook ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingBook(null);
        setFormData({
          title: '',
          author: '',
          coverImage: '',
          rating: 5,
          review: '',
          publishedDate: '',
          genre: '',
        });
        fetchBooks();
      } else {
        alert(editingBook ? '수정에 실패했습니다.' : '추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      coverImage: '',
      rating: 5,
      review: '',
      publishedDate: '',
      genre: '',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🔧 관리자 페이지</h1>
            <p className="text-gray-600">
              책 리뷰를 추가, 수정, 삭제할 수 있습니다
              {user && <span className="ml-2 text-amber-600">({user.username}님)</span>}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/books')}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              목록으로
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              로그아웃
            </button>
            {!showForm && (
              <>
                <button
                  onClick={() => {
                    setShowUserManagement(!showUserManagement);
                    if (!showUserManagement) {
                      fetchUsers();
                    }
                  }}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  {showUserManagement ? '사용자 관리 닫기' : '👥 사용자 관리'}
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  + 새 책 추가
                </button>
              </>
            )}
          </div>
        </div>

        {/* 작성/수정 폼 */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingBook ? '📝 책 수정' : '➕ 새 책 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    저자 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    표지 이미지 URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
                    <p className="font-semibold mb-1">💡 이미지 URL 얻는 방법:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>온라인 서점:</strong> 알라딘, 교보문고, 예스24 등에서 책 표지 이미지 우클릭 → "이미지 주소 복사"</li>
                      <li><strong>Google Books:</strong> <a href="https://books.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">books.google.com</a>에서 책 검색 후 표지 이미지 URL 복사</li>
                      <li><strong>Unsplash:</strong> <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">unsplash.com</a>에서 책 관련 이미지 검색</li>
                      <li><strong>예시:</strong> <code className="bg-gray-100 px-1 rounded">https://image.aladin.co.kr/product/12345/coversum/1234567890.jpg</code></li>
                    </ul>
                    <p className="mt-2 text-xs text-gray-600">⚠️ 이미지 URL은 <code className="bg-gray-100 px-1 rounded">https://</code> 또는 <code className="bg-gray-100 px-1 rounded">http://</code>로 시작해야 합니다.</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    평점 (1-5) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    장르
                  </label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="소설, 에세이, 자기계발 등"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    출판일
                  </label>
                  <input
                    type="date"
                    value={formData.publishedDate}
                    onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  리뷰 내용 *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="이 책에 대한 리뷰를 작성해주세요..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                >
                  {editingBook ? '수정하기' : '추가하기'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 사용자 관리 섹션 */}
        {showUserManagement && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 사용자 관리</h2>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
              <p className="font-semibold mb-1">💡 관리자 권한 설정:</p>
              <p className="text-xs">다른 사용자에게 관리자 권한을 부여하거나 해제할 수 있습니다. 관리자만 책을 추가/수정/삭제할 수 있습니다.</p>
            </div>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 사용자가 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {u.username}
                        {u.isAdmin && (
                          <span className="ml-2 px-2 py-1 bg-amber-500 text-white text-xs rounded">
                            관리자
                          </span>
                        )}
                      </div>
                      {u.email && (
                        <div className="text-sm text-gray-600">{u.email}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        가입일: {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        u.isAdmin
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {u.isAdmin ? '관리자 해제' : '관리자 지정'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 책 목록 */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 등록된 책 목록</h2>
          {books.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              등록된 책이 없습니다. 첫 번째 책을 추가해보세요!
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="relative w-20 h-28 flex-shrink-0 bg-gradient-to-br from-amber-200 to-orange-200 rounded overflow-hidden flex items-center justify-center">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-2xl">📖</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{book.title}</h3>
                    <p className="text-gray-600">{book.author}</p>
                    <p className="text-sm text-gray-500 mt-1">⭐ {book.rating} / 5</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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

