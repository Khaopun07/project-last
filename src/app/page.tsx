'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [currentBg, setCurrentBg] = useState<number>(0);

  const backgrounds = [
    'https://scidi.tsu.ac.th/private/science/%E0%B9%80%E0%B8%95%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%A1%E0%B8%9E%E0%B8%9A%E0%B8%81%E0%B8%B1%E0%B8%9A%20%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%AA%E0%B8%B1%E0%B8%9B%E0%B8%94%E0%B8%B2%E0%B8%AB%E0%B9%8C%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C%E0%B9%81%E0%B8%AB%E0%B9%88%E0%B8%87%E0%B8%8A%E0%B8%B2%E0%B8%95%E0%B8%B4%20%E0%B8%AA%E0%B9%88%E0%B8%A7%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%84%20%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%88%E0%B8%B3%E0%B8%9B%E0%B8%B5%202568/%E0%B8%9B%E0%B8%81%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B9%80%E0%B8%9E%E0%B8%88%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C.jpg',
    'https://scidi.tsu.ac.th/private/korakot.p/Banner%20SDGs.jpg',
    'https://scidi.tsu.ac.th/private/korakot.p/ETA.jpg'
  ];

  // Background slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % backgrounds.length);
    }, 3000); // เปลี่ยนทุก 5 วินาที
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background slideshow */}
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
            index === currentBg ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url('${bg}')` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-800/40 to-purple-900/50"></div>
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <div className="max-w-4xl w-full text-center">
          {/* Main Welcome Text */}
          <div className="mb-12">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-white mb-6 
                           drop-shadow-2xl leading-tight tracking-tight
                           bg-gradient-to-r from-white via-blue-100 to-cyan-100 
                           bg-clip-text text-transparent
                           animate-pulse">
              ยินดีต้อนรับสู่
            </h1>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white 
                           drop-shadow-xl leading-tight
                           bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 
                           bg-clip-text text-transparent">
              ระบบแนะแนว
            </h2>
          </div>
        </div>
      </div>
    </main>
  );
}
