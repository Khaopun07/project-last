'use client';

import { useEffect, useState, useMemo } from 'react';

type School = {
  Sc_id: string;
  Sc_name: string;
  Sc_address: string;
  Sc_district: string;
  Sc_subdistrict: string; // เพิ่มตำบล
  Sc_province: string;
  Sc_postcode: string;
  Sc_phone: string;
  Sc_email: string;
  Sc_website: string;
  Contact_no: string;
  Contact_name: string;
  is_approved: number;
};

const emptySchool: School = {
  Sc_id: '',
  Sc_name: '',
  Sc_address: '',
  Sc_district: '',
  Sc_subdistrict: '', // เพิ่มตำบล
  Sc_province: '',
  Sc_postcode: '',
  Sc_phone: '',
  Sc_email: '',
  Sc_website: '',
  Contact_no: '',
  Contact_name: '',
  is_approved: 1,
};

export default function SchoolPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [form, setForm] = useState<School>(emptySchool);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDetailPopup, setShowDetailPopup] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'province' | 'id'>('name');

  const fetchSchool = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/school');
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setSchools(data);
    } catch (err: any) {
      console.error('Error fetching school:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchool();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    if (!form.Sc_name.trim()) errors.push('กรุณากรอกชื่อโรงเรียน');
    if (form.Sc_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Sc_email)) {
      errors.push('รูปแบบ Email ไม่ถูกต้อง');
    }
    if (form.Sc_phone && !/^[0-9-+() ]+$/.test(form.Sc_phone)) {
      errors.push('รูปแบบเบอร์โทรไม่ถูกต้อง');
    }
    if (form.Contact_no && !/^[0-9-+() ]+$/.test(form.Contact_no)) {
      errors.push('รูปแบบเบอร์ผู้ติดต่อไม่ถูกต้อง');
    }
    if (form.Sc_postcode && !/^[0-9]{5}$/.test(form.Sc_postcode)) {
      errors.push('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError('กรุณาแก้ไขข้อมูลให้ถูกต้อง:\n' + validationErrors.join('\n'));
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/school/${editingId}` : '/api/school';

      let payload;
      if (editingId) {
        payload = form;
      } else {
        const { Sc_id, ...createPayload } = form;
        payload = createPayload;
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

      await fetchSchool();
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Submit error:', error);
      setError(error.message);
    }
  };

  const handleEdit = (school: School) => {
    setForm(school);
    setEditingId(school.Sc_id);
    setSelectedItem(null);
    setShowDetailPopup(false);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ยืนยันการลบโรงเรียน "${name}"?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`)) return;

    try {
      const res = await fetch(`/api/school/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}: การลบไม่สำเร็จ`);
      }

      await fetchSchool();
      setShowDetailPopup(false);
      setError(null);
    } catch (error: any) {
      console.error('Delete error:', error);
      setError(error.message);
    }
  };

  const resetForm = () => {
    setForm(emptySchool);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const openDetailPopup = (school: School) => {
    setSelectedItem(school);
    setShowDetailPopup(true);
  };

  const closeDetailPopup = () => {
    setShowDetailPopup(false);
    setSelectedItem(null);
  };

  // Get unique provinces for filter
  const uniqueProvinces = useMemo(() => {
    const provinces = schools.map(school => school.Sc_province).filter(Boolean);
    return [...new Set(provinces)].sort();
  }, [schools]);

  // Filtered and sorted data
  const filteredAndSortedSchools = useMemo(() => {
    let filtered = schools.filter(school => {
      const matchesSearch = !searchTerm ||
        school.Sc_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.Sc_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.Sc_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.Sc_phone.includes(searchTerm) ||
        school.Contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.Sc_district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.Sc_subdistrict.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProvince = !provinceFilter || school.Sc_province === provinceFilter;

      return matchesSearch && matchesProvince;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.Sc_name.localeCompare(b.Sc_name);
        case 'province':
          return (a.Sc_province || '').localeCompare(b.Sc_province || '');
        case 'id':
          return a.Sc_id.localeCompare(b.Sc_id);
        default:
          return 0;
      }
    });
  }, [schools, searchTerm, provinceFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-gradient-to-r from-blue-500 to-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                🏫 จัดการข้อมูลโรงเรียน
              </h1>
              <p className="text-blue-600">สร้างและจัดการข้อมูลโรงเรียนในระบบ</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{schools.length}</div>
              <div className="text-sm text-blue-500">โรงเรียนทั้งหมด</div>
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
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${showForm
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
                }`}
            >
              {showForm ? '❌ ปิดฟอร์ม' : '➕ เพิ่มโรงเรียนใหม่'}
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
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">จังหวัดทั้งหมด</option>
                {uniqueProvinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'province' | 'id')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">เรียงตามชื่อ</option>
                <option value="province">เรียงตามจังหวัด</option>
                <option value="id">เรียงตามรหัส</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg mb-6 border-l-4 border-blue-400">
            <h2 className="text-xl font-semibold text-blue-800 mb-6">
              {editingId ? '✏️ แก้ไขข้อมูลโรงเรียน' : '➕ เพิ่มโรงเรียนใหม่'}
            </h2>

            <div className="space-y-6" >
              {/* Basic Information */}
              <div>
                <h3 className="text-md font-semibold text-blue-700 mb-3 border-b pb-2">📋 ข้อมูลพื้นฐาน</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {editingId && (
                    <div>
                      <label className="block text-blue-700 font-medium mb-2">รหัสโรงเรียน</label>
                      <input
                        name="Sc_id"
                        placeholder="รหัสโรงเรียน"
                        value={form.Sc_id}
                        readOnly
                        className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-blue-700 font-medium mb-2">ชื่อโรงเรียน *</label>
                    <input
                      name="Sc_name"
                      placeholder="ชื่อโรงเรียน"
                      value={form.Sc_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-700 font-medium mb-2">ที่อยู่</label>
                    <input
                      name="Sc_address"
                      placeholder="ที่อยู่"
                      value={form.Sc_address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-md font-semibold text-blue-700 mb-3 border-b pb-2">📍 ข้อมูลที่อยู่</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-blue-700 font-medium mb-2">ตำบล</label>
                    <input
                      name="Sc_subdistrict"
                      placeholder="ตำบล"
                      value={form.Sc_subdistrict ?? ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-blue-700 font-medium mb-2">อำเภอ</label>
                    <input
                      name="Sc_district"
                      placeholder="อำเภอ"
                      value={form.Sc_district ?? ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-blue-700 font-medium mb-2">จังหวัด</label>
                    <input
                      name="Sc_province"
                      placeholder="จังหวัด"
                      value={form.Sc_province}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-700 font-medium mb-2">รหัสไปรษณีย์</label>
                    <input
                      name="Sc_postcode"
                      placeholder="รหัสไปรษณีย์ 5 หลัก"
                      value={form.Sc_postcode ?? ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-md font-semibold text-blue-700 mb-3 border-b pb-2">📞 ข้อมูลการติดต่อ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-blue-700 font-medium mb-2">เบอร์โทรศัพท์</label>
                    <input
                      name="Sc_phone"
                      placeholder="0xx-xxx-xxxx"
                      value={form.Sc_phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-700 font-medium mb-2">อีเมล</label>
                    <input
                      name="Sc_email"
                      placeholder="school@example.com"
                      type="email"
                      value={form.Sc_email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-700 font-medium mb-2">เว็บไซต์</label>
                    <input
                      name="Sc_website"
                      placeholder="https://school.ac.th"
                      value={form.Sc_website}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-700 font-medium mb-2">ชื่อผู้ติดต่อ</label>
                    <input
                      name="Contact_name"
                      placeholder="ชื่อผู้ติดต่อ"
                      value={form.Contact_name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-700 font-medium mb-2">เบอร์ผู้ติดต่อ</label>
                    <input
                      name="Contact_no"
                      placeholder="0xx-xxx-xxxx"
                      value={form.Contact_no}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {editingId ? '💾 อัปเดต' : '➕ เพิ่มโรงเรียน'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    ❌ ยกเลิก
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg shadow-md">
            <div className="flex items-center">
              <div className="text-red-500 text-xl mr-3">❌</div>
              <div>
                <p className="text-red-700 font-medium">เกิดข้อผิดพลาด</p>
                <pre className="text-red-600 text-sm whitespace-pre-wrap">{error}</pre>
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
                  🏫 รายการโรงเรียน
                </h3>
                <div className="text-white text-sm">
                  แสดง {filteredAndSortedSchools.length} จาก {schools.length} รายการ
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">ชื่อโรงเรียน</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">ตำบล</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">อำเภอ</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">จังหวัด</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">เบอร์โทร</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-semibold">ผู้ติดต่อ</th>
                    <th className="py-3 px-4 text-center text-blue-800 font-semibold">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedSchools.map((school, index) => (
                    <tr
                      key={school.Sc_id}
                      className={`border-b hover:bg-blue-25 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-blue-25'
                        }`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {school.Sc_name}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {school.Sc_subdistrict || <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {school.Sc_district || <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="py-3 px-4">
                        {school.Sc_province ? (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium border border-indigo-200">
                            {school.Sc_province}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-blue-700">
                        {school.Sc_phone || <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {school.Contact_name || <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => openDetailPopup(school)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          👁️ รายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedSchools.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">🏫</div>
                        <p>ไม่พบข้อมูลโรงเรียน</p>
                        {(searchTerm || provinceFilter) && (
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setProvinceFilter('');
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

        {/* Detail Popup Modal */}
        {showDetailPopup && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-500 text-white p-4 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">🏫 รายละเอียดโรงเรียน</h2>
                  <button
                    onClick={closeDetailPopup}
                    className="text-white hover:bg-blue-600 rounded-full p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Basic Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📋 ข้อมูลพื้นฐาน</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <label className="text-blue-700 font-medium text-sm">รหัสโรงเรียน</label>
                      <p className="text-gray-800 font-medium text-lg">{selectedItem.Sc_id}</p>
                    </div>

                    <div className="bg-green-50 p-3 rounded md:col-span-2">
                      <label className="text-green-700 font-medium text-sm">ชื่อโรงเรียน</label>
                      <p className="text-gray-800 font-medium text-lg">{selectedItem.Sc_name}</p>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded md:col-span-3">
                      <label className="text-yellow-700 font-medium text-sm">ที่อยู่</label>
                      <p className="text-gray-800 font-medium">{selectedItem.Sc_address || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📍 ข้อมูลที่อยู่</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-purple-50 p-3 rounded">
                      <label className="text-purple-700 font-medium text-sm">ตำบล</label>
                      <p className="text-gray-800 font-medium">{selectedItem.Sc_subdistrict || '-'}</p>
                    </div>

                    <div className="bg-indigo-50 p-3 rounded">
                      <label className="text-indigo-700 font-medium text-sm">อำเภอ</label>
                      <p className="text-gray-800 font-medium">{selectedItem.Sc_district || '-'}</p>
                    </div>

                    <div className="bg-teal-50 p-3 rounded">
                      <label className="text-teal-700 font-medium text-sm">จังหวัด</label>
                      <p className="text-gray-800 font-medium">{selectedItem.Sc_province || '-'}</p>
                    </div>

                    <div className="bg-orange-50 p-3 rounded">
                      <label className="text-orange-700 font-medium text-sm">รหัสไปรษณีย์</label>
                      <p className="text-gray-800 font-medium">{selectedItem.Sc_postcode || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">📞 ข้อมูลการติดต่อ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-red-50 p-3 rounded">
                      <label className="text-red-700 font-medium text-sm">เบอร์โทรศัพท์โรงเรียน</label>
                      <p className="text-gray-800 font-medium">📞 {selectedItem.Sc_phone || '-'}</p>
                    </div>

                    <div className="bg-pink-50 p-3 rounded">
                      <label className="text-pink-700 font-medium text-sm">อีเมล</label>
                      <p className="text-gray-800 font-medium break-all">📧 {selectedItem.Sc_email || '-'}</p>
                    </div>

                    <div className="bg-cyan-50 p-3 rounded">
                      <label className="text-cyan-700 font-medium text-sm">เว็บไซต์</label>
                      <p className="text-gray-800 font-medium break-all">🌐 {selectedItem.Sc_website || '-'}</p>
                    </div>

                    <div className="bg-lime-50 p-3 rounded">
                      <label className="text-lime-700 font-medium text-sm">ชื่อผู้ติดต่อ</label>
                      <p className="text-gray-800 font-medium">👤 {selectedItem.Contact_name || '-'}</p>
                    </div>

                    <div className="bg-amber-50 p-3 rounded">
                      <label className="text-amber-700 font-medium text-sm">เบอร์ผู้ติดต่อ</label>
                      <p className="text-gray-800 font-medium">📱 {selectedItem.Contact_no || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    onClick={() => handleEdit(selectedItem)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(selectedItem.Sc_id, selectedItem.Sc_name)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    🗑️ ลบ
                  </button>
                  <button
                    onClick={closeDetailPopup}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    ❌ ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}