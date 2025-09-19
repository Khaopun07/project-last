'use client';

import { GuidanceSummary } from '@/src/types/guidance_1';

interface StatusPillsProps {
  summary: GuidanceSummary;
}

export default function StatusPills({ summary }: StatusPillsProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {summary.statusBreakdown.map((status) => (
        <span
          key={status.status}
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            status.status === 'เปิดรับ' 
              ? 'bg-green-100 text-green-800'
              : status.status === 'ปิดรับ'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status.status}: {status.count} กิจกรรม
        </span>
      ))}
    </div>
  );
}