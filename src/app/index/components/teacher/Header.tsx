'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { FiUser, FiLogOut, FiSettings, FiHome, FiCalendar, FiBook, FiClock } from 'react-icons/fi';

interface User {
  F_name?: string;
  L_name?: string;
  Username?: string;
}

interface HeaderTeacherProps {
  onLogout: () => void;
}

export default function HeaderTeacher({ onLogout }: HeaderTeacherProps) {
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
    setMenuOpen(false);
    Swal.fire({
      title: 'คุณต้องการออกจากระบบหรือไม่?',
      text: "คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อใช้งาน",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
        Swal.fire({
          title: 'ออกจากระบบสำเร็จ!',
          text: 'คุณได้ออกจากระบบเรียบร้อยแล้ว',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          router.push('/');
        });
      }
    });
  };

  const displayName =
    user?.F_name && user?.L_name
      ? `${user.F_name} ${user.L_name}`
      : user?.Username
      ? user.Username
      : 'อาจารย์';

  /** 🔥 ตัวอย่างฟังก์ชันส่ง booking พร้อม Username ของผู้ใช้ที่ login */
  const submitBooking = async (formData: any) => {
    if (!user?.Username) {
      alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
      return;
    }

    try {
      const res = await fetch('/api/auth/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': user.Username, // ส่ง username ของผู้ใช้
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'เกิดข้อผิดพลาด');

      alert('บันทึกการจองเรียบร้อยแล้ว!');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  };

  return (
    <header className="bg-blue shadow-xl border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              ระบบแนะแนว
            </h1>
            <span className="text-xs text-gray-500 font-medium">สำหรับอาจารย์</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/user_teacher/welcome"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 font-medium group"
          >
            <FiHome className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            หน้าหลัก
          </Link>
          <Link
            href="/user_teacher/book/book_page"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 font-medium group"
          >
            <FiCalendar className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            กิจกรรมแนะแนว
          </Link>
          <Link
            href="/user_teacher/offer_school"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 font-medium group"
          >
            <FiBook className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            เสนอโรงเรียน
          </Link>
          <Link
            href="/user_teacher/welcome/dashboard/dashboard_user"
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 font-medium group"
          >
            <FiClock className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            ประวัติ
          </Link>
          
        </nav>

        {/* User Profile Section */}
        <div className="flex items-center gap-4">
          {/* Welcome Message */}
          <div className="hidden lg:flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-xl border border-purple-100">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">สวัสดี</p>
              <p className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 text-sm">
                {displayName}
              </p>
            </div>
          </div>

          {/* User Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              aria-label="เมนูผู้ใช้"
            >
              <FiUser className="w-5 h-5 text-white" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-100 z-50 border border-gray-100 overflow-hidden">
                {/* User Info Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
                  <p className="text-sm text-gray-600">เข้าสู่ระบบด้วย</p>
                  <p className="font-semibold text-gray-800 truncate">{displayName}</p>
                </div>

                {/* Menu Items */}
                <div className="py-2">
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

          {/* Mobile Menu Button (if needed for responsive design) */}
          <button className="md:hidden p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}