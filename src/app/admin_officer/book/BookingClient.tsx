'use client';
import { useEffect, useState } from 'react';

type Booking = {
  Book_ID: string;
  GuidanceID: string;
  Username: string;
  T_PickupPoint: string;
  T_Phone: string;
  Std_ID1: string;
  Std_name1: string;
  Std_ID2: string;
  Std_name2: string;
};

const emptyBooking: Omit<Booking, 'Book_ID'> = {
  GuidanceID: '',
  Username: '',
  T_PickupPoint: '',
  T_Phone: '',
  Std_ID1: '',
  Std_name1: '',
  Std_ID2: '',
  Std_name2: '',
};

export default function BookingClient() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guidances, setGuidances] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [form, setForm] = useState<Omit<Booking, 'Book_ID'>>(emptyBooking);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    fetchBookings();
    fetchGuidances();
    fetchTeachers();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/book');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuidances = async () => {
    try {
      const res = await fetch('/api/auth/guidance');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setGuidances(data);
    } catch (error: any) {
      console.error('Error fetching guidances:', error.message || error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teacher');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTeachers(data);
    } catch (error: any) {
      console.error('Error fetching teachers:', error.message || error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/auth/book/${editingId}` : '/api/auth/book';
      const payload = editingId ? { ...form, Book_ID: editingId } : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      await fetchBookings();
      setForm(emptyBooking);
      setEditingId(null);
      setShowForm(false);
    } catch (error: any) {
      alert(error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    }
  };

  const handleEdit = (booking: Booking) => {
    const { Book_ID, ...rest } = booking;
    setForm(rest);
    setEditingId(Book_ID);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`ยืนยันการลบข้อมูลรหัส ${id}?`)) return;
    try {
      const res = await fetch(`/api/auth/book/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      await fetchBookings();
    } catch (error: any) {
      alert(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const getTeacherName = (username: string) => {
    const teacher = teachers.find((t) => t.Username === username);
    return teacher ? `${teacher.F_name} ${teacher.L_name}` : username;
  };

  return (
    <>
      <button
        onClick={() => {
          setShowForm(!showForm);
          setForm(emptyBooking);
          setEditingId(null);
        }}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {showForm ? '❌ ปิดฟอร์ม' : '➕ เปิดฟอร์ม'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 border rounded-xl shadow mb-6 space-y-4">
          {/* ...ฟอร์มเหมือนเดิม */}
        </form>
      )}

      {error && <div className="text-red-500 mb-4">❌ {error}</div>}

      {loading ? (
        <p>⏳ กำลังโหลดข้อมูล...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500">ไม่พบข้อมูลการจอง</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white shadow-md rounded-xl text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th>ID</th>
                <th>ครูแนะแนว</th>
                <th>ครูพี่เลี้ยง</th>
                <th>จุดรับส่ง</th>
                <th>เบอร์โทร</th>
                <th>นศ.1</th>
                <th>ชื่อ นศ.1</th>
                <th>นศ.2</th>
                <th>ชื่อ นศ.2</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.Book_ID} className="border-t hover:bg-gray-50">
                  <td>{b.Book_ID}</td>
                  <td>{b.GuidanceID}</td>
                  <td>{getTeacherName(b.Username)}</td>
                  <td>{b.T_PickupPoint}</td>
                  <td>{b.T_Phone}</td>
                  <td>{b.Std_ID1}</td>
                  <td>{b.Std_name1}</td>
                  <td>{b.Std_ID2}</td>
                  <td>{b.Std_name2}</td>
                  <td className="text-center">
                    <button onClick={() => handleEdit(b)} className="text-blue-600 hover:underline mr-2">แก้ไข</button>
                    <button onClick={() => handleDelete(b.Book_ID)} className="text-red-600 hover:underline">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
