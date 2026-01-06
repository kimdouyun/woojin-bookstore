"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Me = { username?: string; isAdmin?: boolean };

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json().catch(() => null);
        if (res.ok && data?.user) {
          setMe(data.user);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-amber-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl">📚</span>
            <span className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
              책 리뷰
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/")
                  ? "bg-amber-100 text-amber-700"
                  : "text-gray-600 hover:bg-amber-50 hover:text-amber-600"
              }`}
            >
              홈
            </Link>
            <Link
              href="/books"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive("/books")
                  ? "bg-amber-100 text-amber-700"
                  : "text-gray-600 hover:bg-amber-50 hover:text-amber-600"
              }`}
            >
              책 목록
            </Link>

            {!loading && (
              <>
                {me?.isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive("/admin")
                          ? "bg-amber-100 text-amber-700"
                          : "text-gray-600 hover:bg-amber-50 hover:text-amber-600"
                      }`}
                    >
                      관리자
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive("/register")
                          ? "bg-amber-100 text-amber-700"
                          : "text-gray-600 hover:bg-amber-50 hover:text-amber-600"
                      }`}
                    >
                      회원가입
                    </Link>
                    <Link
                      href="/login"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive("/login")
                          ? "bg-amber-100 text-amber-700"
                          : "bg-amber-500 text-white hover:bg-amber-600"
                      }`}
                    >
                      로그인
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

