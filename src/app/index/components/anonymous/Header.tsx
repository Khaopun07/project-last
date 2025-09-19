'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiUser, FiHome, FiInfo, FiMail, FiGlobe, FiLogIn, FiUserPlus } from 'react-icons/fi';

interface User {
  Username: string;
}

export default function HeaderAnonymous() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUserFromStorage = () => {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');

      if (token && userJson) {
        try {
          const parsedUser = JSON.parse(userJson);
          setUser(parsedUser);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    loadUserFromStorage();

    const handleAuthChanged = () => {
      loadUserFromStorage();
    };

    window.addEventListener('authChanged', handleAuthChanged);
    return () => {
      window.removeEventListener('authChanged', handleAuthChanged);
    };
  }, []);

  return (
    <header className="bg-white shadow-xl border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-600 rounded-xl shadow-lg">
            <FiGlobe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 via-slate-700 to-gray-700 bg-clip-text text-transparent">
              ระบบแนะแนว
            </h1>
            <span className="text-xs text-gray-500 font-medium">สำหรับทุกคน</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium group"
          >
            <FiHome className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            หน้าแรก
          </Link>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            /* Logged In User Display */
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-slate-600 rounded-full flex items-center justify-center shadow-md">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">สวัสดี</p>
                <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-slate-600 text-sm">
                  {user.Username}
                </p>
              </div>
            </div>
          ) : (
            /* Login/Register Buttons */
            <div className="flex items-center gap-3">
              <Link
                href="/Anonymous/login"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold transform hover:scale-105 group"
              >
                <FiLogIn className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/Anonymous/register"
                className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold transform hover:scale-105 group"
              >
                <FiUserPlus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                สมัครสมาชิก
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation (Hidden by default, can be toggled) */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-100">
        <nav className="flex flex-col space-y-2">
          
          {!user && (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link
                href="/Anonymous/login"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg font-semibold"
              >
                <FiLogIn className="w-4 h-4" />
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/Anonymous/register"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-600 to-gray-600 text-white px-4 py-3 rounded-xl shadow-lg font-semibold"
              >
                <FiUserPlus className="w-4 h-4" />
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}