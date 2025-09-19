'use client';

import { FiGlobe, FiHeart, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function FooterAnonymous() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-600 rounded-xl shadow-lg">
                <FiGlobe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-700 via-slate-700 to-gray-700 bg-clip-text text-transparent">
                  ระบบแนะแนว
                </h3>
                <p className="text-xs text-gray-500">สำหรับทุกคน</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              แพลตฟอร์มแนะแนวการศึกษาที่ช่วยให้นักเรียน อาจารย์ และเจ้าหน้าที่
              สามารถเข้าถึงข้อมูลและบริการได้อย่างสะดวก
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-center md:justify-start gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-slate-600 rounded-full"></div>
              ลิงก์ด่วน
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
                  หน้าแรก
                </a>
              </li>
              
              <li>
                <a href="/Anonymous/login" className="text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
                  เข้าสู่ระบบ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-center md:justify-start gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-slate-600 rounded-full"></div>
              ติดต่อเรา
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiMail className="w-4 h-4 text-blue-600" />
                </div>
                <span>info@tsu.ac.th</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiPhone className="w-4 h-4 text-blue-600" />
                </div>
                <span>02-123-1234</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FiMapPin className="w-4 h-4 text-blue-600" />
                </div>
                <span>พัทลุง</span>
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
                สร้างด้วย <FiHeart className="w-4 h-4 text-red-500 animate-pulse" />
              </span>
            </div>

            {/* User Status */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-2 rounded-full border border-blue-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">ผู้เยี่ยมชมทั่วไป</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              ระบบนี้ออกแบบมาเพื่อให้บริการแนะแนวการศึกษาอย่างครอบคลุม
              สำหรับนักเรียน ครู และผู้ปกครอง
            </p>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-blue-100 to-slate-100"></div>
      </div>
    </footer>
  );
}