'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

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

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    if (bookId) {
      fetchBookDetail();
      fetchComments();
    }
  }, [bookId]);

  const fetchBookDetail = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}`);
      const data = await response.json();
      setBook(data);
    } catch (error) {
      console.error('책 정보를 불러오는 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}/comments`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('댓글을 불러오는 중 오류:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentContent.trim()) {
      alert('이름과 댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`/api/books/${bookId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: commentAuthor,
          content: commentContent,
        }),
      });

      if (response.ok) {
        setCommentAuthor('');
        setCommentContent('');
        fetchComments();
      }
    } catch (error) {
      console.error('댓글 작성 중 오류:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-2xl text-gray-600 mb-4">책을 찾을 수 없습니다</p>
          <button
            onClick={() => router.push('/books')}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.push('/books')}
          className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          ← 목록으로 돌아가기
        </button>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* 책 정보 섹션 */}
          <div className="md:flex">
            <div className="md:w-1/3 p-6 bg-gradient-to-br from-amber-100 to-orange-100">
              <div className="relative aspect-[3/4] bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg overflow-hidden flex items-center justify-center">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-6xl">📖</div>
                )}
              </div>
              <div className="mt-4 text-center">
                <div className="inline-block bg-amber-500 text-white px-4 py-2 rounded-full text-lg font-semibold">
                  ⭐ {book.rating} / 5
                </div>
              </div>
            </div>

            <div className="md:w-2/3 p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-6">저자: {book.author}</p>
              
              {book.genre && (
                <div className="mb-4">
                  <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {book.genre}
                  </span>
                </div>
              )}

              <div className="border-t pt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 리뷰</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {book.review}
                </div>
              </div>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="border-t p-8 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">💬 공감 댓글 ({comments.length})</h2>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmitComment} className="mb-8 bg-white p-6 rounded-lg shadow">
              <div className="space-y-4">
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    id="author"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    댓글
                  </label>
                  <textarea
                    id="content"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="공감하는 마음을 전해주세요..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                >
                  댓글 작성하기
                </button>
              </div>
            </form>

            {/* 댓글 목록 */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">{comment.author}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

