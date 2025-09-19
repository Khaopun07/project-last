'use client';
import { useState, useEffect, useMemo } from 'react';
import { SchoolApprovalTable } from '@/src/app/admin_officer/manage/schoolP_ad/SchoolApprovalTable';

type School = {
  Sc_id: string;
  Sc_name: string;
  Sc_address: string;
  Sc_district: string;
  Sc_subdistrict: string;
  Sc_province: string;
  Sc_postal: string;
  Sc_phone: string;
  Sc_email: string;
  Sc_website: string;
  Contact_no: string;
  Contact_name: string;
  is_approved: number;
};

export default function SchoolPendingApprovalPage() {
  const [pendingSchools, setPendingSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPendingSchools = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/school');
        if (!res.ok) {
          throw new Error(`Failed to fetch schools: ${res.statusText}`);
        }
        const allSchools: School[] = await res.json();
        setPendingSchools(allSchools.filter(school => school.is_approved === 0));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingSchools();
  }, []);

  const filteredSchools = useMemo(() => {
    if (!searchTerm.trim()) {
      return pendingSchools;
    }
    const searchLower = searchTerm.toLowerCase();
    return pendingSchools.filter(school =>
      school.Sc_name.toLowerCase().includes(searchLower) ||
      school.Sc_province.toLowerCase().includes(searchLower) ||
      (school.Contact_name || '').toLowerCase().includes(searchLower) ||
      (school.Contact_no || '').includes(searchTerm) ||
      (school.Sc_email || '').toLowerCase().includes(searchLower)
    );
  }, [pendingSchools, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                ⏳ โรงเรียนที่รอการอนุมัติ
              </h1>
              <p className="text-gray-600">ตรวจสอบและอนุมัติคำขอเพิ่มโรงเรียนใหม่</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">{filteredSchools.length}</div>
              <div className="text-sm text-gray-500">รายการ</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-end">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {loading && <p className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</p>}
        {error && <p className="text-center py-10 text-red-500">เกิดข้อผิดพลาด: {error}</p>}

        {/* Approval Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <SchoolApprovalTable schools={filteredSchools} showApproval={true} />
          </div>
        )}
      </main>
    </div>
  );
}