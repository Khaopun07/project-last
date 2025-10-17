'use client';

import { useEffect, useState, useMemo, FC, SVGProps } from 'react';

// --- Type Definitions ---
type Guidance = {
  GuidanceID: string;
  guidance_date: string;
  school_id: string;
  Sc_name?: string;
  study_plan: string;
  faculty_in_charge: string;
  professor_in_charge: string;
  student_count: number;
  Category: 'ในนามคณะ' | 'ในนามยังสมาร์ท' | 'ในนามมหาวิทยาลัย';
  status: 'เปิดรับ' | 'ปิดรับ' | 'เสร็จสิ้น';
  Start_Time: string;
  Start_Stop: string;
};

type ReportSummary = {
  summary: {
    totalActivities: number;
    totalStudents: number;
    totalSchools: number;
  };
  statusBreakdown: { status: 'เปิดรับ' | 'ปิดรับ' | 'เสร็จสิ้น'; count: number }[];
  facultyBreakdown: { faculty: string; count: number }[];
};

// --- Sub-components for better organization ---

const LoadingSpinner: FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ErrorDisplay: FC<{ error: string }> = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-600 text-xl font-semibold mb-2">เกิดข้อผิดพลาด</div>
      <div className="text-gray-600 mb-4">{error}</div>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        ลองใหม่
      </button>
    </div>
  </div>
);

const SummaryCards: FC<{ summary: ReportSummary }> = ({ summary }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="text-2xl font-bold text-blue-600 mb-1">{summary.summary.totalActivities}</div>
      <div className="text-sm text-gray-600">กิจกรรมทั้งหมด</div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="text-2xl font-bold text-green-600 mb-1">{summary.summary.totalStudents}</div>
      <div className="text-sm text-gray-600">นักเรียนเข้าร่วม</div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="text-2xl font-bold text-purple-600 mb-1">{summary.summary.totalSchools}</div>
      <div className="text-sm text-gray-600">โรงเรียนที่เข้าร่วม</div>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="text-2xl font-bold text-orange-600 mb-1">
        {summary.statusBreakdown.find((s) => s.status === 'เสร็จสิ้น')?.count || 0}
      </div>
      <div className="text-sm text-gray-600">กิจกรรมที่เสร็จสิ้น</div>
    </div>
  </div>
);

const StatusTags: FC<{ summary: ReportSummary }> = ({ summary }) => (
  <div className="mb-6 flex flex-wrap gap-2">
    {summary.statusBreakdown.map((s) => (
      <span
        key={s.status}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          s.status === 'เปิดรับ'
            ? 'bg-green-100 text-green-800'
            : s.status === 'ปิดรับ'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {s.status}: {s.count} กิจกรรม
      </span>
    ))}
  </div>
);

const PdfActions: FC<{ guidanceId: string }> = ({ guidanceId }) => (
    <div className="flex flex-col gap-2 min-w-[140px]">
        <a
            href={`/api/pdf?id=${guidanceId}&download=false`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
            👁️ ดู PDF
        </a>
        <a
            href={`/api/pdf?id=${guidanceId}&download=true`}
            download={`รายงานกิจกรรม_${guidanceId}_${Date.now()}.pdf`}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg
                       hover:bg-green-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
        >
            📥 ดาวน์โหลด
        </a>
    </div>
);

const ReportGenerator: FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleGenerateReport = (reportType: 'activity' | 'teacher' | 'student') => {
    if (!startDate || !endDate) {
      alert('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
      return;
    }
    const url = `/api/guidance-reports?reportType=${reportType}&startDate=${startDate}&endDate=${endDate}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">ออกรายงานสรุป</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            วันที่เริ่มต้น
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            วันที่สิ้นสุด
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => handleGenerateReport('activity')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          รายงานกิจกรรม
        </button>
        <button
          onClick={() => handleGenerateReport('teacher')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          รายงานอาจารย์ที่เข้าร่วม
        </button>
        <button
          onClick={() => handleGenerateReport('student')}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          รายงานนิสิตที่เข้าร่วม
        </button>
      </div>
    </div>
  );
};

const ActivitiesTable: FC<{ activities: Guidance[] }> = ({ activities }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'เปิดรับ' | 'ปิดรับ' | 'เสร็จสิ้น'>('all');
  const [sortKey, setSortKey] = useState<'date' | 'school' | 'status'>('date');

  const filteredAndSortedActivities = useMemo(() => {
    let filtered = activities.filter(activity => {
      const searchMatch = !searchTerm ||
        (activity.Sc_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.study_plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.faculty_in_charge.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.professor_in_charge.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch = statusFilter === 'all' || activity.status === statusFilter;

      return searchMatch && statusMatch;
    });

    return filtered.sort((a, b) => {
      switch (sortKey) {
        case 'date':
          return new Date(b.guidance_date).getTime() - new Date(a.guidance_date).getTime();
        case 'school':
          return (a.Sc_name || a.school_id).localeCompare(b.Sc_name || b.school_id);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [activities, searchTerm, statusFilter, sortKey]);

  const formatTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return 'N/A';
    try {
      const date = new Date(`1970-01-01T${timeStr}`);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="ค้นหากิจกรรม, คณะ, หรืออาจารย์..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="เปิดรับ">เปิดรับ</option>
          <option value="ปิดรับ">ปิดรับ</option>
          <option value="เสร็จสิ้น">เสร็จสิ้น</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="date">เรียงตามวันที่</option>
          <option value="school">เรียงตามโรงเรียน</option>
          <option value="status">เรียงตามสถานะ</option>
        </select>
      </div>
      <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
        พบ <span className="font-medium text-gray-800">{filteredAndSortedActivities.length}</span> กิจกรรม จากทั้งหมด <span className="font-medium text-gray-800">{activities.length}</span> กิจกรรม
      </div>
      <div className="space-y-4">
        {filteredAndSortedActivities.map((activity) => (
          <div
            key={activity.GuidanceID}
            className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 ${
              expandedId === activity.GuidanceID ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activity.Sc_name || '(ไม่พบชื่อโรงเรียน)'}
                  </h3>
                  <StatusTag status={activity.status} />
                  <CategoryTag category={activity.Category} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <InfoItem icon={CalendarDaysIcon} text={formatDate(activity.guidance_date)} />
                  <InfoItem icon={ClockIcon} text={`${formatTime(activity.Start_Time)} - ${formatTime(activity.Start_Stop)}`} />
                  <InfoItem icon={BuildingLibraryIcon} text={activity.faculty_in_charge} />
                  <InfoItem icon={UsersIcon} text={`${activity.student_count} นักเรียน`} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setExpandedId(expandedId === activity.GuidanceID ? null : activity.GuidanceID)}
                  className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium min-w-[120px]"
                >
                  {expandedId === activity.GuidanceID ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                </button>
                <PdfActions guidanceId={activity.GuidanceID} />
              </div>
            </div>
            {expandedId === activity.GuidanceID && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border-t">
                <h4 className="font-medium text-gray-900 mb-3">รายละเอียดเพิ่มเติม</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">โรงเรียน:</span>
                      <span className="ml-2 text-gray-600">{activity.Sc_name || '(ไม่พบชื่อโรงเรียน)'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700">หลักสูตร:</span>
                      <span className="ml-2 text-gray-600">{activity.study_plan}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">อาจารย์ผู้รับผิดชอบ:</span>
                      <span className="ml-2 text-gray-600">{activity.professor_in_charge}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredAndSortedActivities.length === 0 && (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
            <div className="text-lg mb-2 font-medium">ไม่พบกิจกรรมที่ตรงกับเงื่อนไขการค้นหา</div>
            <div className="text-sm">ลองเปลี่ยนคำค้นหาหรือตัวกรองต่างๆ</div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusTag: FC<{ status: Guidance['status'] }> = ({ status }) => {
  const styleMap = {
    'เปิดรับ': 'bg-green-100 text-green-800 border-green-200',
    'ปิดรับ': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'เสร็จสิ้น': 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styleMap[status] || styleMap['เสร็จสิ้น']}`}>{status}</span>;
};

const CategoryTag: FC<{ category: Guidance['Category'] }> = ({ category }) => {
  const styleMap = {
    'ในนามคณะ': 'bg-blue-100 text-blue-800',
    'ในนามยังสมาร์ท': 'bg-purple-100 text-purple-800',
    'ในนามมหาวิทยาลัย': 'bg-red-100 text-red-800',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styleMap[category] || 'bg-gray-100 text-gray-800'}`}>{category}</span>;
};

const InfoItem: FC<{ icon: FC<SVGProps<SVGSVGElement>>; text: string }> = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
    <span className="truncate">{text}</span>
  </div>
);

// --- Icon Components (copied from heroicons) ---
const CalendarDaysIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);
const ClockIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const BuildingLibraryIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);
const UsersIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

// --- Main Page Component ---
export default function GuidanceReportPage() {
  const [activities, setActivities] = useState<Guidance[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [activitiesRes, summaryRes] = await Promise.all([
          fetch('/api/auth/guidance'), // Fetches detailed activities for the table
          fetch('/api/guidance-reports?action=summary'), // Fetches the summary data
        ]);

        if (!activitiesRes.ok) throw new Error('Failed to fetch guidance activities');
        if (!summaryRes.ok) throw new Error('Failed to fetch report summary');

        const activitiesData = await activitiesRes.json();
        const summaryData = await summaryRes.json();
        
        // Ensure activities data is an array
        setActivities(Array.isArray(activitiesData.data) ? activitiesData.data : (Array.isArray(activitiesData) ? activitiesData : []));

        // The summary data from the API is nested under a 'data' property
        if (summaryData && summaryData.data) {
          setSummary(summaryData.data);
        } else {
          console.warn('Summary data is not in the expected format:', summaryData);
          setSummary(null);
        }

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">รายงานกิจกรรมแนะแนวการศึกษา</h1>
          <p className="text-gray-600">ระบบออกเอกสาร PDF รายงานกิจกรรมและรายชื่อผู้เข้าร่วม</p>
        </div>

        <ReportGenerator />

        {summary && <SummaryCards summary={summary} />}
        {summary && <StatusTags summary={summary} />}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">รายการกิจกรรมแนะแนว</h2>
            <p className="text-sm text-gray-600 mt-1">เลือกกิจกรรมเพื่อดูรายละเอียดและดาวน์โหลดรายงาน PDF</p>
          </div>
          <div className="p-6">
            {activities.length > 0 ? (
              <ActivitiesTable activities={activities} />
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">ไม่พบกิจกรรม</h3>
                <p className="text-sm text-gray-500">ยังไม่มีกิจกรรมแนะแนวในระบบ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
