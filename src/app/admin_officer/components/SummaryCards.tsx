'use client';

import { GuidanceSummary } from '@/src/types/guidance_1';

interface SummaryCardsProps {
  summary: GuidanceSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-blue-600 mb-1">
          {summary.summary.totalActivities}
        </div>
        <div className="text-sm text-gray-600">กิจกรรมทั้งหมด</div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-green-600 mb-1">
          {summary.summary.totalStudents}
        </div>
        <div className="text-sm text-gray-600">นักเรียนเข้าร่วม</div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-purple-600 mb-1">
          {summary.summary.totalSchools}
        </div>
        <div className="text-sm text-gray-600">โรงเรียนที่เข้าร่วม</div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-2xl font-bold text-orange-600 mb-1">
          {summary.statusBreakdown.find(s => s.status === 'เสร็จสิ้น')?.count || 0}
        </div>
        <div className="text-sm text-gray-600">กิจกรรมที่เสร็จสิ้น</div>
      </div>
    </div>
  );
}