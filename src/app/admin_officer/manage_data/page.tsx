'use client';
import { useEffect } from 'react';
import { useState } from 'react';

const menus = [
  { 
    label: 'จัดการข้อมูลตารางแนะแนว', 
    path: '/admin_officer/manage/guidance_ad?embedded=true&hideHeader=true&hideFooter=true&contentOnly=true',
    icon: '📅',
  },
  { 
    label: 'จัดการข้อมูลโรงเรียน', 
    path: '/admin_officer/manage/school_ad?embedded=true&hideHeader=true&hideFooter=true&contentOnly=true',
    icon: '🏫',
  },
  { 
    label: 'จัดการข้อมูลโรงเรียนที่รอการอนุมัติ', 
    path: '/admin_officer/manage/schoolP_ad?embedded=true&hideHeader=true&hideFooter=true&contentOnly=true',
    icon: '🏫',
  },
  { 
    label: 'จัดการข้อมูลลงชื่อเข้าร่วมแนะแนว', 
    path: '/admin_officer/manage/book_ad?embedded=true&hideHeader=true&hideFooter=true&contentOnly=true',
    icon: '📋',
  },
  { 
    label: 'จัดการข้อมูลอาจารย์', 
    path: '/admin_officer/manage/teacher_ad?embedded=true&hideHeader=true&hideFooter=true&contentOnly=true',
    icon: '👨‍🏫',
  },
  { 
    label: 'จัดการข้อมูลเจ้าหน้าที่', 
    path: '/admin_officer/manage/officer_ad?embedded=true&hideHeader=true&hideFooter=true&contentOnly=true',
    icon: '🧑‍💼',
    description: 'จัดการข้อมูลเจ้าหน้าที่ระบบ'
  },
];

export default function ManageDashboard() {
  const [selected, setSelected] = useState(menus[0].path);
  const selectedMenu = menus.find(menu => menu.path === selected);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Sidebar */}
      <nav className="w-80 bg-white/90 backdrop-blur-sm border-r border-blue-200 shadow-xl overflow-hidden" aria-label="Main menu">
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">จัดการข้อมูล</h2>
              <p className="text-blue-100 text-sm">ระบบบริหารจัดการ</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <p className="text-sm text-blue-100">
              เลือกเมนูด้านล่างเพื่อจัดการข้อมูลในระบบ
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-6 space-y-3 h-full overflow-y-auto">
          {menus.map((menu) => (
            <button
              key={menu.path}
              type="button"
              onClick={() => setSelected(menu.path)}
              className={`group w-full text-left p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg border ${
                selected === menu.path 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105 border-blue-300' 
                  : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-blue-700 border-blue-100 hover:border-blue-200'
              }`}
              aria-current={selected === menu.path ? 'page' : undefined}
            >
              <div className="flex items-start space-x-4">
                <div className={`text-3xl transition-transform duration-300 ${
                  selected === menu.path ? 'scale-110' : 'group-hover:scale-110'
                }`}>
                  {menu.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm leading-tight mb-1 ${
                    selected === menu.path ? 'text-white' : 'text-gray-800'
                  }`}>
                    {menu.label}
                  </h3>
                  <p className={`text-xs leading-relaxed ${
                    selected === menu.path ? 'text-blue-100' : 'text-gray-500 group-hover:text-blue-600'
                  }`}>
                    {menu.description}
                  </p>
                </div>
                <div className={`flex-shrink-0 transition-transform duration-300 ${
                  selected === menu.path ? 'rotate-90' : 'group-hover:translate-x-1'
                }`}>
                  <span className={`text-sm ${
                    selected === menu.path ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                  }`}>
                    →
                  </span>
                </div>
              </div>
              
              {/* Active indicator */}
              {selected === menu.path && (
                <div className="mt-2">
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </div>
              )}
            </button>
          ))}

          {/* Footer info */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">💡</span>
              <h4 className="font-semibold text-blue-800">เคล็ดลับ</h4>
            </div>
            <p className="text-xs text-blue-600 leading-relaxed">
              คลิกที่เมนูแต่ละรายการเพื่อจัดการข้อมูลในส่วนต่าง ๆ ของระบบ
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-white/50 backdrop-blur-sm">
        
        <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl">{selectedMenu?.icon}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {selectedMenu?.label || 'ไม่พบข้อมูล'}
                </h1>
                <p className="text-sm text-gray-600">{selectedMenu?.description}</p>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">พร้อมใช้งาน</span>
            </div>
          </div>
        </div>

        {/* Content Frame */}
        <div className="flex-1 p-6">
          {selected ? (
            <div className="h-full bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden backdrop-blur-sm">
              <iframe
                key={selected}  // รีเฟรช iframe เมื่อเปลี่ยน path
                src={selected}
                className="w-full h-full"
                title="Content Frame"
                style={{ 
                  border: 'none',
                  overflow: 'hidden'
                }}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-modals"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <span className="text-6xl">🔧</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">เริ่มต้นการจัดการ</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  กรุณาเลือกเมนูจากด้านซ้ายเพื่อเริ่มต้นจัดการข้อมูลในระบบ
                </p>
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}