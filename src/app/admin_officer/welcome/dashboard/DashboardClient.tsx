'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FA8072', '#7D3C98', '#27AE60', '#F1C40F'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="label font-bold text-gray-800">{`${label}`}</p>
        <p className="intro text-blue-600">{`${payload[0].name} : ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const timeRanges = [
  { value: '7d', label: '7 วันล่าสุด' },
  { value: '30d', label: '30 วันล่าสุด' },
  { value: '90d', label: '90 วันล่าสุด' },
  { value: 'all', label: 'ทั้งหมด' },
];

interface SchoolData {
  Sc_province: string;
  is_approved: number;
}

interface GuidanceData {
  Category: string | null;
  guidance_date: string | Date | null;
}

interface BookingData {
  Book_ID: string | number;
  guidance_date: string | Date | null;
}

export default function DashboardClient({ 
  initialSchools,
  initialGuidances,
  initialBookings
}: { 
  initialSchools: SchoolData[],
  initialGuidances: GuidanceData[],
  initialBookings: BookingData[]
}) {
  const [timeRange, setTimeRange] = useState('all');

  const {
    sections,
    guidanceCategoryData,
    schoolsByProvinceData,
    guidanceMonthlyData
  } = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    const filterActive = timeRange !== 'all';

    if (filterActive) {
      if (timeRange === '7d') cutoffDate.setDate(now.getDate() - 7);
      else if (timeRange === '30d') cutoffDate.setDate(now.getDate() - 30);
      else if (timeRange === '90d') cutoffDate.setDate(now.getDate() - 90);
    }

    const filteredGuidances = filterActive 
      ? initialGuidances.filter(g => g.guidance_date && new Date(g.guidance_date) >= cutoffDate)
      : initialGuidances;
    
    const filteredBookings = filterActive
      ? initialBookings.filter(b => b.guidance_date && new Date(b.guidance_date) >= cutoffDate)
      : initialBookings;

    // --- Re-calculate aggregations ---
    const pendingSchools = initialSchools.filter(s => s.is_approved === 0);
    const approvedSchools = initialSchools.filter(s => s.is_approved === 1);

    const sections = [
      { id: 'schools', title: '🏫 โรงเรียนทั้งหมด', count: initialSchools.length, color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
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
    const monthOrder = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const guidanceMonthlyData = monthOrder.map(month => ({ name: month, 'จำนวนกิจกรรม': guidanceByMonth[month] || 0 }));

    return { sections, guidanceCategoryData, schoolsByProvinceData, guidanceMonthlyData };
  }, [timeRange, initialSchools, initialGuidances, initialBookings]);

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

      {/* Filter Section */}
      <div className="flex justify-center items-center gap-2 mb-8">
        <span className="text-gray-700 font-medium">แสดงข้อมูล:</span>
        {timeRanges.map(range => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
              timeRange === range.value
                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-600 hover:bg-blue-100 hover:text-blue-700'
            }`}
          >
            {range.label}
          </button>
        ))}
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
        {/* Bar Chart for Guidance Categories */}
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

        {/* Pie Chart for Schools by Province */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">10 อันดับจังหวัดที่มีโรงเรียน (ที่อนุมัติแล้ว)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={schoolsByProvinceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {schoolsByProvinceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart for Guidances over Time */}
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
      </div>
    </main>
  );
}