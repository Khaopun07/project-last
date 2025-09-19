'use client';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
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
    </main>
  );
}
