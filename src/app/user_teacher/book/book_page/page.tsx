'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Guidance = {
  GuidanceID: number;
  guidance_date: string;
  school_id: number;
  counselor_id: string;
  student_count: number;
  study_plan: string;
  faculty_in_charge: string;
  professor_in_charge: string;
  Category: string;
  status: string;
  Start_Time: string;
  Start_Stop: string;
  car_registration: string;
  number_seats: number;
  car_type: string;
  car_phone: string;
  Sc_name: string;
  Sc_address: string;
  Sc_district: string;
  Sc_subdistrict: string;
  Sc_province: string;
  Sc_postal: string;
  Sc_phone: string;
  Sc_email: string;
  Contact_name: string;
  Contact_no: string;
  formatted_date: string;
  formatted_start_time: string;
  formatted_end_time: string;
  full_address: string;
  is_available: boolean;
  days_until_event: number;
};

type ApiResponse = {
  guidances: Guidance[];
  total: number;
  available_count: number;
  categories: {
    'ในนามคณะ': number;
    'ในนามยังสมาร์ท': number;
    'ในนามมหาวิทยาลัย': number;
  };
};

const categories = ['ในนามคณะ', 'ในนามยังสมาร์ท', 'ในนามมหาวิทยาลัย'];

export default function BookPage() {
  const [guidances, setGuidances] = useState<Guidance[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStats, setApiStats] = useState<ApiResponse['categories'] | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchGuidances();
  }, []);

  const fetchGuidances = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/guidance_ad');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: ApiResponse = await res.json();

      if (data.guidances && Array.isArray(data.guidances)) {
        setGuidances(data.guidances);
        setApiStats(data.categories);
      } else {
        setGuidances([]);
        setApiStats(data.categories || {
          'ในนามคณะ': 0,
          'ในนามยังสมาร์ท': 0,
          'ในนามมหาวิทยาลัย': 0,
        });
      }
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
      setGuidances([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter guidances directly before rendering. This is more efficient than using a separate state.
  const filteredGuidances = guidances.filter(g => g.Category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4">
            กิจกรรมแนะแนว
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ค้นหาและจองกิจกรรมแนะแนวที่เหมาะสมกับคุณ
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-lg font-semibold text-gray-800">เลือกหมวดหมู่:</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full sm:max-w-xs px-4 py-3 border-2 border-purple-200 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat} {apiStats && `(${apiStats[cat as keyof typeof apiStats]} กิจกรรม)`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
            <p className="text-xl text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-8">
            <p className="text-red-800 font-semibold">{error}</p>
            <button onClick={fetchGuidances} className="mt-2 text-red-600 hover:text-red-800 underline text-sm">
              ลองใหม่อีกครั้ง
            </button>
          </div>
        )}

        {/* Activities Grid */}
        {!loading && !error && filteredGuidances.length > 0 && (
          <div className="grid gap-6 lg:gap-8">
            {filteredGuidances.map((g, idx) => (
              <div key={g.GuidanceID} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                  <div className="flex-1 space-y-4">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800">{g.Sc_name}</h2>
                    <p className="text-sm text-gray-600">ผู้ประสานงาน: {g.Contact_name} {g.Contact_no && `(${g.Contact_no})`}</p>
                    <p className="text-sm text-gray-600">แผนการเรียน: {g.study_plan || 'ไม่ระบุ'}</p>
                    <p className="text-sm text-gray-600">คณะผู้รับผิดชอบ: {g.faculty_in_charge || 'ไม่ระบุ'}</p>
                    <p className="text-sm text-gray-600">อาจารย์ผู้รับผิดชอบ: {g.professor_in_charge || 'ไม่ระบุ'}</p>
                    <p className="text-sm text-gray-600">วันที่: {g.formatted_date || new Date(g.guidance_date).toLocaleDateString('th-TH')}</p>
                    <p className="text-sm text-gray-600">เวลา: {g.formatted_start_time || g.Start_Time} - {g.formatted_end_time || g.Start_Stop}</p>
                    <p className="text-sm text-gray-600">จำนวนนักเรียน: {g.student_count} คน</p>
                    <p className="text-sm text-gray-600">สถานะ: {g.status}</p>
                  </div>
                  <div className="w-full lg:w-auto flex-shrink-0">
                    <button
                      onClick={() => router.push(`/user_teacher/book/book_page/${g.GuidanceID}`)}
                      className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
                    >
                      ดูรายละเอียด
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
