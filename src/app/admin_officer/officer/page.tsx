
'use client';

import { useEffect, useState } from 'react';

type Officer = {
  Username: string;
  Off_Fname: string;
  Off_Lname: string;
  Off_Position: string;
  Off_Email: string;
  Off_Phone: string;
  Off_Password: string;
};

const emptyOfficer: Officer = {
  Username: '',
  Off_Fname: '',
  Off_Lname: '',
  Off_Position: '',
  Off_Email: '',
  Off_Phone: '',
  Off_Password: '',
};

export default function OfficerPage() {
  const [officers, setOfficer] = useState<Officer[]>([]);
  const [form, setForm] = useState<Officer>(emptyOfficer);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);

  const fetchOfficer = async () => {
    try {
      const res = await fetch('/api/officer');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setOfficer(data);
    } catch (err: any) {
      console.error('Error fetching officer:', err);
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficer();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingUsername ? 'PUT' : 'POST';
      const url = editingUsername
        ? `/api/officer/${editingUsername}`
        : '/api/officer';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error(`Error: ${res.statusText}`);

      await fetchOfficer();
      setForm(emptyOfficer);
      setEditingUsername(null);
      setShowForm(false);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleEdit = (officer: Officer) => {
    setForm(officer);
    setEditingUsername(officer.Username);
    setShowForm(true);
  };

  const handleDelete = async (username: string) => {
    if (!confirm(`ยืนยันการลบ ${username}?`)) return;
    try {
      const res = await fetch(`/api/officer/${username}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      await fetchOfficer();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📋 ข้อมูลเจ้าหน้าที่</h1>

      <button
        onClick={() => {
          setShowForm(!showForm);
          setForm(emptyOfficer);
          setEditingUsername(null);
        }}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {showForm ? '❌ ปิดฟอร์ม' : '➕ เปิดฟอร์ม'}
      </button>

      {showForm && (
        <div className="bg-white shadow-md rounded p-6 mb-6 border">
          <h2 className="text-xl font-semibold mb-4">
            {editingUsername ? '✏️ แก้ไขข้อมูลเจ้าหน้าที่' : '➕ เพิ่มเจ้าหน้าที่ใหม่'}
          </h2>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4 mb-6 max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-800">{editingUsername ? 'แก้ไขข้อมูลเจ้าหน้าที่' : 'เพิ่มเจ้าหน้าที่ใหม่'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="Username" placeholder="Username" value={form.Username} onChange={handleChange} required className="border p-3 rounded-md" disabled={!!editingUsername} />
              <input name="Off_Password" placeholder="Password" value={form.Off_Password} onChange={handleChange} required className="border p-3 rounded-md" />
              <input name="Off_Fname" placeholder="ชื่อ" value={form.Off_Fname} onChange={handleChange} className="border p-3 rounded-md" />
              <input name="Off_Lname" placeholder="นามสกุล" value={form.Off_Lname} onChange={handleChange} className="border p-3 rounded-md" />
              <input name="Off_Position" placeholder="ตำแหน่ง" value={form.Off_Position} onChange={handleChange} className="border p-3 rounded-md" />
              <input name="Off_Email" placeholder="Email" value={form.Off_Email} onChange={handleChange} className="border p-3 rounded-md" />
              <input name="Off_Phone" placeholder="เบอร์โทร" value={form.Off_Phone} onChange={handleChange} className="border p-3 rounded-md" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition">
                {editingUsername ? 'อัปเดต' : 'เพิ่ม'}
              </button>
              {editingUsername && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyOfficer);
                    setEditingUsername(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </form>

        </div>
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
                <th className="py-2 px-4 text-left">ชื่อ</th>
                <th className="py-2 px-4 text-left">นามสกุล</th>
                <th className="py-2 px-4 text-left">ตำแหน่ง</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">เบอร์โทร</th>
                <th className="py-2 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((officer) => (
                <tr key={officer.Username} className="border-t hover:bg-gray-50 text-sm">
                  <td className="py-2 px-4">{officer.Username}</td>
                  <td className="py-2 px-4">{officer.Off_Fname}</td>
                  <td className="py-2 px-4">{officer.Off_Lname}</td>
                  <td className="py-2 px-4">{officer.Off_Position}</td>
                  <td className="py-2 px-4">{officer.Off_Email}</td>
                  <td className="py-2 px-4">{officer.Off_Phone}</td>
                  <td className="py-2 px-4 text-center">
                    <button onClick={() => handleEdit(officer)} className="text-blue-600 hover:underline mr-2">
                      แก้ไข
                    </button>
                    <button onClick={() => handleDelete(officer.Username)} className="text-red-600 hover:underline">
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
