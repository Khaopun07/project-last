'use client';

export const dynamic = 'force-dynamic'; // Force dynamic rendering for this page

import { useEffect, useState, FormEvent, ChangeEvent, Dispatch, SetStateAction } from 'react';

// More specific types for better type safety
type GuidanceStatus = 'เปิดรับ' | 'ปิดรับ' | 'เสร็จสิ้น' | 'open' | 'closed' | 'done' | '';
type GuidanceCategory = 'ในนามคณะ' | 'ในนามยังสมาร์ท' | 'ในนามมหาวิทยาลัย';

type Guidance = {
  GuidanceID: string;
  guidance_date: string;
  school_id: string;
  counselor_id: string;
  student_count: string;
  study_plan: string;
  faculty_in_charge: string;
  professor_in_charge: string;
  Category: GuidanceCategory;
  status: GuidanceStatus;
  Start_Time: string;
  Start_Stop: string;
  Sc_name?: string;
};

type School = { Sc_id: string; Sc_name: string };

type Teacher = {
  Username: string;
  F_name: string;
  L_name: string;
};

const emptyGuidance: Guidance = {
  GuidanceID: '',
  guidance_date: '',
  school_id: '',
  counselor_id: '',
  student_count: '',
  study_plan: '',
  faculty_in_charge: '',
  professor_in_charge: '',
  Category: 'ในนามคณะ',
  status: '',
  Start_Time: '',
  Start_Stop: '',
};

function toDateTimeLocal(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.length >= 16 ? dateStr.replace(' ', 'T').substring(0, 16) : '';
}

// Helper to fetch and parse JSON, with robust data extraction.
// Moved outside the component and setError is passed as an argument for better separation of concerns.
const fetchJson = async <T,>(
  url: string,
  setter: (data: T[]) => void,
  setError: Dispatch<SetStateAction<string | null>>,
  entityName: string
): Promise<void> => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${entityName}`);
    const data = await res.json();
    // Handle various API response structures, e.g., { data: [...] } or just [...]
    const items = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    setter(items);
  } catch (err: any) {
    console.error(`Error fetching ${entityName}:`, err);
    setError(prev => `${prev ? prev + '\n' : ''}Failed to load ${entityName}.`);
    setter([]);
  }
};

export default function GuidancePage() {
  const [guidance, setGuidance] = useState<Guidance[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [form, setForm] = useState<Guidance>(emptyGuidance);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchJson<Guidance>('/api/auth/guidance', setGuidance, setError, 'guidance activities'),
        fetchJson<School>('/api/school', setSchools, setError, 'schools'),
        fetchJson<Teacher>('/api/teacher', setTeachers, setError, 'teachers'),
      ]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/auth/guidance/${editingId}` : '/api/auth/guidance';
      // When creating, don't send an empty GuidanceID.
      const payload = editingId ? form : { ...form, GuidanceID: undefined };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'บันทึกไม่สำเร็จ' }));
        throw new Error(errorData.message);
      }

      // Refetch data to show the update
      await fetchJson<Guidance>('/api/auth/guidance', setGuidance, setError, 'guidance activities');
      setForm(emptyGuidance);
      setEditingId(null);
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดที่ไม่รู้จักระหว่างการส่งข้อมูล');
    }
  };

  const handleEdit = (item: Guidance) => {
    setForm(item);
    setEditingId(item.GuidanceID);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`ลบกิจกรรมแนะแนวรหัส ${id} ?`)) return;
    setError(null); // Clear previous errors
    try {
      const res = await fetch(`/api/auth/guidance/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'ลบไม่สำเร็จ' }));
        throw new Error(errorData.message);
      }
      // Refetch data to show the update
      await fetchJson<Guidance>('/api/auth/guidance', setGuidance, setError, 'guidance activities');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดที่ไม่รู้จักระหว่างการลบ');
    }
  };

  // แปลงสถานะให้แสดงข้อความที่เข้าใจง่าย
  const displayStatus = (status: GuidanceStatus): 'เปิดรับ' | 'ปิดรับ' | 'เสร็จสิ้น' | 'ไม่ระบุสถานะ' => {
    const statusMap: Record<string, 'เปิดรับ' | 'ปิดรับ' | 'เสร็จสิ้น'> = {
      'เปิดรับ': 'เปิดรับ',
      'ปิดรับ': 'ปิดรับ',
      'เสร็จสิ้น': 'เสร็จสิ้น',
      'open': 'เปิดรับ',
      'closed': 'ปิดรับ',
      'done': 'เสร็จสิ้น',
    };
    return statusMap[status] || 'ไม่ระบุสถานะ';
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📘 จัดการกิจกรรมแนะแนว</h1>

      <button
        onClick={() => {
          setForm(emptyGuidance);
          setEditingId(null);
          setShowForm(true);
        }}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ➕ เปิดฟอร์ม
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{editingId ? '✏️ แก้ไขกิจกรรม' : '➕ เพิ่มกิจกรรมใหม่'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="guidance_date"
              type="datetime-local"
              value={toDateTimeLocal(form.guidance_date)}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            />

            <select
              name="school_id"
              value={form.school_id}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full"
            >
              <option value="">-- เลือกโรงเรียน --</option>
              {schools.map((s) => (
                <option key={s.Sc_id} value={s.Sc_id}>
                  {s.Sc_name}
                </option>
              ))}
            </select>

            <select
              name="counselor_id"
              value={form.counselor_id}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">-- เลือกอาจารย์แนะแนว --</option>
              {teachers.map((t) => (
                <option key={t.Username} value={t.Username}>
                  {t.F_name} {t.L_name}
                </option>
              ))}
            </select>

            <input
              name="student_count"
              placeholder="จำนวนนักเรียน"
              value={form.student_count}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <input
              name="study_plan"
              placeholder="แผนการเรียน"
              value={form.study_plan}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <input
              name="faculty_in_charge"
              placeholder="ชื่อคณะที่รับผิดชอบ"
              value={form.faculty_in_charge}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <input
              name="professor_in_charge"
              placeholder="ชื่อคุณครูผู้รับผิดชอบ"
              value={form.professor_in_charge}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <select
              name="Category"
              value={form.Category}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="ในนามคณะ">ในนามคณะ</option>
              <option value="ในนามยังสมาร์ท">ในนามยังสมาร์ท</option>
              <option value="ในนามมหาวิทยาลัย">ในนามมหาวิทยาลัย</option>
            </select>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">-- เลือกสถานะ --</option>
              <option value="เปิดรับ">เปิดรับ</option>
              <option value="ปิดรับ">ปิดรับ</option>
              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            </select>

            <input
              name="Start_Time"
              type="datetime-local"
              value={toDateTimeLocal(form.Start_Time)}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />

            <input
              name="Start_Stop"
              type="datetime-local"
              value={toDateTimeLocal(form.Start_Stop)}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              {editingId ? 'อัปเดต' : 'บันทึก'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>⏳ กำลังโหลดข้อมูล...</p>
      ) : error ? (
        <p className="text-red-600">❌ {error}</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">วันที่</th>
                <th scope="col" className="px-6 py-3">โรงเรียน</th>
                <th scope="col" className="px-6 py-3">อาจารย์แนะแนว</th>
                <th scope="col" className="px-6 py-3">แผนการเรียน</th>
                <th scope="col" className="px-6 py-3">คณะที่รับผิดชอบ</th>
                <th scope="col" className="px-6 py-3">สถานะ</th>
                <th scope="col" className="px-6 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {guidance.map((item) => {
                const teacher = teachers.find((t) => t.Username === item.counselor_id);
                const counselorName = teacher ? `${teacher.F_name} ${teacher.L_name}` : item.counselor_id;
                const schoolName = item.Sc_name ?? item.school_id;

                return (
                  <tr key={item.GuidanceID} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{new Date(item.guidance_date).toLocaleString('th-TH')}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{schoolName}</td>
                    <td className="px-6 py-4">{counselorName}</td>
                    <td className="px-6 py-4">{item.study_plan}</td>
                    <td className="px-6 py-4">{item.faculty_in_charge}</td>
                    <td className="px-6 py-4">{displayStatus(item.status)}</td>
                    <td className="px-6 py-4 text-center space-x-2">
                      <button onClick={() => handleEdit(item)} className="font-medium text-blue-600 hover:underline">แก้ไข</button>
                      <button onClick={() => handleDelete(item.GuidanceID)} className="font-medium text-red-600 hover:underline">ลบ</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
