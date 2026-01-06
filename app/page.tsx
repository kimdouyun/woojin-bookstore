'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleEnter = () => {
    router.push('/books');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* 책 아이콘 또는 이미지 */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="text-8xl mb-4">📚</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-bounce">✨</div>
          </div>
        </div>
        
        {/* 타이틀 */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-800">
            책으로 돌아보는 인생 리뷰
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
            읽어온 인생을 리뷰합니다
          </p>
        </div>

        {/* 입장 버튼 */}
        <button
          onClick={handleEnter}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="mt-12 px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-amber-600 hover:to-orange-600"
        >
          {isHovered ? '📖 입장하기' : '🚪 입장하기'}
        </button>

        {/* 장식 요소 */}
        <div className="flex justify-center space-x-4 mt-16 text-2xl opacity-50">
          <span>📖</span>
          <span>✍️</span>
          <span>💭</span>
          <span>⭐</span>
        </div>
      </div>
    </div>
  );
}

