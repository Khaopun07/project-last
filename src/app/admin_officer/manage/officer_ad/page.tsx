'use client';

import { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import bcrypt from 'bcryptjs';

// Define the type for an Officer for better type safety and autocompletion.
type Officer = {
  Username: string;
  Off_Fname: string;
  Off_Lname: string;
  Off_Position: string;
  Off_Email: string;
  Off_Phone: string;
  Off_Password?: string; // Password should be optional, especially for display
};

// Initial state for the form
const emptyOfficer: Officer = {
  Username: '',
  Off_Fname: '',
  Off_Lname: '',
  Off_Position: '',
  Off_Email: '',
  Off_Phone: '',
  Off_Password: '',
};

export default function OfficerAdminPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [form, setForm] = useState<Officer>(emptyOfficer);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'position' | 'username'>('name');

  // Fetch officers data
  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/officer');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setOfficers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching officer:', err);
      Swal.fire('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถโหลดข้อมูลเจ้าหน้าที่ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyOfficer);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    // Basic validation
    const validationErrors: string[] = [];
    if (!form.Username.trim()) validationErrors.push('กรุณากรอก Username');
    if (!editingId && !form.Off_Password?.trim()) validationErrors.push('กรุณากรอก Password');
    if (!form.Off_Fname.trim()) validationErrors.push('กรุณากรอกชื่อ');
    if (!form.Off_Lname.trim()) validationErrors.push('กรุณากรอกนามสกุล');
    if (form.Off_Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Off_Email)) validationErrors.push('รูปแบบ Email ไม่ถูกต้อง');
    if (form.Off_Phone && !/^[0-9-+() ]+$/.test(form.Off_Phone)) validationErrors.push('รูปแบบเบอร์โทรไม่ถูกต้อง');

    if (validationErrors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ถูกต้อง',
        html: validationErrors.join('<br />'),
      });
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/officer/${editingId}` : '/api/officer';

      const payload = { ...form };

      if (payload.Off_Password && payload.Off_Password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        payload.Off_Password = await bcrypt.hash(payload.Off_Password, salt);
      } else {
        if (editingId) {
          delete (payload as Partial<Officer>).Off_Password;
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

      await fetchOfficers();
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: editingId ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error('Submit error:', err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.message,
      });
    }
  };

  const handleDelete = async (username: string) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณต้องการลบเจ้าหน้าที่ "${username}"? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/officer/${username}`, { method: 'DELETE' });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${res.status}: การลบไม่สำเร็จ`);
          }
          await fetchOfficers();
          Swal.fire('ลบแล้ว!', `เจ้าหน้าที่ "${username}" ถูกลบเรียบร้อยแล้ว`, 'success');
        } catch (error: any) {
          console.error('Delete error:', error);
          Swal.fire('เกิดข้อผิดพลาด!', error.message, 'error');
        }
      }
    });
  };

  const uniquePositions = useMemo(() => {
    return [...new Set(officers.map(o => o.Off_Position).filter(Boolean))].sort();
  }, [officers]);

  const filteredAndSortedOfficers = useMemo(() => {
    let filtered = officers
      .filter(officer => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
          officer.Username.toLowerCase().includes(searchTermLower) ||
          officer.Off_Fname.toLowerCase().includes(searchTermLower) ||
          officer.Off_Lname.toLowerCase().includes(searchTermLower) ||
          officer.Off_Email.toLowerCase().includes(searchTermLower) ||
          officer.Off_Phone.includes(searchTerm);
        
        const matchesPosition = !positionFilter || officer.Off_Position === positionFilter;

        return matchesSearch && matchesPosition;
      })
    
    return filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return `${a.Off_Fname} ${a.Off_Lname}`.localeCompare(`${b.Off_Fname} ${b.Off_Lname}`);
          case 'position':
            return (a.Off_Position || '').localeCompare(b.Off_Position || '');
          case 'username':
            return a.Username.localeCompare(b.Username);
          default:
            return 0;
        }
      });
  }, [officers, searchTerm, positionFilter, sortBy]);

  const handleEdit = (officer: Officer) => {
    setForm({ ...officer, Off_Password: '' }); // Don't show password when editing
    setEditingId(officer.Username);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="p-4 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-gradient-to-r from-blue-500 to-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">👤 จัดการข้อมูลเจ้าหน้าที่</h1>
              <p className="text-blue-600">สร้างและจัดการข้อมูลเจ้าหน้าที่ในระบบ</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{officers.length}</div>
              <div className="text-sm text-blue-500">เจ้าหน้าที่ทั้งหมด</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${showForm ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'}`}>
              {showForm ? '❌ ปิดฟอร์ม' : '➕ เพิ่มเจ้าหน้าที่ใหม่'}
            </button>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative"><input type="text" placeholder="🔍 ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
              <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">ตำแหน่งทั้งหมด</option>
                {uniquePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="name">เรียงตามชื่อ</option>
                <option value="position">เรียงตามตำแหน่ง</option>
                <option value="username">เรียงตาม Username</option>
              </select>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border-l-4 border-blue-400">
            <h2 className="text-xl font-semibold text-blue-800 mb-6">{editingId ? '✏️ แก้ไขข้อมูลเจ้าหน้าที่' : '➕ เพิ่มเจ้าหน้าที่ใหม่'}</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label className="block text-blue-700 font-medium mb-2">Username *</label><input name="Username" placeholder="Username" value={form.Username} onChange={handleChange} disabled={!!editingId} className={`w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${editingId ? 'bg-gray-100 cursor-not-allowed' : ''}`} />{editingId && <p className="text-xs text-gray-500 mt-1">Username ไม่สามารถแก้ไขได้</p>}</div>
                <div><label className="block text-blue-700 font-medium mb-2">Password {!editingId && '*'}</label><input name="Off_Password" type="password" placeholder={editingId ? 'เว้นว่างหากไม่ต้องการเปลี่ยน' : 'Password'} value={form.Off_Password} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" /></div>
                <div><label className="block text-blue-700 font-medium mb-2">ชื่อ *</label><input name="Off_Fname" placeholder="ชื่อ" value={form.Off_Fname} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" /></div>
                <div><label className="block text-blue-700 font-medium mb-2">นามสกุล *</label><input name="Off_Lname" placeholder="นามสกุล" value={form.Off_Lname} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" /></div>
                <div><label className="block text-blue-700 font-medium mb-2">ตำแหน่ง</label><input name="Off_Position" placeholder="ตำแหน่ง" value={form.Off_Position} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" /></div>
                <div><label className="block text-blue-700 font-medium mb-2">Email</label><input name="Off_Email" placeholder="example@email.com" type="email" value={form.Off_Email} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" /></div>
                <div><label className="block text-blue-700 font-medium mb-2">เบอร์โทร</label><input name="Off_Phone" placeholder="0xx-xxx-xxxx" value={form.Off_Phone} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" /></div>
              </div>
              <div className="flex gap-3 pt-3">
                <button onClick={handleSubmit} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">{editingId ? '💾 อัปเดต' : '➕ เพิ่มเจ้าหน้าที่'}</button>
                {editingId && <button onClick={resetForm} className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">❌ ยกเลิก</button>}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white p-12 rounded-xl shadow-lg text-center">
            <div className="animate-spin text-6xl mb-4">⏳</div>
            <p className="text-blue-600 text-lg">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold text-lg">👥 รายการเจ้าหน้าที่</h3>
                <div className="text-white text-sm">แสดง {filteredAndSortedOfficers.length} จาก {officers.length} รายการ</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">Username</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">ชื่อ-นามสกุล</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">ตำแหน่ง</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">Email</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">เบอร์โทร</th>
                    <th className="py-3 px-4 text-center text-blue-800 font-semibold">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedOfficers.map((officer, index) => (
                    <tr key={officer.Username} className={`border-b hover:bg-blue-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-blue-25'}`}>
                      <td className="py-3 px-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-mono font-semibold">{officer.Username}</span></td>
                      <td className="py-3 px-4 font-medium text-gray-800">{officer.Off_Fname} {officer.Off_Lname}</td>
                      <td className="py-3 px-4">{officer.Off_Position ? <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium border border-indigo-200">{officer.Off_Position}</span> : <span className="text-gray-400 text-xs">-</span>}</td>
                      <td className="py-3 px-4 text-blue-700">{officer.Off_Email || <span className="text-gray-400 text-xs">-</span>}</td>
                      <td className="py-3 px-4 text-gray-700">{officer.Off_Phone || <span className="text-gray-400 text-xs">-</span>}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => handleEdit(officer)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105" aria-label={`แก้ไข ${officer.Username}`}>✏️ แก้ไข</button>
                          <button onClick={() => handleDelete(officer.Username)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105" aria-label={`ลบ ${officer.Username}`}>🗑️ ลบ</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedOfficers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">👤</div>
                        <p>ไม่พบข้อมูลเจ้าหน้าที่</p>
                        {(searchTerm || positionFilter) && <button onClick={() => { setSearchTerm(''); setPositionFilter(''); }} className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline">ล้างตัวกรอง</button>}
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