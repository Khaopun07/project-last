'use client';
import { useState } from 'react';

interface School {
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
}

export function SchoolApprovalTable({
  schools,
  showApproval = false,
}: {
  schools: School[];
  showApproval?: boolean;
}) {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const handleApproval = async (schoolId: string) => {
    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schoolId, isApproved: true }),
      });

      if (response.ok) {
        closeDetailModal();
        window.location.reload();
      } else {
        alert('เกิดข้อผิดพลาดในการอนุมัติ');
      }
    } catch (error) {
      console.error('Error approving school:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const handleReject = async (schoolId: string) => {
    if (confirm('คุณต้องการปฏิเสธคำขอนี้หรือไม่?')) {
      try {
        const response = await fetch('/api/reject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schoolId }),
        });

        if (response.ok) {
          closeDetailModal();
          window.location.reload();
        } else {
          alert('เกิดข้อผิดพลาดในการปฏิเสธ');
        }
      } catch (error) {
        console.error('Error rejecting school:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      }
    }
  };

  const openDetailModal = (school: School) => {
    setSelectedSchool(school);
  };

  const closeDetailModal = () => {
    setSelectedSchool(null);
  };

  const headers = showApproval
    ? ["ชื่อโรงเรียน", "จังหวัด", "อีเมล", "เบอร์โทร", "สถานะ", "รายละเอียด"]
    : ["ชื่อโรงเรียน", "จังหวัด", "อีเมล", "เบอร์โทร", "สถานะ"];

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-blue-200 shadow-sm">
      <table className="min-w-full text-sm text-left bg-white">
        <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-4 font-semibold tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-100">
          {schools.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center text-gray-500 py-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🏫</span>
                  </div>
                  <p className="text-lg font-medium">ไม่มีข้อมูล</p>
                  <p className="text-sm text-gray-400">
                    {showApproval ? 'ไม่มีโรงเรียนรอการอนุมัติ' : 'ไม่มีโรงเรียนที่อนุมัติแล้ว'}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            schools.map((school, rowIndex) => (
              <tr
                key={school.Sc_id}
                className={`transition-all duration-200 ${
                  rowIndex % 2 === 0
                    ? 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                    : 'bg-gradient-to-r from-blue-25 to-indigo-25 hover:from-blue-50 hover:to-indigo-50'
                } hover:shadow-md hover:scale-[1.01] transform`}
              >
                <td className="px-6 py-4 text-gray-700 font-medium">{school.Sc_name}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{school.Sc_province}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{school.Sc_email}</td>
                <td className="px-6 py-4 text-gray-700 font-medium">{school.Sc_phone}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    school.is_approved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {school.is_approved ? '✅ อนุมัติแล้ว' : '⏳ รอการอนุมัติ'}
                  </span>
                </td>
                {showApproval && (
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openDetailModal(school)}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      👁️ รายละเอียด
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

      {selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold">🏫 รายละเอียดโรงเรียน</h2>
              <button
                onClick={closeDetailModal}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📋 ข้อมูลพื้นฐาน</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">รหัสโรงเรียน:</span>
                    <span className="text-gray-800 font-mono">{selectedSchool.Sc_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">ชื่อโรงเรียน:</span>
                    <span className="text-gray-800 font-medium text-right">{selectedSchool.Sc_name}</span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📍 ข้อมูลที่อยู่</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">ที่อยู่:</span><span className="text-gray-800 text-right">{selectedSchool.Sc_address || '-'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">ตำบล:</span><span className="text-gray-800">{selectedSchool.Sc_subdistrict || '-'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">อำเภอ:</span><span className="text-gray-800">{selectedSchool.Sc_district || '-'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">จังหวัด:</span><span className="text-gray-800">{selectedSchool.Sc_province || '-'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">รหัสไปรษณีย์:</span><span className="text-gray-800">{selectedSchool.Sc_postal || '-'}</span></div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📞 ข้อมูลการติดต่อ</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">เบอร์โทรศัพท์:</span><span className="text-gray-800">{selectedSchool.Sc_phone || '-'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">อีเมล:</span><span className="text-blue-600 break-all">{selectedSchool.Sc_email || '-'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">เว็บไซต์:</span><span className="text-blue-600 break-all">{selectedSchool.Sc_website || '-'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">ชื่อผู้ติดต่อ:</span><span className="text-gray-800">{selectedSchool.Contact_name || '-'}</span></div>
                  <div className="flex justify-between"><span className="font-semibold text-gray-600">เบอร์ผู้ติดต่อ:</span><span className="text-gray-800">{selectedSchool.Contact_no || '-'}</span></div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📊 สถานะ</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-600">สถานะปัจจุบัน:</span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${selectedSchool.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{selectedSchool.is_approved ? '✅ อนุมัติแล้ว' : '⏳ รอการอนุมัติ'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end p-5 bg-gray-50 rounded-b-2xl border-t">
              <button onClick={() => handleApproval(selectedSchool.Sc_id)} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-md">✅ อนุมัติ</button>
              <button onClick={() => handleReject(selectedSchool.Sc_id)} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 transform hover:scale-105 shadow-md">❌ ปฏิเสธ</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}