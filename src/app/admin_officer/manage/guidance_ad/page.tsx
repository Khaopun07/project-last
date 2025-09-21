'use client';
import { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';

type Guidance = {
  GuidanceID: string;
  guidance_date: string;
  school_id: string;
  counselor_id: string;
  student_count: string;
  study_plan: string;
  faculty_in_charge: string;
  professor_in_charge: string;
  Category: 'ในนามคณะ' | 'ในนามยังสมาร์ท' | 'ในนามมหาวิทยาลัย';
  status: string;
  Start_Time: string;
  Start_Stop: string;
  car_registration: string;
  number_seats: string;
  car_type: string;
  car_phone: string;
  Sc_name?: string;
};

type School = {
  Sc_id: string;
  Sc_name: string;
  Contact_name: string;
  is_approved?: boolean; // เพิ่มสถานะการอนุมัติ
};

type Teacher = {
  Username: string;
  F_name: string;
  L_name: string;
};

const emptyGuidance: Guidance = {
  GuidanceID: '',
  guidance_date: '',
  school_id: '',
  counselor_id: '',
  student_count: '',
  study_plan: '',
  faculty_in_charge: '',
  professor_in_charge: '',
  Category: 'ในนามคณะ',
  status: '',
  Start_Time: '',
  Start_Stop: '',
  car_registration: '',
  number_seats: '13',
  car_type: '',
  car_phone: '',
};

// Options for study plans
const studyPlanOptions = [
  'วิทย์ – คณิต',
  'ศิลป์ – คำนวณ',
  'ศิลป์ – ภาษา',
  'ศิลป์ – สังคม',
  'ศิลป์ – ทั่วไป'
];

// Options for faculties
const facultyOptions = [
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

// Car type options
const carTypeOptions = [
  'รถตู้',
  'รถบัส',
  'รถเก๋ง',
  'รถกระบะ'
];

function toDateOnly(dateStr: string) {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

function toTimeOnly(timeStr: string) {
  if (!timeStr) return '';
  if (timeStr.includes('T')) {
    return timeStr.split('T')[1]?.substring(0, 5) || '';
  }
  return timeStr.substring(0, 5);
}

// Helper functions for time picker
const generateTimeOptions = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // ทุก 5 นาที
  return { hours, minutes };
};

const { hours, minutes } = generateTimeOptions();

const parseTime = (timeStr: string) => {
  if (!timeStr) return { hour: '', minute: '' };
  const time = toTimeOnly(timeStr);
  const [hour, minute] = time.split(':');
  return { hour: hour || '', minute: minute || '' };
};

// Time Picker Component
const TimePickerDropdown = ({ 
  name, 
  value, 
  onChange, 
  label 
}: { 
  name: string; 
  value: string; 
  onChange: (e: { target: { name: string; value: string } }) => void;
  label: string;
}) => {
  const { hour, minute } = parseTime(value);

  const handleTimeChange = (type: 'hour' | 'minute', newValue: string) => {
    const currentTime = parseTime(value);
    const updatedTime = type === 'hour' 
      ? `${newValue}:${currentTime.minute || '00'}`
      : `${currentTime.hour || '00'}:${newValue}`;
    
    onChange({ target: { name, value: updatedTime } });
  };

  return (
    <div>
      <label className="block text-blue-700 font-medium mb-1">{label}</label>
      <div className="flex gap-2 items-center">
        {/* Hour Selection */}
        <div className="flex-1">
          <select
            value={hour}
            onChange={(e) => handleTimeChange('hour', e.target.value)}
            className="w-full border border-blue-200 p-3 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center font-mono text-lg bg-white hover:border-blue-400 transition-colors"
          >
            <option value="">--</option>
            {hours.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        
        <div className="text-2xl text-blue-500 font-bold px-1">:</div>
        
        {/* Minute Selection */}
        <div className="flex-1">
          <select
            value={minute}
            onChange={(e) => handleTimeChange('minute', e.target.value)}
            className="w-full border border-blue-200 p-3 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center font-mono text-lg bg-white hover:border-blue-400 transition-colors"
          >
            <option value="">--</option>
            {minutes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-between mt-1">
        <small className="text-blue-600 text-xs">ชั่วโมง (00-23)</small>
        <small className="text-blue-600 text-xs">นาที (00-55)</small>
      </div>
    </div>
  );
};

export default function GuidancePage() {
  const [guidance, setGuidance] = useState<Guidance[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState<Guidance>(emptyGuidance);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGuidance();
    fetchSchools();
    fetchTeachers();
  }, []);

  const fetchGuidance = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const res = await fetch('/api/auth/guidance');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const result = await res.json();
    console.log('Full API response:', result);
    
    if (result.success && result.data) {
      setGuidance(Array.isArray(result.data) ? result.data : []);
    } else {
      console.error('API response format issue:', result);
      setGuidance([]);
      setError(result.message || 'ข้อมูลไม่ถูกต้อง');
    }
  } catch (err: any) {
    console.error('Fetch error:', err);
    setError(err.message || 'เกิดข้อผิดพลาด');
    setGuidance([]);
  } finally {
    setLoading(false);
  }
};

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/school');
      const data = await res.json();
      setSchools(Array.isArray(data) ? data : []);
    } catch {
      setSchools([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teacher');
      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    }
  };

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }
) => {
  const { name, value } = e.target;

  // ถ้าเลือกโรงเรียน ให้กรอกครูอัตโนมัติจาก Contact_name
  if (name === 'school_id') {
    const selectedSchool = schools.find(s => s.Sc_id === value);

    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
      professor_in_charge: selectedSchool?.Contact_name || '', // ใช้ Contact_name จาก school_table
    }));
  } else {
    // อัพเดตฟิลด์อื่น ๆ ปกติ
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  }
};



  const handleSubmit = async () => {
  try {
    // Validation
    if (!form.guidance_date || !form.school_id || !form.counselor_id) {
      Swal.fire({
        icon: 'error',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลที่จำเป็น: วันที่, โรงเรียน, และอาจารย์แนะแนว',
      });
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = '/api/auth/guidance';
    
    // Debug: แสดงข้อมูลเวลาก่อนจัดการ
    console.log('Original form data:', {
      Start_Time: form.Start_Time,
      Start_Stop: form.Start_Stop,
    });
    
    // จัดการเวลาให้ถูกต้อง
    const processedStartTime = form.Start_Time ? 
      (form.Start_Time.includes(':') ? form.Start_Time : '') : '';
    const processedEndTime = form.Start_Stop ? 
      (form.Start_Stop.includes(':') ? form.Start_Stop : '') : '';
    
    console.log('Processed time data:', {
      processedStartTime,
      processedEndTime,
    });
    
    // ปรับปรุงข้อมูลก่อนส่ง
    const payload = {
      ...form,
      // เพิ่ม GuidanceID สำหรับ PUT request
      ...(editingId && { GuidanceID: editingId }),
      // ส่งเวลาในรูปแบบ HH:mm (ไม่ต้องแปลงผ่าน toTimeOnly)
      Start_Time: processedStartTime,
      Start_Stop: processedEndTime,
      // วันที่ในรูปแบบ YYYY-MM-DD
      guidance_date: toDateOnly(form.guidance_date),
      // ตรวจสอบตัวเลข
      student_count: form.student_count ? parseInt(form.student_count.toString()) : 0,
      number_seats: form.number_seats ? parseInt(form.number_seats.toString()) : 13
    };

    console.log('Final payload being sent:', payload);

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log('API Response:', result);

    if (!res.ok) {
      throw new Error(result.message || `HTTP error! status: ${res.status}`);
    }

    if (!result.success) {
      throw new Error(result.message || 'บันทึกไม่สำเร็จ');
    }

    // บันทึกสำเร็จ
    await fetchGuidance();
    setForm(emptyGuidance);
    setEditingId(null);
    setShowForm(false);
    
    Swal.fire({
      icon: 'success',
      title: 'สำเร็จ!',
      text: editingId ? 'อัปเดตข้อมูลสำเร็จ!' : 'บันทึกข้อมูลสำเร็จ!',
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

  const handleEdit = (item: Guidance) => {
    setForm(item);
    setEditingId(item.GuidanceID);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณต้องการลบกิจกรรมแนะแนวรหัส ${id} ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/auth/guidance/${id}`, { method: 'DELETE' });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
          }
          await fetchGuidance();
          Swal.fire(
            'ลบแล้ว!',
            'ข้อมูลกิจกรรมถูกลบเรียบร้อยแล้ว',
            'success'
          );
        } catch (error: any) {
          console.error('Delete error:', error);
          Swal.fire(
            'เกิดข้อผิดพลาด!',
            error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
            'error'
          );
        }
      }
    });
};

  const displayStatus = (status: string) => {
    switch (status) {
      case 'เปิดรับ':
      case 'ปิดรับ':
      case 'เสร็จสิ้น':
        return status;
      case 'open':
        return 'เปิดรับ';
      case 'closed':
        return 'ปิดรับ';
      case 'done':
        return 'เสร็จสิ้น';
      default:
        return 'ไม่ระบุสถานะ';
    }
  };

  const getStatusColor = (status: string) => {
    const displayText = displayStatus(status);
    switch (displayText) {
      case 'เปิดรับ':
        return 'bg-green-100 text-green-800';
      case 'ปิดรับ':
        return 'bg-yellow-100 text-yellow-800';
      case 'เสร็จสิ้น':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const showDetails = (item: Guidance) => {
    const teacher = teachers.find(t => t.Username === item.counselor_id);
    const counselorName = teacher ? `${teacher.F_name} ${teacher.L_name}` : item.counselor_id;

    const detailsHtml = `
      <div class="text-left p-4 space-y-4">
        <div class="bg-blue-50 p-3 rounded-lg">
          <label class="text-blue-700 font-medium text-sm">วันที่จัดกิจกรรม</label>
          <p class="text-blue-900 font-mono">${new Date(item.guidance_date).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div class="bg-green-50 p-3 rounded-lg">
          <label class="text-green-700 font-medium text-sm">โรงเรียน</label>
          <p class="text-green-900">${item.Sc_name || '(ไม่พบชื่อโรงเรียน)'}</p>
        </div>
        <div class="bg-yellow-50 p-3 rounded-lg">
          <label class="text-yellow-700 font-medium text-sm">จำนวนนักเรียน</label>
          <p class="text-yellow-900">👥 ${item.student_count || 0} คน</p>
        </div>
        <h4 class="text-lg font-semibold text-blue-800 pt-4 border-t mt-4">📋 ข้อมูลเพิ่มเติม</h4>
        <p><b>แผนการเรียน:</b> ${item.study_plan || '-'}</p>
        <p><b>คณะที่รับผิดชอบ:</b> ${item.faculty_in_charge || '-'}</p>
        <p><b>อาจารย์แนะแนว:</b> ${counselorName}</p>
        <p><b>ครูผู้รับผิดชอบ (รร.):</b> ${item.professor_in_charge || '-'}</p>
        <h4 class="text-lg font-semibold text-blue-800 pt-4 border-t mt-4">🚐 ข้อมูลยานพาหนะ</h4>
        <p><b>ประเภท:</b> ${item.car_type || '-'}</p>
        <p><b>ทะเบียน:</b> ${item.car_registration || '-'}</p>
        <p><b>ที่นั่ง:</b> ${item.number_seats || '-'}</p>
        <p><b>เบอร์โทร:</b> ${item.car_phone || '-'}</p>
      </div>
    `;

    Swal.fire({
      title: `<strong>รายละเอียด: ${item.Sc_name}</strong>`,
      html: detailsHtml,
      showCloseButton: true,
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: '✏️ แก้ไข',
      cancelButtonText: '🗑️ ลบ',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        handleEdit(item);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        handleDelete(item.GuidanceID);
      }
    });
  };

  const filteredGuidance = useMemo(() => {
    // Enrich guidance data with school names before filtering
    const enrichedGuidance = guidance.map(g => {
      // Use parseInt for robust matching between string IDs that might represent numbers
      const school = schools.find(s => 
        s.Sc_id && g.school_id && parseInt(s.Sc_id, 10) === parseInt(g.school_id, 10)
      );
      return { ...g, Sc_name: school?.Sc_name };
    });

    return enrichedGuidance.filter(item => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();

      const teacher = teachers.find(t => t.Username === item.counselor_id);
      const counselorName = teacher ? `${teacher.F_name} ${teacher.L_name}` : item.counselor_id;

      return (
        (item.Sc_name || '').toLowerCase().includes(searchLower) ||
        (item.faculty_in_charge || '').toLowerCase().includes(searchLower) ||
        (item.study_plan || '').toLowerCase().includes(searchLower) ||
        counselorName.toLowerCase().includes(searchLower) ||
        (item.professor_in_charge || '').toLowerCase().includes(searchLower) ||
        (item.car_registration || '').toLowerCase().includes(searchLower) ||
        (item.GuidanceID || '').toLowerCase().includes(searchLower)
      );
    });
  }, [guidance, schools, searchTerm, teachers]);

  return (
    <div className="min-h-screen bg-blue-50">
      <main className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-blue-500">
          <h1 className="text-2xl font-bold text-blue-800 mb-1">📘 จัดการกิจกรรมแนะแนว</h1>
          <p className="text-blue-600 text-sm">สร้างและจัดการกิจกรรมแนะแนวสำหรับโรงเรียน</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-end">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 ค้นหาในตาราง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => {
            setForm(emptyGuidance);
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className={`mb-4 px-4 py-2 rounded-lg font-medium transition-colors ${showForm
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
        >
          {showForm ? '❌ ปิดฟอร์ม' : '➕ เพิ่มกิจกรรมใหม่'}
        </button>
        

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 border rounded-lg shadow-md mb-6 border-l-4 border-blue-400">
            <h2 className="text-lg font-semibold text-blue-800 mb-6">
              {editingId ? '✏️ แก้ไขกิจกรรม' : '➕ เพิ่มกิจกรรมใหม่'}
            </h2>

            {/* Basic Information Section */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-blue-700 mb-3 border-b pb-2">📋 ข้อมูลพื้นฐาน</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-blue-700 font-medium mb-1">วันที่จัดกิจกรรม</label>
                  <input
                  name="guidance_date"
                  type="date"
                  value={toDateOnly(form.guidance_date)}
                  onChange={handleChange}
                  required
                  className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />

                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">โรงเรียน</label>
                  <select
                    name="school_id"
                    value={form.school_id}
                    onChange={handleChange}
                    required
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  >
                    <option value="">-- เลือกโรงเรียน --</option>
                    {schools
                      .filter(s => s.is_approved) // กรองเฉพาะโรงเรียนที่ได้รับอนุมัติ (is_approved === true)
                      .map((s) => (
                        <option key={s.Sc_id} value={s.Sc_id}>
                          {s.Sc_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">อาจารย์แนะแนว</label>
                  <select
                    name="counselor_id"
                    value={form.counselor_id}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                    required
                  >
                    <option value="">-- เลือกอาจารย์แนะแนว --</option>
                    {teachers.map((t) => (
                      <option key={t.Username} value={t.Username}>
                        {t.F_name} {t.L_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">จำนวนนักเรียน</label>
                  <input
                    name="student_count"
                    type="number"
                    placeholder="จำนวนนักเรียน"
                    value={form.student_count}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">แผนการเรียน</label>
                  <select
                    name="study_plan"
                    value={form.study_plan}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  >
                    <option value="">-- เลือกแผนการเรียน --</option>
                    {studyPlanOptions.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">หมวดหมู่</label>
                  <select
                    name="Category"
                    value={form.Category}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  >
                    <option value="ในนามคณะ">ในนามคณะ</option>
                    <option value="ในนามยังสมาร์ท">ในนามยังสมาร์ท</option>
                    <option value="ในนามมหาวิทยาลัย">ในนามมหาวิทยาลัย</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Faculty and Personnel Section */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-blue-700 mb-3 border-b pb-2">👥 ข้อมูลบุคลากร</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-700 font-medium mb-1">คณะที่รับผิดชอบ</label>
                  <select
                    name="faculty_in_charge"
                    value={form.faculty_in_charge}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  >
                    <option value="">-- เลือกคณะที่รับผิดชอบ --</option>
                    {facultyOptions.map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">ครูผู้รับผิดชอบ</label>
                  <input
                    name="professor_in_charge"
                    placeholder="ครูผู้รับผิดชอบจากโรงเรียน"
                    value={form.professor_in_charge}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-blue-50"
                    readOnly
                  />
                  <small className="text-blue-600 text-xs">*จะถูกกรอกอัตโนมัติเมื่อเลือกโรงเรียน</small>
                </div>
              </div>
            </div>

            {/* Schedule and Status Section */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-blue-700 mb-3 border-b pb-2">⏰ เวลาและสถานะ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <TimePickerDropdown
                  name="Start_Time"
                  value={form.Start_Time}
                  onChange={handleChange}
                  label="เวลาที่จะไป"
                />

                <TimePickerDropdown
                  name="Start_Stop"
                  value={form.Start_Stop}
                  onChange={handleChange}
                  label="เวลาสิ้นสุดกิจกรรม"
                />

                <div>
                  <label className="block text-blue-700 font-medium mb-1">สถานะ</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-3 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg font-medium bg-white cursor-pointer transition-all duration-200 hover:border-blue-400"
                  >
                    <option value="">-- เลือกสถานะ --</option>
                    <option value="เปิดรับ">🟢 เปิดรับ</option>
                    <option value="ปิดรับ">🟡 ปิดรับ</option>
                    <option value="เสร็จสิ้น">🔵 เสร็จสิ้น</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Information Section */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-blue-700 mb-3 border-b pb-2">🚐 ข้อมูลยานพาหนะ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-blue-700 font-medium mb-1">ทะเบียนรถ</label>
                  <input
                    name="car_registration"
                    placeholder="เช่น กข 1234"
                    value={form.car_registration}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">ประเภทรถ</label>
                  <select
                    name="car_type"
                    value={form.car_type}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  >
                    <option value="">-- เลือกประเภทรถ --</option>
                    {carTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">จำนวนที่นั่ง</label>
                  <input
                    name="number_seats"
                    type="number"
                    placeholder="13"
                    value={form.number_seats}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-blue-700 font-medium mb-1">เบอร์โทรรถ</label>
                  <input
                    name="car_phone"
                    placeholder="0XX-XXX-XXXX"
                    value={form.car_phone}
                    onChange={handleChange}
                    className="w-full border border-blue-200 p-2 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-medium transition-colors"
              >
                {editingId ? '💾 อัปเดต' : '➕ บันทึก'}
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    setForm(emptyGuidance);
                    setEditingId(null);
                    setShowForm(false);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded font-medium transition-colors"
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
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-500 p-3">
              <h3 className="text-white font-semibold">📊 รายการกิจกรรมแนะแนว ({filteredGuidance.length} รายการ)</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-blue-800 font-medium">วันที่</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-medium">โรงเรียน</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-medium">คณะ</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-medium">แผนเรียน</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-medium">เวลา</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-medium">นักเรียน</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-medium">ทะเบียนรถ</th>
                    <th className="py-3 px-4 text-left text-blue-800 font-medium">สถานะ</th>
                    <th className="py-3 px-4 text-center text-blue-800 font-medium">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuidance.map((item, index) => {
                    return (
                      <tr key={item.GuidanceID} className={`border-b hover:bg-blue-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-blue-25'}`}>
                        <td className="py-3 px-4 text-blue-700 font-medium">
                          {new Date(item.guidance_date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">{item.Sc_name || '(ไม่พบชื่อโรงเรียน)'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {item.faculty_in_charge ? item.faculty_in_charge.substring(0, 15) + '...' : '-'}
                        </td>
                        <td className="py-3 px-4 text-purple-700">{item.study_plan || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {toTimeOnly(item.Start_Time) || '--:--'} - {toTimeOnly(item.Start_Stop) || '--:--'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            👥 {item.student_count || '0'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                            {item.car_registration || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {displayStatus(item.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => showDetails(item)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium transition-colors"
                          >
                            👁️ ดูรายละเอียด
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredGuidance.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">📋</div>
                        <p>ไม่พบข้อมูลกิจกรรม</p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="mt-2 text-blue-500 hover:text-blue-700 text-sm underline"
                          >
                            ล้างการค้นหา
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