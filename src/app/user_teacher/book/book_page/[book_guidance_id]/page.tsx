'use client';
// index/user_teacher/book/book_page/[book_guidance_id]/page.tsx

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type GuidanceDetail = {
  GuidanceID: number;
  guidance_date: string;
  school_id: number;
  counselor_id: number;
  student_count: number;       // จำนวนผู้สมัครจริง
  study_plan: string;
  faculty_in_charge: string;
  professor_in_charge: string;
  Category: string;
  status: string;
  Start_Time: string;
  Start_Stop: string;
  car_registration?: string;
  number_seats?: number;
  car_type?: string;
  car_phone?: string;
  Sc_name: string;
  Sc_address: string;
  Sc_district?: string;
  Sc_subdistrict?: string;
  Sc_province?: string;
  Sc_postal?: string;
  Sc_phone: string;
  Sc_email: string;
  Sc_website: string;
  Contact_name?: string;
  Contact_no?: string;
  formatted_date?: string;
  formatted_start_time?: string;
  formatted_end_time?: string;
  full_address?: string;
  is_available?: boolean;
  days_until_event?: number;
};

export default function GuidanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const book_guidance_id = Array.isArray(params.book_guidance_id)
    ? params.book_guidance_id[0]
    : params.book_guidance_id;

  const [guidance, setGuidance] = useState<GuidanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!book_guidance_id || isNaN(Number(book_guidance_id))) {
      setError('ไม่พบรหัสกิจกรรมแนะแนว');
      setLoading(false);
      return;
    }

    async function fetchGuidanceDetail() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/auth/guidance_ad/${book_guidance_id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        setGuidance(data);
      } catch (err: any) {
        setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    }

    fetchGuidanceDetail();
  }, [book_guidance_id]);

  const formatEndTime = (timeStr: string) => {
    try {
      const dt = new Date(timeStr);
      return dt.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' น.';
    } catch {
      return timeStr;
    }
  };

  const formatThaiDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const time = new Date(`2000-01-01 ${timeStr}`);
      return time.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ' น.';
    } catch {
      return timeStr;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
            <p className="text-xl text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-semibold text-lg">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!guidance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">ไม่พบข้อมูล</h3>
            <p className="text-gray-500">ไม่พบข้อมูลกิจกรรมแนะแนวนี้</p>
          </div>
        </div>
      </div>
    );
  }

  const participantPercentage = 0; // ไม่แสดง progress bar เนื่องจากไม่มี max_participants

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
            รายละเอียดกิจกรรมแนะแนว
          </h1>
          <p className="text-lg text-gray-600">
            ข้อมูลครบถ้วนเกี่ยวกับกิจกรรมแนะแนวที่คุณสนใจ
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Left Column (3/5 width) */}
            <div className="lg:col-span-3 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
              {/* School Information */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 21V5a2 2 0 012-2h2a2 2 0 012 2v16M7 21h8M7 8h1m3 0h1m-1 4h1m-4 0h1" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{guidance.Sc_name}</h3>
                    <p className="text-sm text-gray-500">ข้อมูลโรงเรียนและรายละเอียดการติดต่อ</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <div className="text-gray-700">
                      <span className="font-semibold">ที่อยู่:</span> {guidance.Sc_address}, ต. {guidance.Sc_subdistrict || '-'}, อ. {guidance.Sc_district || '-'}, จ. {guidance.Sc_province || '-'} {guidance.Sc_postal || ''}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span className="text-gray-700"><span className="font-semibold">โทร:</span> {guidance.Sc_phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <a href={`mailto:${guidance.Sc_email}`} className="text-blue-600 hover:underline truncate">{guidance.Sc_email}</a>
                    </div>
                    {guidance.Sc_website && (
                      <div className="flex items-center gap-3 sm:col-span-2">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        <a href={guidance.Sc_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{guidance.Sc_website}</a>
                      </div>
                    )}
                  </div>
                  {(guidance.Contact_name || guidance.Contact_no) && (
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <p className="font-semibold text-gray-800 mb-1">ผู้ประสานงาน</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                        {guidance.Contact_name && <p className="text-gray-700">คุณ {guidance.Contact_name}</p>}
                        {guidance.Contact_no && <p className="text-gray-700">โทร. {guidance.Contact_no}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Details */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">ข้อมูลการแนะแนว</h3>
                    <p className="text-sm text-gray-500">รายละเอียดของกิจกรรม</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-500">แผนการเรียน</p>
                    <p className="font-semibold text-gray-800">{guidance.study_plan || 'ไม่ระบุ'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-500">คณะรับผิดชอบ</p>
                    <p className="font-semibold text-gray-800">{guidance.faculty_in_charge || 'ไม่ระบุ'}</p>
                  </div>
                  {/* <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-500">อาจารย์ผู้รับผิดชอบ</p>
                    <p className="font-semibold text-gray-800">{guidance.professor_in_charge || 'ไม่ระบุ'}</p>
                  </div> */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-500">หมวดหมู่</p>
                    <p className="font-semibold text-gray-800">{guidance.Category}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Column (2/5 width) */}
            <div className="lg:col-span-2 p-6 lg:p-8 bg-gray-50/50">
              <div className="space-y-6">
                {/* Date & Time */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">วันและเวลา</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center flex-shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                      <div>
                        <p className="text-xs text-gray-500">วันที่จัดกิจกรรม</p>
                        <p className="font-bold text-gray-800 text-sm">{guidance.formatted_date || formatThaiDate(guidance.guidance_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center flex-shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                      <div>
                        <p className="text-xs text-gray-500">เวลา</p>
                        <p className="font-bold text-gray-800 text-sm">{guidance.formatted_start_time || formatTime(guidance.Start_Time)} - {guidance.formatted_end_time || formatTime(guidance.Start_Stop)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Participants */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">สถานะและผู้เข้าร่วม</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border text-center">
                      <p className="text-xs text-gray-500 mb-1">สถานะ</p>
                      <p className={`text-lg font-bold ${guidance.status === 'เปิดรับ' ? 'text-green-600' : guidance.status === 'ปิดรับ' ? 'text-red-600' : 'text-gray-600'}`}>{guidance.status}</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border text-center">
                      <p className="text-xs text-gray-500 mb-1">จำนวนนักเรียน</p>
                      <p className="text-lg font-bold text-blue-600">{guidance.student_count} คน</p>
                    </div>
                  </div>
                </div>

                {/* Transportation */}
                {(guidance.car_type || guidance.car_registration) && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">ข้อมูลการเดินทาง</h3>
                    <div className="p-4 bg-white rounded-lg border space-y-2 text-sm">
                      {guidance.car_type && <p><span className="font-semibold">ประเภทรถ:</span> {guidance.car_type}</p>}
                      {guidance.car_registration && <p><span className="font-semibold">ทะเบียน:</span> {guidance.car_registration}</p>}
                      {guidance.number_seats && <p><span className="font-semibold">ที่นั่ง:</span> {guidance.number_seats}</p>}
                      {guidance.car_phone && <p><span className="font-semibold">โทรคนขับ:</span> {guidance.car_phone}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <button
            onClick={() => router.back()}
            className="group px-8 py-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              กลับหน้าก่อน
            </span>
          </button>

          <button
            onClick={() =>
              router.push(
                `/user_teacher/book/book_page/${guidance.GuidanceID}/page1?schoolName=${encodeURIComponent(guidance.Sc_name)}&teacherName=${encodeURIComponent(guidance.professor_in_charge || 'ไม่ระบุ')}`
              )
            }
            disabled={guidance.status !== 'เปิดรับ'}
            className={`group px-8 py-4 font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 ${
              guidance.status === 'เปิดรับ'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {guidance.status === 'เปิดรับ' ? (
                <>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  ลงชื่อเพื่อเข้าร่วม
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ปิดรับสมัครแล้ว
                </>
              )}
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}