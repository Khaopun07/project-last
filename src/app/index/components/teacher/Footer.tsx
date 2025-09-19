'use client';

import { FiBook, FiHeart, FiMail, FiPhone, FiMapPin, FiCalendar, FiUser, FiClock } from 'react-icons/fi';

export default function FooterTeacher() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                <FiBook className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  ระบบแนะแนว
                </h3>
                <p className="text-xs text-gray-500">สำหรับอาจารย์</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              เครื่องมือสำหรับครูและอาจารย์ในการจองกิจกรรมแนะแนว
              เสนอข้อมูลโรงเรียน และติดตามผลการจอง
            </p>
          </div>

          {/* Teacher Functions */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-center md:justify-start gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
              ฟีเจอร์สำหรับครู
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/user_teacher/book/book_page" className="flex items-center justify-center md:justify-start gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-300 text-sm">
                  <FiCalendar className="w-4 h-4" />
                  จองกิจกรรมแนะแนว
                </a>
              </li>
              <li>
                <a href="/user_teacher/offer_school" className="flex items-center justify-center md:justify-start gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-300 text-sm">
                  <FiBook className="w-4 h-4" />
                  เสนอข้อมูลโรงเรียน
                </a>
              </li>
              <li>
                <a href="/user_teacher/welcome/dashboard/dashboard_user" className="flex items-center justify-center md:justify-start gap-2 text-gray-600 hover:text-purple-600 transition-colors duration-300 text-sm">
                  <FiClock className="w-4 h-4" />
                  ประวัติการจอง
                </a>
              </li>
              <li>
                
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-center md:justify-start gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
              ติดต่อสอบถาม
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FiMail className="w-4 h-4 text-purple-600" />
                </div>
                <span>info@tsu.ac.th</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FiPhone className="w-4 h-4 text-purple-600" />
                </div>
                <span>02-123-1234</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FiMapPin className="w-4 h-4 text-purple-600" />
                </div>
                <span>
                     คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>© {currentYear} ระบบแนะแนว</span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
                เพื่อการศึกษาที่ดีกว่า <FiHeart className="w-4 h-4 text-red-500 animate-pulse" />
              </span>
            </div>

            {/* Teacher Status */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-full border border-purple-100">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <FiBook className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">อาจารย์</span>
            </div>
          </div>

          {/* Educational Quote */}
          <div className="mt-4 text-center">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl px-6 py-4 mb-2">
              <p className="text-sm text-gray-700 italic">
                "การแนะแนวที่ดี คือการเปิดประตูสู่อนาคตที่สดใสของนักเรียน"
              </p>
            </div>
            <p className="text-xs text-gray-500">
              แพลตฟอร์มสำหรับอาจารย์ในการเข้าร่วมกิจกรรมแนะแนว
              เพื่อพัฒนาเส้นทางการศึกษาของนักเรียน
            </p>
          </div>
        </div>
      </div>

      {/* Educational Badge */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-white text-xs">
            <FiBook className="w-4 h-4" />
            <span>เพื่อการศึกษาและการแนะแนวที่มีคุณภาพ</span>
            <span className="text-purple-200">•</span>
            <span>ร่วมสร้างอนาคตที่ดีให้นักเรียน</span>
          </div>
        </div>
      </div>
    </footer>
  );
}