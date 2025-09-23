'use client';

import { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FA8072', '#7D3C98', '#27AE60', '#F1C40F'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: any }) => {
  if (active && payload && payload.length) {
    // For Pie charts, `label` is undefined, and the name is in `payload[0].name`.
    // For other charts, `label` is the category.
    const name = label || payload[0].name;
    const value = payload[0].value;
    // For Pie charts, the dataKey name is in `payload[0].dataKey`. For others, it's in `payload[0].name`.
    const dataKeyName = payload[0].dataKey || payload[0].name;

    return (
      <div className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="label font-bold text-gray-800">{`${name}`}</p>
        <p className="intro text-blue-600">{`${dataKeyName} : ${value?.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  // Don't render label for small slices to avoid clutter
  if (!percent || percent < 0.05) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontWeight="bold"
      fontSize={12}
    >{`${(percent * 100).toFixed(0)}%`}</text>
  );
};

const timeRanges = [
  { value: '7d', label: '7 วันล่าสุด' },
  { value: '30d', label: '30 วันล่าสุด' },
  { value: '90d', label: '90 วันล่าสุด' },
  { value: 'all', label: 'ทั้งหมด' },
];

const monthOrder = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

interface SchoolData {
  Sc_id: string | number;
  Sc_name: string;
  Sc_province: string;
  is_approved: number;
}

interface GuidanceData {
  GuidanceID: string | number;
  school_id: string | number;
  Category: string | null;
  guidance_date: string | Date | null;
  Sc_name?: string; // Will be added by join
}

interface BookingData {
  Book_ID: string | number;
  GuidanceID: string | number;
  Username: string;
  Std_name1?: string | null;
  Std_name2?: string | null;
}

interface TeacherData {
  Username: string;
  F_name: string;
  L_name: string;
}

export default function DashboardClient() {
  const [dataType, setDataType] = useState('กิจกรรม');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [guidances, setGuidances] = useState<GuidanceData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [schoolsRes, guidancesRes, bookingsRes, teachersRes] = await Promise.all([
          fetch('/api/school'),
          fetch('/api/auth/guidance'),
          fetch('/api/auth/book'),
          fetch('/api/teacher'),
        ]);

        if (!schoolsRes.ok || !guidancesRes.ok || !bookingsRes.ok || !teachersRes.ok) {
          throw new Error('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
        }

        const schoolsData = await schoolsRes.json();
        const guidancesData = await guidancesRes.json();
        const bookingsData = await bookingsRes.json();
        const teachersData = await teachersRes.json();

        const extractedSchools: SchoolData[] = Array.isArray(schoolsData) ? schoolsData : schoolsData.data || [];
        const extractedGuidances: GuidanceData[] = guidancesData.guidances || (Array.isArray(guidancesData) ? guidancesData : guidancesData.data || []);
        const extractedBookings: BookingData[] = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || [];
        const extractedTeachers: TeacherData[] = Array.isArray(teachersData) ? teachersData : teachersData.data || [];

        setSchools(extractedSchools);
        setGuidances(extractedGuidances);
        setBookings(extractedBookings);
        setTeachers(extractedTeachers);

      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const {
    sections,
    guidanceCategoryData,
    schoolsByProvinceData,
    guidanceMonthlyData,
    teacherActivityData,
    studentParticipationData,
  } = useMemo(() => {
    // Join guidances with schools to get school name
    const guidancesWithSchoolName = guidances.map(g => {
      const school = schools.find(s => s.Sc_id == g.school_id);
      return { ...g, Sc_name: school?.Sc_name || `(ID: ${g.school_id})` };
    });

    // Join bookings with enriched guidances to get details like date and school name
    const bookingsWithDetails = bookings.map(b => {
      const guidance = guidancesWithSchoolName.find(g => g.GuidanceID == b.GuidanceID);
      return { ...b, ...guidance }; // This will add guidance_date, Sc_name etc. to booking
    });

    let filteredGuidances;
    let filteredBookings;

    if (selectedMonth !== 'all') {
        // Filter by selected month across all years
        filteredGuidances = guidancesWithSchoolName.filter(g => {
            if (!g.guidance_date) return false;
            const date = new Date(g.guidance_date);
            return !isNaN(date.getTime()) && date.toLocaleString('th-TH', { month: 'short' }) === selectedMonth;
        });
        filteredBookings = bookingsWithDetails.filter(b => {
            if (!b.guidance_date) return false;
            const date = new Date(b.guidance_date);
            return !isNaN(date.getTime()) && date.toLocaleString('th-TH', { month: 'short' }) === selectedMonth;
        });
    } else {
        // Filter by time range if no month is selected
        const now = new Date();
        const cutoffDate = new Date();
        const filterActive = timeRange !== 'all';

        if (filterActive) {
            if (timeRange === '7d') cutoffDate.setDate(now.getDate() - 7);
            else if (timeRange === '30d') cutoffDate.setDate(now.getDate() - 30);
            else if (timeRange === '90d') cutoffDate.setDate(now.getDate() - 90);
        }

        filteredGuidances = filterActive ? guidancesWithSchoolName.filter(g => g.guidance_date && new Date(g.guidance_date) >= cutoffDate) : guidancesWithSchoolName;
        filteredBookings = filterActive ? bookingsWithDetails.filter(b => b.guidance_date && new Date(b.guidance_date) >= cutoffDate) : bookingsWithDetails;
    }

    // --- Re-calculate aggregations ---
    const approvedSchools = schools.filter(s => s.is_approved === 1);

    const sections = [
      { id: 'schools', title: '🏫 โรงเรียนทั้งหมด', count: schools.length, color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
      { id: 'guidances', title: '📅 กิจกรรม', count: filteredGuidances.length, color: 'from-indigo-400 to-indigo-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
      { id: 'bookings', title: '📋 การจอง', count: filteredBookings.length, color: 'from-emerald-400 to-green-600', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
    ];

    const guidanceByCategory = filteredGuidances.reduce((acc, guidance) => {      
      const categoryName = guidance.Category;
      // Group null, undefined, empty strings, or the literal string "undefined" into 'ไม่มีหมวดหมู่'
      const key = (categoryName && categoryName.trim() && categoryName.trim() !== 'undefined') ? categoryName.trim() : 'ไม่มีหมวดหมู่';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const guidanceCategoryData = Object.entries(guidanceByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 10);

    const schoolsByProvince = approvedSchools.reduce((acc, school) => {
      const province = school.Sc_province || 'ไม่ระบุ';
      acc[province] = (acc[province] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const schoolsByProvinceData = Object.entries(schoolsByProvince).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);

    const guidanceByMonth = filteredGuidances.reduce((acc, guidance) => {
      if (guidance.guidance_date) {
        const date = new Date(guidance.guidance_date);
        if (!isNaN(date.getTime())) {
          const month = date.toLocaleString('th-TH', { month: 'short' });
          acc[month] = (acc[month] || 0) + 1;
        }
      }
      return acc;
    }, {} as Record<string, number>);
    const guidanceMonthlyData = monthOrder.map(month => ({ name: month, 'จำนวนกิจกรรม': guidanceByMonth[month] || 0 }));

    // Data for 'อาจารย์' tab
    const teacherActivity = filteredBookings.reduce((acc, booking) => {
      const teacherUsername = booking.Username;
      if (teacherUsername) {
          acc[teacherUsername] = (acc[teacherUsername] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const teacherActivityData = Object.entries(teacherActivity)
      .map(([username, count]) => {
          const teacher = teachers.find(t => t.Username === username);
          const name = teacher ? `${teacher.F_name} ${teacher.L_name}`.trim() : username;
          return { name, 'จำนวนกิจกรรม': count };
      })
      .sort((a, b) => b['จำนวนกิจกรรม'] - a['จำนวนกิจกรรม'])
      .slice(0, 15);

    // Data for 'นิสิต' tab
    const studentParticipation = filteredBookings.reduce((acc, booking) => {
      if (booking.GuidanceID) {
          let studentCount = 0;
          if (booking.Std_name1 && booking.Std_name1.trim() !== '') studentCount++;
          if (booking.Std_name2 && booking.Std_name2.trim() !== '') studentCount++;
          
          acc[booking.GuidanceID] = (acc[booking.GuidanceID] || 0) + studentCount;
      }
      return acc;
    }, {} as Record<string, number>);

    const studentParticipationData = Object.entries(studentParticipation)
      .map(([guidanceId, count]) => ({ name: guidancesWithSchoolName.find(g => g.GuidanceID.toString() === guidanceId)?.Sc_name || `กิจกรรม #${guidanceId}`, 'จำนวนนิสิต': count }))
      .filter(item => item['จำนวนนิสิต'] > 0)
      .sort((a, b) => b['จำนวนนิสิต'] - a['จำนวนนิสิต'])
      .slice(0, 15);

    return { sections, guidanceCategoryData, schoolsByProvinceData, guidanceMonthlyData, teacherActivityData, studentParticipationData };
  }, [timeRange, selectedMonth, schools, guidances, bookings, teachers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-500 mb-4 mx-auto"></div>
          <p className="text-xl text-gray-600 font-medium">กำลังโหลดข้อมูลแดชบอร์ด...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-red-700 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          ภาพรวมระบบ
        </h1>
        <p className="text-gray-600 text-lg">สรุปข้อมูลและสถิติสำคัญในรูปแบบกราฟ</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Data Type Filter */}
      <div className="flex justify-center items-center gap-2 mb-4 bg-white p-2 rounded-full shadow-md">
        {['กิจกรรม', 'อาจารย์', 'นิสิต'].map(type => (
          <button
            key={type}
            onClick={() => setDataType(type)}
            className={`px-6 py-2 text-md font-semibold rounded-full transition-all duration-300 ${
              dataType === type
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-indigo-100'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-8 bg-white p-2 rounded-full shadow-md">
        <span className="text-gray-700 font-medium pl-2">แสดงข้อมูล:</span>
        {timeRanges.map(range => (
          <button
            key={range.value}
            onClick={() => {
              setTimeRange(range.value);
              setSelectedMonth('all');
            }}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
              timeRange === range.value && selectedMonth === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-blue-100'
            }`}
          >
            {range.label}
          </button>
        ))}
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <span className="text-gray-700 font-medium">เดือน:</span>
        <select
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            if (e.target.value !== 'all') {
              setTimeRange('all');
            }
          }}
          className="px-3 py-1.5 border border-gray-300 rounded-full text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="all">ทุกเดือน</option>
          {monthOrder.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {sections.map((s) => (
          <div
            key={s.id}
            className={`${s.bgColor} p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50`}
          >
            <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">{s.title}</p>
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${s.textColor} mt-1`}>{s.count}</h3>
          </div>
        ))}
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {dataType === 'กิจกรรม' && (
          <>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">หมวดหมู่กิจกรรมแนะแนว</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={guidanceCategoryData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(230, 247, 255, 0.5)' }} content={<CustomTooltip />} />
                  <Bar dataKey="value" name="จำนวนกิจกรรม">
                    {guidanceCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">กราฟจำนวนโรงเรียน (ที่อนุมัติแล้ว)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={schoolsByProvinceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {schoolsByProvinceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-100 lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-800 mb-4">จำนวนกิจกรรมแนะแนวรายเดือน</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={guidanceMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="จำนวนกิจกรรม" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {dataType === 'อาจารย์' && (
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-100 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-800 mb-4">สัดส่วนกิจกรรมที่อาจารย์ลงทะเบียน (15 อันดับแรก)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={teacherActivityData}
                  dataKey="จำนวนกิจกรรม"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {teacherActivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {dataType === 'นิสิต' && (
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-100 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-800 mb-4">สัดส่วนนิสิตที่เข้าร่วมในแต่ละกิจกรรม (15 อันดับแรก)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={studentParticipationData}
                  dataKey="จำนวนนิสิต"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {studentParticipationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </main>
  );
}