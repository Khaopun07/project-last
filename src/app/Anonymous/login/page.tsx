'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock } from 'react-icons/fi';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        });
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.role) localStorage.setItem('role', data.role);
        if (data.user) {
          try {
            localStorage.setItem('user', JSON.stringify(data.user));
          } catch (error) {
            console.error('Error saving user to localStorage:', error);
          }
        } else {
          localStorage.removeItem('user');
        }

        window.dispatchEvent(new Event('authChanged'));

        console.log('Login successful:', { email: form.email, role: data.role, token: data.token, data });

        const role = data.role?.toLowerCase();
        let welcomeText;

        if (role === 'officer') {
          welcomeText = `ยินดีต้อนรับคุณ ${data.user?.Off_Fname || data.user?.Username}`;
        } else {
          welcomeText = `ยินดีต้อนรับคุณ ${data.user?.F_name || data.user?.Username || data.role}`;
        }

        await Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
          text: welcomeText,
          timer: 1500,
          showConfirmButton: false,
        });

        if (role === 'officer') router.push('/admin_officer/welcome');
        else if (role === 'teacher') router.push('/user_teacher/welcome');
        else router.push('/Anonymous/register');

      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่ได้รับข้อมูลยืนยันตัวตนจากเซิร์ฟเวอร์',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
        text: 'กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/Anonymous/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-slate-100 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-md border border-blue-200">
        <h1 className="text-4xl font-extrabold text-center text-transparent bg-gradient-to-r from-blue-600 via-slate-700 to-gray-700 bg-clip-text mb-8">
          เข้าสู่ระบบ
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              className="w-full border border-blue-300 rounded-xl py-3 pl-12 pr-4 text-gray-700 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="w-full border border-blue-300 rounded-xl py-3 pl-12 pr-4 text-gray-700 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 text-white py-3 rounded-xl shadow-lg font-semibold transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleRegister}
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            สมัครสมาชิก
          </button>
        </div>
      </div>
    </div>
  );
}
