'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLogOut, FiSettings, FiHome, FiActivity, FiShield } from 'react-icons/fi';

interface User {
  Username?: string;
  Off_Fname?: string;
  Off_Lname?: string;
}

interface HeaderOfficerProps {
  onLogout: () => void;
}

export default function HeaderOfficer({ onLogout }: HeaderOfficerProps) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('authChanged', handleAuthChanged);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    onLogout(); // Use the function passed from the parent
    setMenuOpen(false);
    router.push('/');
  };

  const displayName =
    user?.Off_Fname && user?.Off_Lname
      ? `${user.Off_Fname} ${user.Off_Lname}`
      : user?.Username
      ? user.Username
      : 'เจ้าหน้าที่';

  return (
    <header className="bg-white shadow-xl border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <FiShield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-700 bg-clip-text text-transparent">
              ระบบจัดการแนะแนว
            </h1>
            <span className="text-xs text-gray-500 font-medium">สำหรับเจ้าหน้าที่</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/admin_officer/welcome"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium group"
          >
            <FiHome className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            หน้าหลัก
          </Link>
          <Link
            href="/admin_officer/welcome/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium group"
          >
            <FiHome className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            แดชบอร์ด
          </Link>
          <Link
            href="/admin_officer/manage_data"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium group"
          >
            <FiActivity className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            จัดการกิจกรรม
          </Link>
          <Link
            href="/admin_officer/guidance-report"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium group"
          >
            <FiShield className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            ออกรายงาน
          </Link>
        </nav>

        {/* User Profile Section */}
        <div className="flex items-center gap-4">
          {/* Welcome Message */}
          <div className="hidden lg:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-100">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <FiShield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">สวัสดี</p>
              <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-sm">
                {displayName}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {/* <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-full border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-blue-800">ออนไลน์</span>
          </div> */}

          {/* User Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              aria-label="เมนูผู้ใช้"
            >
              <FiUser className="w-5 h-5 text-white" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-100 z-50 border border-gray-100 overflow-hidden">
                {/* User Info Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FiShield className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700">เจ้าหน้าที่ระบบ</p>
                  </div>
                  <p className="font-semibold text-gray-800 truncate">{displayName}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {/* <Link
                    href="/index/officer/settings"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 group"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-all duration-300">
                      <FiSettings className="w-4 h-4" />
                    </div>
                    <span className="font-medium">ตั้งค่าบัญชี</span>
                  </Link>
                  
                  <div className="border-t border-gray-100 my-1"></div> */}
                  
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 group-hover:bg-red-100 rounded-lg transition-all duration-300">
                      <FiLogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium">ออกจากระบบ</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}