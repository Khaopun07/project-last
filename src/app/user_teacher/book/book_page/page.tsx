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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
            กิจกรรมแนะแนว
          </h1>
          <p className="text-lg text-gray-600">
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
            {filteredGuidances.map((g) => (
              <div key={g.GuidanceID} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                <div className="p-6 lg:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{g.Sc_name}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          <div>
                            <p className="font-semibold text-gray-700">วันที่และเวลา</p>
                            <p className="text-gray-600">{g.formatted_date || new Date(g.guidance_date).toLocaleDateString('th-TH')}</p>
                            <p className="text-gray-600">{g.formatted_start_time || g.Start_Time} - {g.formatted_end_time || g.Start_Stop}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-9-11.494v11.494l9-4.5V1.753l-9 4.5z m18 0v11.494l-9-4.5V1.753l9 4.5z"></path></svg>
                          <div>
                            <p className="font-semibold text-gray-700">แผนการเรียน</p>
                            <p className="text-gray-600">{g.study_plan || 'ไม่ระบุ'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          <div>
                            <p className="font-semibold text-gray-700">คณะผู้รับผิดชอบ</p>
                            <p className="text-gray-600">{g.faculty_in_charge || 'ไม่ระบุ'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          <div>
                            <p className="font-semibold text-gray-700">อาจารย์ผู้รับผิดชอบ</p>
                            <p className="text-gray-600">{g.professor_in_charge || 'ไม่ระบุ'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Status & Action */}
                    <div className="lg:col-span-1 flex flex-col justify-between items-start lg:items-end space-y-4">
                      <div className="w-full space-y-3 text-center lg:text-right">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-700">สถานะ</p>
                          <p className={`text-lg font-bold ${g.status === 'เปิดรับ' ? 'text-green-600' : 'text-red-600'}`}>{g.status}</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-700">จำนวนนักเรียน</p>
                          <p className="text-lg font-bold text-blue-600">{g.student_count} คน</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/user_teacher/book/book_page/${g.GuidanceID}`)}
                        className="w-full lg:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 group-hover:scale-105"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Activities Found */}
        {!loading && !error && filteredGuidances.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">ไม่พบกิจกรรม</h3>
            <p className="text-gray-500">ไม่มีกิจกรรมในหมวดหมู่ '{selectedCategory}' ในขณะนี้</p>
          </div>
        )}
      </main>
    </div>
  );
}
