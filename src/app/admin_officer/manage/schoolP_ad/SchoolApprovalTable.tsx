'use client';
import Swal from 'sweetalert2';

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
  const handleApproval = async (schoolId: string) => {
    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolId, isApproved: true }),
      });

      if (response.ok) {
        await Swal.fire(
          'อนุมัติแล้ว!',
          'โรงเรียนได้รับการอนุมัติเรียบร้อย',
          'success'
        );
        window.location.reload();
      } else {
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถอนุมัติโรงเรียนได้', 'error');
      }
    } catch (error) {
      console.error('Error approving school:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    }
  };

  const handleReject = async (schoolId: string, schoolName: string) => {
    Swal.fire({
      title: 'ยืนยันการปฏิเสธ',
      text: `คุณต้องการปฏิเสธคำขอของโรงเรียน "${schoolName}" ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ปฏิเสธ',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch('/api/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId }),
          });

          if (response.ok) {
            await Swal.fire(
              'ปฏิเสธแล้ว!',
              'คำขอถูกปฏิเสธเรียบร้อย',
              'success'
            );
            window.location.reload();
          } else {
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถปฏิเสธคำขอได้', 'error');
          }
        } catch (error) {
          console.error('Error rejecting school:', error);
          Swal.fire('เกิดข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        }
      }
    });
  };

  const openDetailModal = (school: School) => {
    const detailHtml = `
      <div class="text-left p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        <div><h3 class="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📋 ข้อมูลพื้นฐาน</h3><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="font-semibold text-gray-600">รหัสโรงเรียน:</span><span class="text-gray-800 font-mono">${school.Sc_id}</span></div><div class="flex justify-between"><span class="font-semibold text-gray-600">ชื่อโรงเรียน:</span><span class="text-gray-800 font-medium text-right">${school.Sc_name}</span></div></div></div>
        <div><h3 class="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📍 ข้อมูลที่อยู่</h3><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="font-semibold text-gray-600">ที่อยู่:</span><span class="text-gray-800 text-right">${school.Sc_address || '-'}</span></div><div class="flex justify-between"><span class="font-semibold text-gray-600">ตำบล:</span><span class="text-gray-800">${school.Sc_subdistrict || '-'}</span></div><div class="flex justify-between"><span class="font-semibold text-gray-600">อำเภอ:</span><span class="text-gray-800">${school.Sc_district || '-'}</span></div><div class="flex justify-between"><span class="font-semibold text-gray-600">จังหวัด:</span><span class="text-gray-800">${school.Sc_province || '-'}</span></div><div class="flex justify-between"><span class="font-semibold text-gray-600">รหัสไปรษณีย์:</span><span class="text-gray-800">${school.Sc_postal || '-'}</span></div></div></div>
        <div><h3 class="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📞 ข้อมูลการติดต่อ</h3><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="font-semibold text-gray-600">เบอร์โทรศัพท์:</span><span class="text-gray-800">${school.Sc_phone || '-'}</span></div><div class="flex justify-between"><span class="font-semibold text-gray-600">อีเมล:</span><span class="text-blue-600 break-all">${school.Sc_email || '-'}</span></div><div class="flex justify-between"><span class="font-semibold text-gray-600">เว็บไซต์:</span><span class="text-blue-600 break-all">${school.Sc_website || '-'}</span></div><div class="flex justify-between"><span class="font-semibold text-gray-600">ชื่อผู้ติดต่อ:</span><span class="text-gray-800">${school.Contact_name || '-'}</span></div><div class="flex justify-between"><span class="font-semibold text-gray-600">เบอร์ผู้ติดต่อ:</span><span class="text-gray-800">${school.Contact_no || '-'}</span></div></div></div>
        <div><h3 class="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📊 สถานะ</h3><div class="flex justify-between items-center text-sm"><span class="font-semibold text-gray-600">สถานะปัจจุบัน:</span><span class="inline-flex px-3 py-1 rounded-full text-xs font-semibold ${school.is_approved ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">${school.is_approved ? '✅ อนุมัติแล้ว' : '⏳ รอการอนุมัติ'}</span></div></div>
      </div>
    `;

    Swal.fire({
      title: `<strong>🏫 รายละเอียดโรงเรียน</strong>`,
      html: detailHtml,
      showCloseButton: true,
      showDenyButton: true,
      focusConfirm: false,
      confirmButtonText: '✅ อนุมัติ',
      denyButtonText: `❌ ปฏิเสธ`,
      confirmButtonColor: '#10B981',
      denyButtonColor: '#EF4444',
    }).then((result) => {
      if (result.isConfirmed) {
        handleApproval(school.Sc_id);
      } else if (result.isDenied) {
        handleReject(school.Sc_id, school.Sc_name);
      }
    });
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
    </>
  );
}