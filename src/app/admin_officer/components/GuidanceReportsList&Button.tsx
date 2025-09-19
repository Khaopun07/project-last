'use client';

import { useState, useMemo } from 'react';
import { CalendarIcon, ClockIcon, UsersIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

/**
 * Interface สำหรับโครงสร้างข้อมูลกิจกรรมแนะแนว
 */
interface Guidance {
  GuidanceID: number;
  study_plan: string;
  faculty_in_charge: string;
  professor_in_charge: string;
  guidance_date: string;
  Start_Time: string;
  Start_Stop: string;
  student_count: number;
  school_id: number;
  Sc_name?: string;
  counselor_id: number;
  status: string;
  Category: string;
}

/**
 * คอมโพเนนต์ปุ่ม PDF ที่ได้รับการปรับปรุงแล้ว
 * รวมทั้งการดูและดาวน์โหลด PDF ในคอมโพเนนต์เดียว
 */
function PDFButtons({ guidanceId }: { guidanceId: number }) {
  return (
    <div className="flex flex-col gap-2 min-w-[140px]">
      {/* ปุ่มดู PDF */}
      <a
        href={`/api/pdf?id=${guidanceId}&download=false`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg 
        hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      >
        🔍 ดู PDF
      </a>

      {/* ปุ่มดาวน์โหลด PDF */}
      <a
        href={`/api/pdf?id=${guidanceId}&download=true`}
        download={`รายงานกิจกรรม_${guidanceId}_${Date.now()}.pdf`}
        className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg 
        hover:bg-green-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md 
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
      >
        📥 ดาวน์โหลด
      </a>
    </div>
  );
}

/**
 * คอมโพเนนต์แสดงรายการ Guidance Reports พร้อมฟังก์ชันค้นหาและตัวกรอง
 */
export default function GuidanceReportsList({ activities }: { activities: Guidance[] }) {
  const [selectedActivity, setSelectedActivity] = useState<Guidance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'school' | 'status'>('date');

  const filteredActivities = useMemo(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch =
        (activity.Sc_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.study_plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.faculty_in_charge.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.professor_in_charge.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.guidance_date).getTime() - new Date(a.guidance_date).getTime();
        case 'school':
          return a.school_id - b.school_id;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [activities, searchTerm, statusFilter, sortBy]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A';
    // Prepending a dummy date to handle time-only strings like "HH:mm:ss"
    const date = new Date(`1970-01-01T${timeString}`);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'เปิดรับ': 'bg-green-100 text-green-800 border-green-200',
      'ปิดรับ': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'เสร็จสิ้น': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || styles['เสร็จสิ้น']
        }`}
      >
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      'ในนามคณะ': 'bg-blue-100 text-blue-800',
      'ในนามยังสมาร์ท': 'bg-purple-100 text-purple-800',
      'ในนามมหาวิทยาลัย': 'bg-red-100 text-red-800'
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[category as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {category}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="ค้นหากิจกรรม, คณะ, หรืออาจารย์..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="เปิดรับ">เปิดรับ</option>
          <option value="ปิดรับ">ปิดรับ</option>
          <option value="เสร็จสิ้น">เสร็จสิ้น</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'date' | 'school' | 'status')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="date">เรียงตามวันที่</option>
          <option value="school">เรียงตามโรงเรียน</option>
          <option value="status">เรียงตามสถานะ</option>
        </select>
      </div>

      {/* Results Counter */}
      <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
        พบ <span className="font-medium text-gray-800">{filteredActivities.length}</span> กิจกรรม
        จากทั้งหมด <span className="font-medium text-gray-800">{activities.length}</span> กิจกรรม
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.map(activity => (
          <div
            key={activity.GuidanceID}
            className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 ${
              selectedActivity?.GuidanceID === activity.GuidanceID ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex flex-wrap gap-2 items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    กิจกรรมแนะแนวที่: {activity.Sc_name || '(ไม่พบชื่อโรงเรียน)'}
                  </h3>
                  {getStatusBadge(activity.status)}
                  {getCategoryBadge(activity.Category)}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{formatDate(activity.guidance_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{formatTime(activity.Start_Time)} - {formatTime(activity.Start_Stop)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{activity.faculty_in_charge}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{activity.student_count} นักเรียน</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() =>
                    setSelectedActivity(selectedActivity?.GuidanceID === activity.GuidanceID ? null : activity)
                  }
                  className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium min-w-[120px]"
                >
                  {selectedActivity?.GuidanceID === activity.GuidanceID ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                </button>

                <PDFButtons guidanceId={activity.GuidanceID} />
              </div>
            </div>

            {/* Expanded Details */}
            {selectedActivity?.GuidanceID === activity.GuidanceID && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border-t">
                <h4 className="font-medium text-gray-900 mb-3">รายละเอียดเพิ่มเติม</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">โรงเรียน:</span>
                      <span className="ml-2 text-gray-600">{activity.Sc_name || '(ไม่พบชื่อโรงเรียน)'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">หลักสูตร:</span>
                      <span className="ml-2 text-gray-600">{activity.study_plan}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">อาจารย์ผู้รับผิดชอบ:</span>
                      <span className="ml-2 text-gray-600">{activity.professor_in_charge}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-lg mb-2 font-medium">ไม่พบกิจกรรมที่ตรงกับเงื่อนไขการค้นหา</div>
            <div className="text-sm">ลองเปลี่ยนคำค้นหาหรือตัวกรองต่างๆ</div>
          </div>
        )}
      </div>
    </div>
  );
}