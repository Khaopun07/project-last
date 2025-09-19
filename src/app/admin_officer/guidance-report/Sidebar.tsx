'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// รายการเมนูหลัก
const mainMenuItems = [
  { name: 'แดชบอร์ด', href: '/index/admin_officer/dashboard' },
  { name: 'รายงานกิจกรรม', href: '/index/admin_officer/guidance-report' },
];

// รายการเมนูสำหรับจัดการข้อมูล (รวมเมนูใหม่ที่ต้องการ)
const manageMenuItems = [
  { name: 'ข้อมูลกิจกรรม', href: '/index/admin_officer/manage/guidance_ad' },
  { name: 'ข้อมูลการจอง', href: '/index/admin_officer/manage/book_ad' },
  { name: 'ข้อมูลโรงเรียน', href: '/index/admin_officer/manage/school_ad' },
  { name: 'ข้อมูลอาจารย์', href: '/index/admin_officer/teacher' },
  { name: 'โรงเรียนรออนุมัติ', href: '/index/admin_officer/manage/schoolP_ad' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isManageMenuOpen, setManageMenuOpen] = useState(true);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside className="w-64 bg-gray-800 text-white h-screen p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white text-center">Admin Panel</h2>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {mainMenuItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}>
                {item.name}
              </Link>
            </li>
          ))}
          
          {/* เมนูจัดการข้อมูลแบบพับได้ */}
          <li>
            <button 
              onClick={() => setManageMenuOpen(!isManageMenuOpen)}
              className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-700 transition-colors text-left text-gray-300 hover:text-white"
            >
              <span className="font-semibold">จัดการข้อมูล</span>
              <span className={`transform transition-transform duration-200 ${isManageMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                ▼
              </span>
            </button>
            {isManageMenuOpen && (
              <ul className="pl-4 mt-2 space-y-1 border-l-2 border-gray-700">
                {manageMenuItems.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className={`block p-2 rounded-md text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-500 text-white font-medium'
                          : 'text-gray-400 hover:bg-gray-600 hover:text-white'
                      }`}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}