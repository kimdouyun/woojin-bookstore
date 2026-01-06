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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        {/* 책 아이콘 또는 이미지 */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="text-8xl md:text-9xl mb-4 animate-pulse">📚</div>
            <div className="absolute -top-2 -right-2 text-4xl md:text-5xl animate-bounce">✨</div>
          </div>
        </div>
        
        {/* 타이틀 */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 leading-tight">
            책으로 돌아보는
            <br />
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              인생 리뷰
            </span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-600 font-medium">
            읽어온 인생을 리뷰합니다
          </p>
        </div>

        {/* 입장 버튼 */}
        <div className="pt-8">
          <button
            onClick={handleEnter}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg md:text-xl font-semibold rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:from-amber-600 hover:to-orange-600 overflow-hidden"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span>{isHovered ? '📖' : '🚪'}</span>
              <span>입장하기</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* 장식 요소 */}
        <div className="flex justify-center space-x-6 md:space-x-8 mt-16 text-2xl md:text-3xl opacity-60">
          <span className="animate-bounce" style={{ animationDelay: '0s' }}>📖</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>✍️</span>
          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>💭</span>
          <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>⭐</span>
        </div>
      </div>
    </div>
  );
}

