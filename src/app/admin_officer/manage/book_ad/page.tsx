'use client';
import { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';

type Guidance = {
  GuidanceID: string;
  Sc_name: string;
  study_plan: string;
  guidance_date?: string;
  car_type?: string;
  car_registration?: string;
  number_seats?: number;
  car_phone?: string;
};

type Teacher = {
  Username: string;
  TeacherID: string;
  Prefix: string;
  F_name: string;
  L_name: string;
  Phone: string;
};

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
  Sc_name?: string;
  guidance_date?: string;
  TeacherID?: string;
  Prefix?: string;
  F_name?: string;
  L_name?: string;
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

// จุดรับส่งที่กำหนด
const pickupPoints = [
  'หน้าคณะวิทยาศาสตร์',
  'หน้าหอพักอาจารย์',
  'หน้ามหาวิทยาลัยทักษิณ'
];

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guidances, setGuidances] = useState<Guidance[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<any[]>([]); // This is not used in JSX, so any[] is fine for now.
  const [form, setForm] = useState<Omit<Booking, 'Book_ID'>>(emptyBooking);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [pickupPointFilter, setPickupPointFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'teacher' | 'school'>('date');


  useEffect(() => {
    fetchBookings();
    fetchGuidances();
    fetchTeachers();
    fetchSchools();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/book');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // Handle both { data: [...] } and [...] response structures
      const bookingData = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setBookings(bookingData);
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
      setBookings([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  const fetchGuidances = async () => {
    try {
      const res = await fetch('/api/auth/guidance');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const guidanceData = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setGuidances(guidanceData);
    } catch (error: any) {
      console.error('Error fetching guidances:', error.message || error);
      setGuidances([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teacher');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // Handle both { data: [...] } and [...] response structures
      const teacherData = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      setTeachers(teacherData);
    } catch (error: any) {
      console.error('Error fetching teachers:', error.message || error);
      setTeachers([]); // Clear data on error
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/school');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSchools(data);
    } catch (error: any) {
      console.error('Error fetching schools:', error.message || error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // ถ้าเลือกอาจารย์ ให้เติมเบอร์โทรอัตโนมัติ
    if (name === 'Username') {
      const selectedTeacher = teachers.find(t => t.Username === value);
      setForm({ 
        ...form, 
        [name]: value,
        T_Phone: selectedTeacher ? selectedTeacher.Phone : ''
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/auth/book/${editingId}` : '/api/auth/book';

      const selectedTeacher = teachers.find(t => t.Username === form.Username);
      if (!selectedTeacher) {
        Swal.fire({
          icon: 'error',
          title: 'ข้อมูลไม่ถูกต้อง',
          text: 'กรุณาเลือกอาจารย์ที่ถูกต้อง',
        });        return;
      }

      const payload = { 
        ...form, 
        TeacherID: selectedTeacher.TeacherID,
        ...(editingId && { Book_ID: editingId })
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Error: ${res.statusText}`);

      await fetchBookings();
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: editingId ? 'อัปเดตข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!',
        timer: 1500,
        showConfirmButton: false,
      });
      setForm(emptyBooking);
      setEditingId(null);
      setShowForm(false);
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล',
      });
    }
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณต้องการลบข้อมูลรหัส ${id} ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/auth/book/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(`Error: ${res.statusText}`);
          await fetchBookings();
          Swal.fire(
            'ลบแล้ว!',
            'ข้อมูลการจองถูกลบเรียบร้อยแล้ว',
            'success'
          );
        } catch (error: any) {
          Swal.fire(
            'เกิดข้อผิดพลาด!',
            error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
            'error'
          );
        }
      }
    });
  };

  // ฟังก์ชันสำหรับแสดงข้อมูลกิจกรรมในฟอร์ม
  const getGuidanceDisplayText = (guidance: any) => {
    // ใช้ Sc_name ที่ได้มาโดยตรงจาก API ของ guidance เพื่อประสิทธิภาพที่ดีกว่าและแก้ไขปัญหาข้อมูลไม่แสดง
    const schoolName = guidance.Sc_name || `(ไม่พบชื่อโรงเรียน)`;
    const guidanceDate = new Date(guidance.guidance_date).toLocaleDateString('th-TH');
    return `${schoolName} (${guidanceDate})`;
  };

  const handleEdit = (booking: Booking) => {
    const { Book_ID, ...rest } = booking;
    setForm(rest);
    setEditingId(Book_ID);
    setShowForm(true);
  };

  const showDetails = (booking: Booking) => {
    const detailsHtml = `
      <div class="text-left p-4 space-y-4">
        <div class="bg-blue-50 p-3 rounded-lg">
          <label class="text-blue-700 font-medium text-sm">รหัสการจอง</label>
          <p class="text-blue-900 font-mono">${booking.Book_ID}</p>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <label class="text-green-700 font-medium text-sm">ชื่ออาจารย์</label>
          <p class="text-green-900">${booking.Prefix || ''}${booking.F_name} ${booking.L_name}</p>
        </div>
        <div class="bg-orange-50 p-3 rounded-lg">
          <label class="text-orange-700 font-medium text-sm">จุดรับส่ง</label>
          <p class="text-orange-900">${booking.T_PickupPoint || '-'}</p>
        </div>
        <h4 class="text-lg font-semibold text-blue-800 pt-4 border-t mt-4">👥 ข้อมูลนิสิต</h4>
        <p><b>คนที่ 1:</b> ${booking.Std_name1 || '-'} (${booking.Std_ID1 || '-'})</p>
        <p><b>คนที่ 2:</b> ${booking.Std_name2 || '-'} (${booking.Std_ID2 || '-'})</p>
      </div>
    `;

    Swal.fire({
      title: `<strong>รายละเอียด: ${booking.Sc_name}</strong>`,
      html: detailsHtml,
      
      imageHeight: 1500,
      imageAlt: "A tall image",
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: '✏️ แก้ไข',
      cancelButtonText: '🗑️ ลบ',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        // Edit action
        handleEdit(booking);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Delete action
        handleDelete(booking.Book_ID);
      }
    });
  };

  const uniqueTeachersForFilter = useMemo(() => {
    return [...teachers].sort((a, b) => a.F_name.localeCompare(b.F_name));
  }, [teachers]);

  const uniquePickupPoints = useMemo(() => {
    const points = bookings.map(b => b.T_PickupPoint).filter(Boolean);
    return [...new Set(points)].sort();
  }, [bookings]);

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
        const searchLower = searchTerm.toLowerCase();
        const teacherFullName = `${booking.Prefix || ''}${booking.F_name} ${booking.L_name}`.trim();

        const matchesSearch = !searchTerm ||
            (booking.Sc_name || '').toLowerCase().includes(searchLower) ||
            teacherFullName.toLowerCase().includes(searchLower) ||
            (booking.Username || '').toLowerCase().includes(searchLower) ||
            (booking.Std_name1 || '').toLowerCase().includes(searchLower) ||
            (booking.Std_name2 || '').toLowerCase().includes(searchLower) ||
            (booking.T_PickupPoint || '').toLowerCase().includes(searchLower) ||
            (booking.Book_ID || '').toLowerCase().includes(searchLower);

        const matchesTeacher = !teacherFilter || booking.Username === teacherFilter;
        const matchesPickupPoint = !pickupPointFilter || booking.T_PickupPoint === pickupPointFilter;

        return matchesSearch && matchesTeacher && matchesPickupPoint;
    });

    return filtered.sort((a, b) => {
        switch (sortBy) {
            case 'date':
                // Newest first
                return (b.guidance_date || '').localeCompare(a.guidance_date || '');
            case 'teacher':
                const teacherAName = `${a.F_name || ''} ${a.L_name || ''}`;
                const teacherBName = `${b.F_name || ''} ${b.L_name || ''}`;
                return teacherAName.localeCompare(teacherBName);
            case 'school':
                return (a.Sc_name || '').localeCompare(b.Sc_name || '');
            default:
                return 0;
        }
    });
}, [bookings, searchTerm, teacherFilter, pickupPointFilter, sortBy]);

  return (
    <div className="min-h-screen bg-blue-50">
      <main className="p-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-blue-500">
          <h1 className="text-2xl font-bold text-blue-800 mb-1">📋 ระบบจองกิจกรรมแนะแนว</h1>
          <p className="text-blue-600 text-sm">จัดการการจองและติดตามกิจกรรมแนะแนว</p>
        </div>
        
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <button
              onClick={() => {
                setForm(emptyBooking);
                setEditingId(null);
                setShowForm(!showForm);
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                showForm
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg'
              }`}
            >
              {showForm ? '❌ ปิดฟอร์ม' : '➕ เพิ่มการจองใหม่'}
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
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-4 border rounded-lg shadow-md mb-6 border-l-4 border-blue-400">
            <h2 className="text-lg font-semibold text-blue-800 mb-4">
              {editingId ? '✏️ แก้ไขการจอง' : '➕ เพิ่มการจองใหม่'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {editingId && (
                <div className="md:col-span-2">
                  <label className="block text-blue-700 font-medium mb-1">รหัสการจอง</label>
                  <input
                    name="Book_ID"
                    type="text"
                    value={editingId}
                    readOnly
                    className="w-full border border-blue-200 p-2 rounded bg-blue-50 text-blue-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-blue-700 font-medium mb-1">กิจกรรมแนะแนว</label>
                <select
                  name="GuidanceID"
                  value={form.GuidanceID}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  required
                >
                  <option value="">-- เลือกกิจกรรม --</option>
                  {guidances.map((g) => (
                    <option key={g.GuidanceID} value={g.GuidanceID}>
                      {getGuidanceDisplayText(g)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-blue-700 font-medium mb-1">ชื่ออาจารย์</label>
                <select
                  name="Username"
                  value={form.Username}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  required
                >
                  <option value="">-- เลือกชื่ออาจารย์ --</option>
                  {teachers.map((t) => (
                    <option key={t.Username} value={t.Username}>
                      {`${t.Prefix}${t.F_name} ${t.L_name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-blue-700 font-medium mb-1">จุดรับส่ง</label>
                <select
                  name="T_PickupPoint"
                  value={form.T_PickupPoint}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  required
                >
                  <option value="">-- เลือกจุดรับส่ง --</option>
                  {pickupPoints.map((point, index) => (
                    <option key={index} value={point}>
                      {point}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-blue-700 font-medium mb-1">เบอร์โทรอาจารย์</label>
                <input
                  name="T_Phone"
                  placeholder="หมายเลขโทรศัพท์"
                  value={form.T_Phone}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-blue-50"
                  readOnly
                />
                <small className="text-blue-600">*เบอร์โทรจะเติมอัตโนมัติเมื่อเลือกอาจารย์</small>
              </div>

              <div>
                <label className="block text-blue-700 font-medium mb-1">รหัสนิสิตคนที่ 1 (ไม่บังคับ)</label>
                <input
                  name="Std_ID1"
                  placeholder="รหัสนิสิตคนที่ 1"
                  value={form.Std_ID1 || ''}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-blue-700 font-medium mb-1">ชื่อนิสิตคนที่ 1 (ไม่บังคับ)</label>
                <input
                  name="Std_name1"
                  placeholder="ชื่อ-นามสกุล นิสิตคนที่ 1"
                  value={form.Std_name1 || ''}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-blue-700 font-medium mb-1">รหัสนิสิตคนที่ 2 (ไม่บังคับ)</label>
                <input
                  name="Std_ID2"
                  placeholder="รหัสนิสิตคนที่ 2"
                  value={form.Std_ID2 || ''}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-blue-700 font-medium mb-1">ชื่อนิสิตคนที่ 2 (ไม่บังคับ)</label>
                <input
                  name="Std_name2"
                  placeholder="ชื่อ-นามสกุล นิสิตคนที่ 2"
                  value={form.Std_name2 || ''}
                  onChange={handleChange}
                  className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium"
              >
                {editingId ? '💾 อัปเดต' : '➕ เพิ่ม'}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setForm(emptyBooking);
                    setEditingId(null);
                    setShowForm(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded font-medium"
                >
                  ❌ ยกเลิก
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            <strong>❌ {error}</strong>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-blue-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-2 opacity-50">📋</div>
            <p className="text-blue-600">ยังไม่มีข้อมูลการจอง</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-500 p-3">
              <h3 className="text-white font-semibold">📊 รายการการจอง ({filteredAndSortedBookings.length} รายการ)</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-2 px-3 text-left text-blue-800 font-medium">โรงเรียน</th>
                    <th className="py-2 px-3 text-left text-blue-800 font-medium">ชื่ออาจารย์</th>
                    <th className="py-2 px-3 text-left text-blue-800 font-medium">จุดรับส่ง</th>
                    <th className="py-2 px-3 text-left text-blue-800 font-medium">ข้อมูลรถ</th>
                    <th className="py-2 px-3 text-left text-blue-800 font-medium">เบอร์โทรอาจารย์</th>
                    <th className="py-2 px-3 text-center text-blue-800 font-medium">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedBookings.map((booking, index) => {
                    const guidance = guidances.find(g => g.GuidanceID === booking.GuidanceID);
                    return (
                      <tr key={booking.Book_ID} className={`border-b hover:bg-blue-25 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-25'}`}>
                        <td className="py-2 px-3 text-blue-700 font-medium">
                          {booking.Sc_name || '(ไม่พบข้อมูลกิจกรรม)'}
                        </td>
                        <td className="py-2 px-3">
                          {booking.TeacherID ? `${booking.Prefix || ''}${booking.F_name} ${booking.L_name}` : booking.Username}
                        </td>
                        <td className="py-2 px-3">{booking.T_PickupPoint}</td>
                        <td className="py-2 px-3 text-gray-700 text-xs">
                          {guidance?.car_type ? (
                            <div className="space-y-1">
                              <p className="font-semibold">{guidance.car_type} ({guidance.car_registration})</p>
                              <p className="text-gray-500">ที่นั่ง: {guidance.number_seats}</p>
                              <p className="text-gray-500">โทร: {guidance.car_phone}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-blue-600">{booking.T_Phone || '-'}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => showDetails(booking)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                          >
                            📋 รายละเอียด
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAndSortedBookings.length === 0 && (
                    <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                            <div className="text-4xl mb-2">📋</div>
                            <p>ไม่พบข้อมูลการจอง</p>
                            {(searchTerm || teacherFilter || pickupPointFilter) && (
                                <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    setTeacherFilter('');
                                    setPickupPointFilter('');
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