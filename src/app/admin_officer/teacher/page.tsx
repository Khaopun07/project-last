'use client';

import { useEffect, useState } from 'react';

// To prevent build errors with static exports (`output: 'export'`),
// ensure `export const dynamic = 'force-dynamic';` is removed or commented out.
// This page is a client component and fetches data dynamically on the client-side.

type Teacher = {
  Username: string;
  Prefix: string;
  F_name: string;
  L_name: string;
  Faculty: string;
  Phone: string;
  Email: string;
  Password: string;
};

const emptyTeacher: Teacher = {
  Username: '',
  Prefix: '',
  F_name: '',
  L_name: '',
  Faculty: '',
  Phone: '',
  Email: '',
  Password: '',
};

export default function TeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<Teacher>(emptyTeacher);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teacher');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTeachers(data);
    } catch (err: any) {
      console.error('Error fetching teacher:', err);
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const method = editingUsername ? 'PUT' : 'POST';
      const url = editingUsername
        ? `/api/teacher/${editingUsername}`
        : '/api/teacher';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Error: ${res.statusText}` }));
        throw new Error(errorData.message || 'An unknown error occurred');
      }

      await fetchTeachers();
      setForm(emptyTeacher);
      setEditingUsername(null);
      setShowForm(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setForm(teacher);
    setEditingUsername(teacher.Username);
    setShowForm(true);
  };

  const handleDelete = async (username: string) => {
  if (!username) {
    console.error('Username is required to delete');
    return;
  }
  if (!confirm(`ยืนยันการลบ ${username}?`)) return;
  setError(null);

  try {
    const res = await fetch(`/api/teacher/${username}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: `Error: ${res.statusText}` }));
      throw new Error(errorData.message || 'An unknown error occurred during deletion');
    }

    await fetchTeachers();
  } catch (error: any) {
    setError(error.message);
  }
};


  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📋 ข้อมูลอาจารย์</h1>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setForm(emptyTeacher);
            setEditingUsername(null);
          }}
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {showForm ? '❌ ปิดฟอร์ม' : '➕ เปิดฟอร์ม'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 mb-6 border space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingUsername ? '✏️ แก้ไขข้อมูลอาจารย์' : '➕ เพิ่มอาจารย์ใหม่'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="Username" placeholder="Username" value={form.Username} onChange={handleChange} required className="border p-3 rounded-md" disabled={!!editingUsername} />
              <input name="Password" placeholder="Password" value={form.Password} onChange={handleChange} required className="border p-3 rounded-md" />
              <input name="Prefix" placeholder="คำนำหน้า (เช่น ดร., ผศ.)" value={form.Prefix} onChange={handleChange} className="border p-3 rounded-md" />
              <input name="F_name" placeholder="ชื่อ" value={form.F_name} onChange={handleChange} className="border p-3 rounded-md" />
              <input name="L_name" placeholder="นามสกุล" value={form.L_name} onChange={handleChange} className="border p-3 rounded-md" />
              <input name="Faculty" placeholder="คณะ" value={form.Faculty} onChange={handleChange} className="border p-3 rounded-md" />
              <input name="Email" placeholder="Email" value={form.Email} onChange={handleChange} className="border p-3 rounded-md" />
              <input name="Phone" placeholder="เบอร์โทร" value={form.Phone} onChange={handleChange} className="border p-3 rounded-md" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition">
                {editingUsername ? 'อัปเดต' : 'เพิ่ม'}
              </button>
              {editingUsername && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyTeacher);
                    setEditingUsername(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition"
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Username</th>
                  <th className="py-2 px-4 text-left">คำนำหน้า</th>
                  <th className="py-2 px-4 text-left">ชื่อ</th>
                  <th className="py-2 px-4 text-left">นามสกุล</th>
                  <th className="py-2 px-4 text-left">คณะ</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">เบอร์โทร</th>
                  <th className="py-2 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.Username} className="border-t hover:bg-gray-50 text-sm">
                    <td className="py-2 px-4">{teacher.Username}</td>
                    <td className="py-2 px-4">{teacher.Prefix}</td>
                    <td className="py-2 px-4">{teacher.F_name}</td>
                    <td className="py-2 px-4">{teacher.L_name}</td>
                    <td className="py-2 px-4">{teacher.Faculty}</td>
                    <td className="py-2 px-4">{teacher.Email}</td>
                    <td className="py-2 px-4">{teacher.Phone}</td>
                    <td className="py-2 px-4 text-center">
                      <button onClick={() => handleEdit(teacher)} className="text-blue-600 hover:underline mr-2">
                        แก้ไข
                      </button>
                      <button onClick={() => handleDelete(teacher.Username)} className="text-red-600 hover:underline">
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
