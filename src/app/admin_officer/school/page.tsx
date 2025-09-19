'use client';
import { useEffect, useState } from 'react';

// To prevent build errors with static exports (`output: 'export'`),
// ensure `export const dynamic = 'force-dynamic';` is removed or commented out.
// This page is a client component and fetches data dynamically on the client-side.

type School = {
  Sc_id: string;  // เปลี่ยนเป็น string
  Sc_name: string;
  Sc_address: string;
  Sc_district: string;
  Sc_province: string;
  Sc_postcode: string;
  Sc_phone: string;
  Sc_email: string;
  Sc_website: string;
  Contact_no: string;
  Contact_name: string;
};

const emptySchool: School = {
  Sc_id: '',  // ค่าว่างเป็น string
  Sc_name: '',
  Sc_address: '',
  Sc_district: '',
  Sc_province: '',
  Sc_postcode: '',
  Sc_phone: '',
  Sc_email: '',
  Sc_website: '',
  Contact_no: '',
  Contact_name: '',
};

export default function SchoolPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [form, setForm] = useState<School>(emptySchool);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    fetchSchool();
  }, []);

  const fetchSchool = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/school');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSchools(data);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/school/${editingId}` : '/api/school';

      // ถ้าเพิ่มใหม่ ให้ไม่ส่ง Sc_id
      const payload = editingId
        ? form
        : {
            Sc_name: form.Sc_name,
            Sc_address: form.Sc_address,
            Sc_district: form.Sc_district,
            Sc_province: form.Sc_province,
            Sc_postcode: form.Sc_postcode,
            Sc_phone: form.Sc_phone,
            Sc_email: form.Sc_email,
            Sc_website: form.Sc_website,
            Contact_no: form.Contact_no,
            Contact_name: form.Contact_name,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Error: ${res.statusText}` }));
        throw new Error(errorData.message || 'An unknown error occurred');
      }

      await fetchSchool();
      setForm(emptySchool);
      setEditingId(null);
      setShowForm(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEdit = (school: School) => {
    setForm(school);
    setEditingId(school.Sc_id);
    setError(null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`ยืนยันการลบโรงเรียนรหัส ${id}?`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/school/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Error: ${res.statusText}` }));
        throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
      }
      await fetchSchool();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🏫 ข้อมูลโรงเรียน</h1>

      <button
        onClick={() => {
          setShowForm(!showForm);
          setForm(emptySchool);
          setEditingId(null);
        }}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {showForm ? '❌ ปิดฟอร์ม' : '➕ เปิดฟอร์ม'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 border rounded-xl shadow mb-6 space-y-4">
          <h2 className="text-lg font-semibold">{editingId ? '✏️ แก้ไขโรงเรียน' : '➕ เพิ่มโรงเรียนใหม่'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editingId && (
              <input
                name="Sc_id"
                type="text"  // แก้จาก number เป็น text เพราะมีเลขนำหน้า 0
                placeholder="รหัสโรงเรียน"
                value={form.Sc_id}
                readOnly
                className="border p-3 rounded-md bg-gray-100 cursor-not-allowed"
              />
            )}
            <input
              name="Sc_name"
              placeholder="ชื่อโรงเรียน"
              value={form.Sc_name}
              onChange={handleChange}
              className="border p-3 rounded-md"
              required
            />
            <input
              name="Sc_address"
              placeholder="ที่อยู่"
              value={form.Sc_address}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
            <input
              name="Sc_district"
              placeholder="อำเภอ"
              value={form.Sc_district}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
            <input
              name="Sc_province"
              placeholder="จังหวัด"
              value={form.Sc_province}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
            <input
              name="Sc_postcode"
              placeholder="รหัสไปรษณีย์"
              value={form.Sc_postcode}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
            <input
              name="Sc_phone"
              placeholder="เบอร์โทรศัพท์"
              value={form.Sc_phone}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
            <input
              name="Sc_email"
              placeholder="อีเมล"
              type="email"
              value={form.Sc_email}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
            <input
              name="Sc_website"
              placeholder="เว็บไซต์"
              value={form.Sc_website}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
            <input
              name="Contact_no"
              placeholder="เบอร์ผู้ติดต่อ"
              value={form.Contact_no}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
            <input
              name="Contact_name"
              placeholder="ชื่อผู้ติดต่อ"
              value={form.Contact_name}
              onChange={handleChange}
              className="border p-3 rounded-md"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
              {editingId ? 'อัปเดต' : 'เพิ่ม'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm(emptySchool);
                  setEditingId(null);
                  setShowForm(false);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
              >
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      )}

      {error && <div className="text-red-500 mb-4">❌ {error}</div>}

      {loading ? (
        <p>⏳ กำลังโหลดข้อมูล...</p>
      ) : schools.length === 0 ? (
        <p className="text-gray-500">ไม่พบข้อมูลโรงเรียน</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-xl">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="py-2 px-4 text-left">รหัส</th>
                <th className="py-2 px-4 text-left">ชื่อโรงเรียน</th>
                <th className="py-2 px-4 text-left">จังหวัด</th>
                <th className="py-2 px-4 text-left">อีเมล</th>
                <th className="py-2 px-4 text-left">เบอร์โทร</th>
                <th className="py-2 px-4 text-left">ผู้ติดต่อ</th>
                <th className="py-2 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.Sc_id} className="border-t hover:bg-gray-50 text-sm">
                  <td className="py-2 px-4">{school.Sc_id}</td>
                  <td className="py-2 px-4">{school.Sc_name}</td>
                  <td className="py-2 px-4">{school.Sc_province}</td>
                  <td className="py-2 px-4">{school.Sc_email}</td>
                  <td className="py-2 px-4">{school.Sc_phone}</td>
                  <td className="py-2 px-4">{school.Contact_name}</td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={() => handleEdit(school)} className="text-blue-600 hover:underline mr-2">
                      แก้ไข
                    </button>
                    <button onClick={() => handleDelete(school.Sc_id)} className="text-red-600 hover:underline">
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
