'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

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

const formFields = [
  { label: 'First Name', key: 'fname', type: 'text' },
  { label: 'Last Name', key: 'lname', type: 'text' },
  { label: 'Username', key: 'username', type: 'text' },
  { label: 'Email', key: 'email', type: 'email' },
  { label: 'Password', key: 'password', type: 'password' },
] as const;

// Define a type for the form state for better type safety.
type FormData = {
  role: 'officer' | 'teacher';
  username: string;
  fname: string;
  lname: string;
  email: string;
  password: string;
  position: string;
  phone: string;
  prefix: string;
  faculty: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    role: 'officer',
    username: '',
    fname: '',
    lname: '',
    email: '',
    password: '',
    position: '',
    phone: '',
    prefix: '',
    faculty: '',
  });

  // Use the correct event type for form submissions.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Reset error on new submission

    // --- Validation ---
    const validationErrors: string[] = [];
    if (!form.fname.trim()) validationErrors.push('กรุณากรอกชื่อ');
    if (!form.lname.trim()) validationErrors.push('กรุณากรอกนามสกุล');
    if (!form.username.trim()) validationErrors.push('กรุณากรอก Username');
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) validationErrors.push('กรุณากรอก Email ให้ถูกต้อง');
    if (!form.password.trim() || form.password.length < 6) validationErrors.push('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    if (form.role === 'officer' && !form.position) validationErrors.push('กรุณาเลือกคณะสำหรับเจ้าหน้าที่');
    if (form.role === 'teacher' && !form.faculty) validationErrors.push('กรุณาเลือกคณะสำหรับอาจารย์');

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
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

      alert(data.message || 'ลงทะเบียนสำเร็จ!');
      router.push('/'); // Redirect to home/login page on success
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
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

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">เกิดข้อผิดพลาด!</strong>
            <pre className="block sm:inline whitespace-pre-wrap">{error}</pre>
          </div>
        )}

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

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {formFields.map((field) => (
            <div key={field.key}>
              <label className="block font-semibold mb-2 text-black">{field.label}:</label>
              <input
                type={field.type}
                placeholder={field.label}
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                required
                className="w-full border border-blue-300 p-3 rounded-xl text-black placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          ))}
        </div>

        {/* Officer Fields */}
        {form.role === 'officer' && (
          <>
            <div>
              <label className="block font-semibold mb-2 text-black">คณะ (Position):</label>
              <select
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                required
                className="w-full border border-blue-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">-- เลือกคณะ --</option>
                {faculties.map((f) => ( // Changed variable name to avoid shadowing
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
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
          </>
        )}

        {/* Teacher Fields */}
        {form.role === 'teacher' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-semibold mb-2 text-black">คำนำหน้า:</label>
                <input
                  type="text"
                  placeholder="Prefix"
                  value={form.prefix}
                  onChange={(e) => setForm({ ...form, prefix: e.target.value })}
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

            <div>
              <label className="block font-semibold mb-2 text-black">คณะ:</label>
              <select
                value={form.faculty}
                onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                required
                className="w-full border border-blue-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">-- เลือกคณะ --</option>
                {faculties.map((f) => ( // Changed variable name to avoid shadowing
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </>
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
