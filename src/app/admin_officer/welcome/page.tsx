'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OfficerHomePage() {
  const [isOfficer, setIsOfficer] = useState<boolean | null>(null);
  const router = useRouter();

  // Check role
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole === 'officer') {
      setIsOfficer(true);
    } else {
      setIsOfficer(false);
      router.push('/index/login'); // ถ้าไม่ใช่เจ้าหน้าที่ → redirect
    }
  }, [router]);

  const quickActions = [
    {
      title: 'จัดการกิจกรรมแนะแนว',
      description: 'สร้าง แก้ไข และลบกิจกรรมแนะแนว',
      icon: 'calendar',
      color: 'from-blue-500 to-purple-500',
      action: () => router.push('/admin_officer/manage_data')
    },
    {
      title: 'ตรวจสอบโรงเรียน',
      description: 'อนุมัติหรือปฏิเสธโรงเรียนที่เสนอเข้าระบบ',
      icon: 'school',
      color: 'from-green-500 to-blue-500',
      action: () => router.push('/admin_officer/manage/schoolP_ad')
    },
    {
      title: 'รายงาน',
      description: 'ดูสถิติและรายงานกิจกรรมทั้งหมด',
      icon: 'history',
      color: 'from-orange-500 to-red-500',
      action: () => router.push('/admin_officer/welcome/dashboard')
    }
  ];

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: string } = {
      calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      school: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
      history: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    };
    return icons[iconName];
  };

  if (isOfficer === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-500 mb-4 mx-auto"></div>
          <p className="text-xl text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!isOfficer) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      {/* Quick Actions */}
      <main className="min-h-screen flex flex-col items-center justify-center max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-gradient-to-r from-blue-700 via-slate-700 to-gray-700 bg-clip-text mb-12 text-center">
          เจ้าหน้าที่ระบบแนะแนว
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              className="cursor-pointer group rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-all duration-300 bg-white border border-gray-100"
            >
              <div className="p-6 flex flex-col items-start">
                <div className={`w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-gradient-to-r ${action.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getIcon(action.icon)} />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
