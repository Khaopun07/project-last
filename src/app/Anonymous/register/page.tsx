'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// The build error you're seeing is often caused by `export const dynamic = 'force-dynamic';`
// in a page when using static exports (`output: 'export'` in next.config.js).
// This page is a client component that handles its own logic, so it is already dynamic.
// Please ensure this line is removed or commented out from this file.

// It's a good practice to define constants outside the component body
// if they don't depend on props or state.
const faculties = [
  'คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล',
  'คณะวิทยาการสุขภาพและการกีฬา',
  'คณะเทคโนโลยีและการพัฒนาชุมชน',
  'คณะวิศวกรรมศาสตร์',
  'คณะพยาบาลศาสตร์',
  'คณะนิติศาสตร์',
  'คณะอุตสาหกรรมเกษตรและชีวภาพ',
  'คณะศึกษาศาสตร์',
  'คณะสหวิทยาการและการประกอบการ',
  'คณะสหเวชศาสตร์',
  'วิทยาลัยการจัดการเพื่อการพัฒนา',
  'โครงการจัดตั้งคณะแพทยศาสตร์',
];

// Define a type for the form state for better type safety.
type FormData = {
  role: 'officer' | 'teacher';
  username: string;
  fname: string;
  lname: string;
  email: string;
  password: string;
  Off_Position: string;
  phone: string;
  prefix: string;
  Faclty: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    role: 'officer',
    username: '',
    fname: '',
    lname: '',
    email: '',
    password: '',
    Off_Position: '',
    phone: '',
    prefix: '',
    Faclty: '',
  });

  // Use the correct event type for form submissions.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // --- Validation ---
    const validationErrors: string[] = [];
    if (!form.fname.trim()) validationErrors.push('กรุณากรอกชื่อ');
    if (!form.lname.trim()) validationErrors.push('กรุณากรอกนามสกุล');
    if (!form.username.trim()) validationErrors.push('กรุณากรอก Username');
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) validationErrors.push('กรุณากรอก Email ให้ถูกต้อง');
    if (!form.password.trim() || form.password.length < 6) validationErrors.push('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    if (form.role === 'officer' && !form.Off_Position) validationErrors.push('กรุณาเลือกคณะสำหรับเจ้าหน้าที่');
    if (form.role === 'teacher' && !form.Faclty) validationErrors.push('กรุณาเลือกคณะสำหรับอาจารย์');

    if (validationErrors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่สมบูรณ์',
        text: validationErrors.join('\n'),
      });
      return;
    }
    // --- End Validation ---

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        // Use the error message from the API if available
        throw new Error(data.message || 'การลงทะเบียนไม่สำเร็จ');
      }

      await Swal.fire({
        icon: 'success',
        title: 'ลงทะเบียนสำเร็จ!',
        text: data.message || 'คุณสามารถเข้าสู่ระบบได้แล้ว',
        timer: 2000,
        showConfirmButton: false,
      });
      router.push('/Anonymous/login'); // Redirect to login page on success
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล',
      });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-slate-100 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl w-full bg-white p-8 rounded-3xl shadow-xl border border-blue-200 space-y-6"
      >
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-gradient-to-r from-blue-600 via-slate-700 to-gray-700 bg-clip-text">
          ลงทะเบียน
        </h2>

        {/* Role */}
        <div>
          <label className="block font-semibold mb-2 text-black">บทบาท:</label>
          <select
            value={form.role} // The value is already a string, no need to cast
            onChange={(e) => setForm({ ...form, role: e.target.value as FormData['role'] })}
            required
            className="w-full border border-blue-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="officer">เจ้าหน้าที่ (Officer)</option>
            <option value="teacher">ครู (Teacher)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Teacher-specific Prefix field */}
          {form.role === 'teacher' && (
            <div>
              <label className="block font-semibold mb-2 text-black">คำนำหน้า:</label>
              <input
                type="text"
                placeholder="คำนำหน้า"
                value={form.prefix}
                onChange={(e) => setForm({ ...form, prefix: e.target.value })}
                className="w-full border border-blue-300 p-3 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}

          {/* Common Fields */}
          <div>
            <label className="block font-semibold mb-2 text-black">ชื่อ:</label>
            <input
              type="text"
              placeholder="ชื่อ"
              value={form.fname}
              onChange={(e) => setForm({ ...form, fname: e.target.value })}
              required
              className="w-full border border-blue-300 p-3 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-black">นามสกุล:</label>
            <input
              type="text"
              placeholder="นามสกุล"
              value={form.lname}
              onChange={(e) => setForm({ ...form, lname: e.target.value })}
              required
              className="w-full border border-blue-300 p-3 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-black">ชื่อผู้ใช้:</label>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="w-full border border-blue-300 p-3 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-black">อีเมล:</label>
            <input
              type="email"
              placeholder="อีเมล"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full border border-blue-300 p-3 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-black">รหัสผ่าน:</label>
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full border border-blue-300 p-3 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-black">เบอร์โทร:</label>
            <input
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-blue-300 p-3 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Officer Fields */}
        {form.role === 'officer' && (
          <div>
            <label className="block font-semibold mb-2 text-black">คณะ (Position):</label>
            <select
              value={form.Off_Position}
              onChange={(e) => setForm({ ...form, Off_Position: e.target.value })}
              required
              className="w-full border border-blue-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">-- เลือกคณะ --</option>
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Teacher Fields */}
        {form.role === 'teacher' && (
          <div>
            <label className="block font-semibold mb-2 text-black">คณะ:</label>
            <select
              value={form.Faclty}
              onChange={(e) => setForm({ ...form, Faclty: e.target.value })}
              required
              className="w-full border border-blue-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">-- เลือกคณะ --</option>
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Buttons */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 text-white py-3 rounded-2xl shadow-lg font-semibold transition duration-300"
        >
          ลงทะเบียน
        </button>

        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full bg-gray-300 text-black py-3 rounded-2xl hover:bg-gray-400 transition duration-300"
        >
          กลับ
        </button>
      </form>
    </div>
  );
}
