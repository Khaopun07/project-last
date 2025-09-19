'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OfficerHomePage() {
  const [isOfficer, setIsOfficer] = useState<boolean | null>(null);
  const [currentBg, setCurrentBg] = useState<number>(0);
  const router = useRouter();

  const backgrounds = [
    'https://scidi.tsu.ac.th/private/science/%E0%B9%80%E0%B8%95%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%A1%E0%B8%9E%E0%B8%9A%E0%B8%81%E0%B8%B1%E0%B8%9A%20%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%AA%E0%B8%B1%E0%B8%9B%E0%B8%94%E0%B8%B2%E0%B8%AB%E0%B9%8C%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C%E0%B9%81%E0%B8%AB%E0%B9%88%E0%B8%87%E0%B8%8A%E0%B8%B2%E0%B8%95%E0%B8%B4%20%E0%B8%AA%E0%B9%88%E0%B8%A7%E0%B8%99%E0%B8%A0%E0%B8%B9%E0%B8%A1%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%84%20%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%88%E0%B8%B3%E0%B8%9B%E0%B8%B5%202568/%E0%B8%9B%E0%B8%81%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B9%80%E0%B8%9E%E0%B8%88%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C.jpg',
    'https://scidi.tsu.ac.th/private/korakot.p/Banner%20SDGs.jpg',
    'https://scidi.tsu.ac.th/private/korakot.p/ETA.jpg'
  ];

  // Background slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % backgrounds.length);
    }, 5000); // เปลี่ยนทุก 5 วินาที
    return () => clearInterval(timer);
  }, []);

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
      action: () => router.push('/index/admin_officer/manage_data')
    },
    {
      title: 'ตรวจสอบโรงเรียน',
      description: 'อนุมัติหรือปฏิเสธโรงเรียนที่เสนอเข้าระบบ',
      icon: 'school',
      color: 'from-green-500 to-blue-500',
      action: () => router.push('/index/admin_officer/welcome/dashboard')
    },
    {
      title: 'รายงาน',
      description: 'ดูสถิติและรายงานกิจกรรมทั้งหมด',
      icon: 'history',
      color: 'from-orange-500 to-red-500',
      action: () => router.push('/index/admin_officer/guidance-report')
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background slideshow */}
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url('${bg}')` }}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Quick Actions */}
      <main className="relative z-10 min-h-screen flex flex-col justify-end max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-extrabold text-white mb-8 text-center">
          เจ้าหน้าที่ระบบแนะแนว
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={action.action}
              className="cursor-pointer rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition duration-300 bg-white"
            >
              <div className="p-6 flex flex-col items-start">
                <div className={`w-14 h-14 flex items-center justify-center rounded-xl mb-4 bg-gradient-to-r ${action.color}`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getIcon(action.icon)} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
