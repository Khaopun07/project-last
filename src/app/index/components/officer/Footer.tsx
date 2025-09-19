'use client';

import { FiShield, FiHeart, FiMail, FiPhone, FiMapPin, FiActivity, FiSettings } from 'react-icons/fi';

export default function FooterOfficer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-700 bg-clip-text text-transparent">
                  ระบบจัดการแนะแนว
                </h3>
                <p className="text-xs text-gray-500">สำหรับเจ้าหน้าที่</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              เครื่องมือสำหรับเจ้าหน้าที่ในการจัดการระบบแนะแนว 
              ควบคุมกิจกรรม สร้างรายงาน และดูแลระบบอย่างมีประสิทธิภาพ
            </p>
          </div>

          {/* Admin Functions */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-center md:justify-start gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
              ฟังก์ชันหลัก
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/officer/dashboard" className="flex items-center justify-center md:justify-start gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
                  <FiSettings className="w-4 h-4" />
                  แดชบอร์ด
                </a>
              </li>
              <li>
                <a href="/officer/guidance" className="flex items-center justify-center md:justify-start gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
                  <FiActivity className="w-4 h-4" />
                  จัดการกิจกรรม
                </a>
              </li>
              <li>
                <a href="/officer/reports" className="flex items-center justify-center md:justify-start gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 text-sm">
                  <FiSettings className="w-4 h-4" />
                  ออกรายงาน
                </a>
              </li>
              <li>
                
              </li>
            </ul>
          </div>

          {/* Support Info */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center justify-center md:justify-start gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
              ความช่วยเหลือ
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
                <span>มหาวิทยาลัยทักษิณ วิทยาเขตพัทลุง คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล</span>
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
              <span>© {currentYear} ระบบจัดการแนะแนว</span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
                พัฒนาโดยนาย ณัฐวุฒิ วุ่นคง รหัสนิสิต 652021049 <FiHeart className="w-4 h-4 text-red-500 animate-pulse" />
              </span>
            </div>

            {/* Admin Status */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <FiShield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">เจ้าหน้าที่ระบบ</span>
            </div>
          </div>

          {/* System Info */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ระบบปกติ
              </span>
              <span className="text-gray-400">•</span>
              <span>เวอร์ชัน 1.0.3</span>
              <span className="text-gray-400">•</span>
              <span>อัปเดตล่าสุด: วันนี้</span>
            </div>
            <p className="text-xs text-gray-500">
              แพนลควบคุมสำหรับการจัดการระบบแนะแนวการศึกษา
              มีความปลอดภัยสูงและใช้งานง่าย
            </p>
          </div>
        </div>
      </div>

      {/* Security Indicator */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 text-white text-xs">
            <FiShield className="w-4 h-4" />
            <span>การเชื่อมต่อปลอดภัย SSL</span>
            <span className="text-blue-200">•</span>
            <span>เข้าสู่ระบบด้วยสิทธิ์เจ้าหน้าที่</span>
          </div>
        </div>
      </div>
    </footer>
  );
}