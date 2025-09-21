'use client';
import { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';

type Teacher = {
  Username: string;
  Prefix: string;
  F_name: string;
  L_name: string;
  Faclty: string;
  Phone: string;
  Email: string;
  Password: string;
};

const emptyTeacher: Teacher = {
  Username: '',
  Prefix: '',
  F_name: '',
  L_name: '',
  Faclty: '',
  Phone: '',
  Email: '',
  Password: '',
};

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
  'โครงการจัดตั้งคณะแพทยศาสตร์'
];

export default function TeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<Teacher>(emptyTeacher);
  const [editingUsername, setEditingUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'position' | 'username'>('name');

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setTeachers(data);
    } catch (err: any) {
      console.error('Error fetching teacher:', err);
      Swal.fire('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถโหลดข้อมูลอาจารย์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!form.Username.trim()) errors.push('กรุณากรอก Username');
    if (!editingUsername && !form.Password.trim()) errors.push('กรุณากรอก Password');
    if (!form.F_name.trim()) errors.push('กรุณากรอกชื่อ');
    if (!form.L_name.trim()) errors.push('กรุณากรอกนามสกุล');
    if (form.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email)) {
      errors.push('รูปแบบ Email ไม่ถูกต้อง');
    }
    if (form.Phone && !/^[0-9-+() ]+$/.test(form.Phone)) {
      errors.push('รูปแบบเบอร์โทรไม่ถูกต้อง');
    }
    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ถูกต้อง',
        html: validationErrors.join('<br />'),
      });
      return;
    }

    try {
      const method = editingUsername ? 'PUT' : 'POST';
      const url = editingUsername
        ? `/api/teacher/${editingUsername}`
        : '/api/teacher';

      // สร้างสำเนาของข้อมูลฟอร์มเพื่อป้องกันการแก้ไข state โดยตรง
      const payload = { ...form };

      // ตรวจสอบว่ามีการกรอกรหัสผ่านใหม่หรือไม่
      if (payload.Password && payload.Password.trim() !== '') {
        // เข้ารหัสรหัสผ่านใหม่
        const salt = await bcrypt.genSalt(10);
        payload.Password = await bcrypt.hash(payload.Password, salt);
      } else {
        // ถ้ากำลังแก้ไขและไม่ได้กรอกรหัสผ่านใหม่ ให้ลบฟิลด์รหัสผ่านออกจากข้อมูลที่จะส่ง
        // เพื่อป้องกันการเขียนทับรหัสผ่านเดิมด้วยค่าว่าง
        if (editingUsername) {
          delete (payload as Partial<Teacher>).Password;
        }
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}: การบันทึกไม่สำเร็จ`);
      }

      await fetchTeachers();
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: editingUsername ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('Submit error:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message,
      });
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setForm({ ...teacher, Password: '' }); // Don't show password when editing
    setEditingUsername(teacher.Username);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (username: string) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณต้องการลบอาจารย์ "${username}"? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/teacher/${username}`, { method: 'DELETE' });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${res.status}: การลบไม่สำเร็จ`);
          }
          await fetchTeachers();
          Swal.fire(
            'ลบแล้ว!',
            `อาจารย์ "${username}" ถูกลบเรียบร้อยแล้ว`,
            'success'
          );
        } catch (error: any) {
          console.error('Delete error:', error);
          Swal.fire({
            icon: 'error',
            title: 'ไม่สามารถลบข้อมูลได้',
            text: error.message,
            footer: 'อาจเป็นเพราะอาจารย์ท่านนี้ยังมีข้อมูลอยู่ที่ระบบการจอง'
          });
        }
      }
    });
  };

  const resetForm = () => {
    setForm(emptyTeacher);
    setEditingUsername(null);
    setShowForm(false);
  };

  // Get unique positions for filter (using Prefix)
  const uniquePositions = useMemo(() => {
    const positions = teachers.map(teacher => teacher.Prefix).filter(Boolean);
    return [...new Set(positions)].sort();
  }, [teachers]);

  // Filtered and sorted data
  const filteredAndSortedTeachers = useMemo(() => {
    let filtered = teachers.filter(teacher => {
      const matchesSearch = !searchTerm || 
        teacher.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.F_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.L_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.Phone.includes(searchTerm);
      
      const matchesPosition = !positionFilter || teacher.Prefix === positionFilter;
      
      return matchesSearch && matchesPosition;
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.F_name} ${a.L_name}`.localeCompare(`${b.F_name} ${b.L_name}`);
        case 'position':
          return (a.Prefix || '').localeCompare(b.Prefix || '');
        case 'username':
          return a.Username.localeCompare(b.Username);
        default:
          return 0;
      }
    });
  }, [teachers, searchTerm, positionFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-gradient-to-r from-blue-500 to-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                📋 จัดการข้อมูลอาจารย์
              </h1>
              <p className="text-blue-600">สร้างและจัดการข้อมูลอาจารย์ในระบบ</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{teachers.length}</div>
              <div className="text-sm text-blue-500">อาจารย์ทั้งหมด</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                showForm
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
              }`}
            >
              {showForm ? '❌ ปิดฟอร์ม' : '➕ เพิ่มอาจารย์ใหม่'}
            </button>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 ค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">คำนำหน้าทั้งหมด</option>
                {uniquePositions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'position' | 'username')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">เรียงตามชื่อ</option>
                <option value="position">เรียงตามคำนำหน้า</option>
                <option value="username">เรียงตาม Username</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border-l-4 border-blue-400">
            <h2 className="text-xl font-semibold text-blue-800 mb-6">
              {editingUsername ? '✏️ แก้ไขข้อมูลอาจารย์' : '➕ เพิ่มอาจารย์ใหม่'}
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-blue-700 font-medium mb-2">Username *</label>
                  <input
                    name="Username"
                    placeholder="Username"
                    value={form.Username}
                    onChange={handleChange}
                    disabled={!!editingUsername}
                    className={`w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${
                      editingUsername ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                  {editingUsername && (
                    <p className="text-xs text-gray-500 mt-1">Username ไม่สามารถแก้ไขได้</p>
                  )}
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-2">
                    Password {!editingUsername && '*'}
                  </label>
                  <input
                    name="Password"
                    type="password"
                    placeholder={editingUsername ? "เว้นว่างหากไม่ต้องการเปลี่ยน" : "Password"}
                    value={form.Password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-2">คำนำหน้า</label>
                  <input
                    name="Prefix"
                    placeholder="คำนำหน้า (เช่น ดร., ผศ.)"
                    value={form.Prefix}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-2">ชื่อ *</label>
                  <input
                    name="F_name"
                    placeholder="ชื่อ"
                    value={form.F_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-2">นามสกุล *</label>
                  <input
                    name="L_name"
                    placeholder="นามสกุล"
                    value={form.L_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-2">คณะ</label>
                  <select
                    name="Faclty"
                    value={form.Faclty}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">-- เลือกคณะ --</option>
                    {faculties.map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-2">Email</label>
                  <input
                    name="Email"
                    placeholder="example@email.com"
                    type="email"
                    value={form.Email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-2">เบอร์โทร</label>
                  <input
                    name="Phone"
                    placeholder="0xx-xxx-xxxx"
                    value={form.Phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {editingUsername ? '💾 อัปเดต' : '➕ เพิ่มอาจารย์'}
                </button>
                {editingUsername && (
                  <button
                    onClick={resetForm}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    ❌ ยกเลิก
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white p-12 rounded-xl shadow-lg text-center">
            <div className="animate-spin text-6xl mb-4">⏳</div>
            <p className="text-blue-600 text-lg">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold text-lg">
                  📋 รายการอาจารย์
                </h3>
                <div className="text-white text-sm">
                  แสดง {filteredAndSortedTeachers.length} จาก {teachers.length} รายการ
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">Username</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">คำนำหน้า</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">ชื่อ-นามสกุล</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">คณะ</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">Email</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">เบอร์โทร</th>
                    <th className="py-3 px-4 text-center text-blue-800 font-semibold">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedTeachers.map((teacher, index) => (
                    <tr
                      key={teacher.Username}
                      className={`border-b hover:bg-blue-25 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-blue-25'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-mono font-semibold">
                          {teacher.Username}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {teacher.Prefix ? (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium border border-indigo-200">
                            {teacher.Prefix}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {teacher.F_name} {teacher.L_name}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {teacher.Faclty || <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="py-3 px-4 text-blue-700">
                        {teacher.Email || <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {teacher.Phone || <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105"
                            aria-label={`แก้ไข ${teacher.Username}`}
                          >
                            ✏️ แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.Username)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105"
                            aria-label={`ลบ ${teacher.Username}`}
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedTeachers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">📋</div>
                        <p>ไม่พบข้อมูลอาจารย์</p>
                        {(searchTerm || positionFilter) && (
                          <button 
                            onClick={() => {
                              setSearchTerm('');
                              setPositionFilter('');
                            }}
                            className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
                          >
                            ล้างตัวกรอง
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}