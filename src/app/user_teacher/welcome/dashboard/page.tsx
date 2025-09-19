'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type GuidanceSummary = {
  GuidanceID: number;
  guidance_date: string;
  Sc_name: string;
  Category: string;
  status: string;
  student_count: number;
};

export default function TeacherDashboard() {
  const [guidanceList, setGuidanceList] = useState<GuidanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchGuidanceList() {
      try {
        const res = await fetch('/api/auth/guidance'); // <-- เปลี่ยนให้ตรง endpoint
        if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการดึงข้อมูล');
        const data = await res.json();
        setGuidanceList(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGuidanceList();
  }, []);

  if (loading) return <p>⏳ กำลังโหลด...</p>;
  if (error) return <p className="text-red-600">❌ {error}</p>;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">📋 กิจกรรมแนะแนวของอาจารย์</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">โรงเรียน</th>
              <th className="p-2 text-left">วันที่</th>
              <th className="p-2 text-left">หมวดหมู่</th>
              <th className="p-2 text-left">สถานะ</th>
              <th className="p-2 text-left">จำนวนผู้เข้าร่วม</th>
              <th className="p-2 text-left">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {guidanceList.map((item, index) => (
              <tr key={item.GuidanceID} className="border-t">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{item.Sc_name}</td>
                <td className="p-2">{new Date(item.guidance_date).toLocaleDateString('th-TH')}</td>
                <td className="p-2">{item.Category}</td>
                <td className={`p-2 ${item.status === 'เปิดรับ' ? 'text-green-600' : 'text-red-500'}`}>{item.status}</td>
                <td className="p-2">{item.student_count}</td>
                <td className="p-2">
                  <button
                    onClick={() => router.push(`/index/book/book_detail/${item.GuidanceID}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded mr-2"
                  >
                    ดูรายละเอียด
                  </button>
                  <button
                    onClick={() => router.push(`/index/book/manage/${item.GuidanceID}`)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
                  >
                    จัดการ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
