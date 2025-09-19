'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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
};

type LoggedInUser = {
  email: string;
  role: string;
  userData: {
    Teacher_ID?: string;
    F_name?: string;
    L_name?: string;
    Off_Fname?: string;
    Off_Lname?: string;
    Username?: string;
  };
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

const pickupPoints = [
  'หน้าคณะวิทยาศาสตร์',
  'หน้าหอพักอาจารย์',
  'หน้ามหาวิทยาลัยทักษิณ',
];

export default function BookingFormPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [guidances, setGuidances] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [form, setForm] = useState<Omit<Booking, 'Book_ID'>>(emptyBooking);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  // Effect to handle query parameters after data is loaded
  useEffect(() => {
    if (dataLoaded && guidances.length > 0 && teachers.length > 0 && loggedInUser) {
      const guidanceId = searchParams.get('school') || searchParams.get('schoolId');
      const schoolName = searchParams.get('schoolName');

      // Auto-select logged in teacher and their phone
      let selectedTeacherUsername = '';
      let selectedTeacherPhone = '';
      if (loggedInUser.role === 'teacher') {
        const teacher = teachers.find(t => t.Email === loggedInUser.email);
        if (teacher) {
          selectedTeacherUsername = teacher.Username;
          selectedTeacherPhone = teacher.Phone || '';
        }
      }

      // Find guidance/school
      const selectedGuidance = guidanceId
        ? guidances.find((g) => g.GuidanceID.toString() === guidanceId.toString())
        : schoolName
          ? guidances.find((g) => g.Sc_name === decodeURIComponent(schoolName))
          : null;

      setForm(prevForm => ({
        ...prevForm,
        GuidanceID: selectedGuidance?.GuidanceID || prevForm.GuidanceID,
        Username: selectedTeacherUsername || prevForm.Username,
        T_Phone: selectedTeacherPhone || '',
      }));
    }
  }, [searchParams, guidances, teachers, dataLoaded, loggedInUser]);

  const checkAuthAndFetchData = async () => {
    setAuthLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      const role = localStorage.getItem('role');

      if (!token || !userJson) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      let user;
      try {
        user = JSON.parse(userJson);
      } catch {
        setError('ข้อมูลผู้ใช้ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      if (role !== 'teacher') {
        setError('เฉพาะอาจารย์เท่านั้นที่สามารถเข้าถึงหน้านี้ได้');
        return;
      }

      setLoggedInUser({
        email: user.Email || '',
        role: 'teacher',
        userData: {
          Teacher_ID: user.Teacher_ID || '',
          F_name: user.F_name || '',
          L_name: user.L_name || '',
          Username: user.Username || '',
        }
      });

      await Promise.all([fetchGuidances(), fetchTeachers()]);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchGuidances = async () => {
    try {
      const res = await fetch('/api/auth/guidance', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const responseData = await res.json();
      console.log('📊 Guidances API Response:', responseData); // Debug log
      
      // Handle different response structures
      let guidancesArray = [];
      if (Array.isArray(responseData)) {
        // If response is directly an array
        guidancesArray = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        // If response has { data: [...] } structure
        guidancesArray = responseData.data;
      } else if (responseData && responseData.success && Array.isArray(responseData.data)) {
        // If response has { success: true, data: [...] } structure
        guidancesArray = responseData.data;
      } else {
        console.warn('Unexpected guidance response structure:', responseData);
        guidancesArray = [];
      }
      
      setGuidances(guidancesArray);
      setDataLoaded(prev => prev || guidancesArray.length > 0);
    } catch (error: any) {
      console.error('Error fetching guidances:', error.message || error);
      setGuidances([]); // Set empty array on error
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teacher', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const responseData = await res.json();
      console.log('👥 Teachers API Response:', responseData); // Debug log
      
      // Handle different response structures
      let teachersArray = [];
      if (Array.isArray(responseData)) {
        teachersArray = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        teachersArray = responseData.data;
      } else if (responseData && responseData.success && Array.isArray(responseData.data)) {
        teachersArray = responseData.data;
      } else {
        console.warn('Unexpected teacher response structure:', responseData);
        teachersArray = [];
      }
      
      setTeachers(teachersArray);
      setDataLoaded(prev => prev || teachersArray.length > 0);
    } catch (error: any) {
      console.error('Error fetching teachers:', error.message || error);
      setTeachers([]); // Set empty array on error
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!form.GuidanceID) {
      setError('กรุณาเลือกโรงเรียน');
      setLoading(false);
      return;
    }

    if (!form.T_PickupPoint) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      setLoading(false);
      return;
    }

    if (loggedInUser?.role === 'teacher') {
      const loggedInTeacher = teachers.find(t => t.Email === loggedInUser.email);
      if (loggedInTeacher && loggedInTeacher.Username !== form.Username) {
        setError('คุณสามารถจองเฉพาะในนามของตัวเองเท่านั้น');
        setLoading(false);
        return;
      }
    }

    const getTeacherID = () => {
      if (loggedInUser?.userData.Teacher_ID) {
        return loggedInUser.userData.Teacher_ID;
      }
      
      const teacher = teachers.find(t => t.Email === loggedInUser?.email);
      return teacher?.TeacherID || teacher?.Teacher_ID;
    };

    const teacherID = getTeacherID();
    
    console.log('🔍 Debug Teacher Info:', {
      loggedInUser: loggedInUser,
      teacherID: teacherID,
      teachers: teachers,
      foundTeacher: teachers.find(t => t.Email === loggedInUser?.email)
    });

    if (!teacherID) {
      setError('ไม่พบข้อมูล Teacher ID กรุณาล็อกอินใหม่');
      setLoading(false);
      return;
    }

    setTimeout(async () => {
      try {
        const requestData = {
          GuidanceID: parseInt(form.GuidanceID),
          TeacherID: parseInt(teacherID),
          T_PickupPoint: form.T_PickupPoint,
          T_Phone: form.T_Phone,
          Std_ID1: form.Std_ID1 || null,
          Std_name1: form.Std_name1 || null,
          Std_ID2: form.Std_ID2 || null,
          Std_name2: form.Std_name2 || null,
        };

        console.log('📤 Sending request data:', requestData);

        const res = await fetch('/api/auth/book', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestData),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Error: ${res.statusText}`);
        }

        const result = await res.json();
        setSuccess('บันทึกการจองเรียบร้อยแล้ว!');
        setForm({
          ...emptyBooking,
          GuidanceID: form.GuidanceID,
          Username: form.Username,
        });

        setTimeout(() => setSuccess(null), 5000);

      } catch (error: any) {
        setError(error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!loggedInUser && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-red-800 mb-2">ไม่สามารถโหลดข้อมูลได้</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get selected school and teacher data for display - with safety checks
  const selectedSchool = Array.isArray(guidances) && guidances.length > 0 
    ? guidances.find(g => g.GuidanceID === form.GuidanceID)
    : null;
    
  const selectedTeacher = Array.isArray(teachers) && teachers.length > 0
    ? teachers.find(t => t.Username === form.Username)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
            จองกิจกรรมแนะแนว
          </h1>
          <p className="text-lg text-gray-600">
            กรอกข้อมูลเพื่อจองและลงทะเบียนกิจกรรมแนะแนว
          </p>
        </div>
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-semibold">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        {loggedInUser?.role === 'teacher' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                ฟอร์มจองกิจกรรมแนะแนว
              </h2>
            </div>

            <div className="p-6 space-y-8">
              {/* Top Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Selected School Display */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      โรงเรียนที่จะไปแนะแนว
                    </label>
                    <div className="relative">
                      <div className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl bg-purple-50 flex items-center gap-3">
                        <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {selectedSchool ? (
                          <div>
                            <div className="font-semibold text-purple-800">
                              โรงเรียน{selectedSchool.Sc_name}
                            </div>
                            {selectedSchool.study_plan && (
                              <div className="text-sm text-purple-600">
                                {selectedSchool.study_plan}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">ไม่ได้ระบุโรงเรียน</span>
                        )}
                      </div>
                      <input type="hidden" name="GuidanceID" value={form.GuidanceID} />
                    </div>
                  </div>
                  {/* Pickup Point */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      จุดรับส่ง <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="T_PickupPoint"
                      value={form.T_PickupPoint}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                      required
                    >
                      <option value="">-- เลือกจุดรับส่ง --</option>
                      {pickupPoints.map((point) => (
                        <option key={point} value={point}>
                          {point}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Selected Teacher Display - Read Only */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่ออาจารย์
                    </label>
                    <div className="relative">
                      <div className="w-full px-4 py-3 border-2 border-green-300 rounded-xl bg-green-50 flex flex-col gap-1">
                        {loggedInUser ? (
                          <div>
                            <div className="font-semibold text-green-800">
                              {loggedInUser.userData.F_name} {loggedInUser.userData.L_name}
                            </div>
                            <div className="text-sm text-green-600">
                              {loggedInUser.userData.Teacher_ID || teachers.find(t => t.Email === loggedInUser.email)?.Teacher_ID || ''}
                              {loggedInUser.userData.Username && ` Username: ${loggedInUser.userData.Username}`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">ไม่สามารถระบุตัวตนได้</span>
                        )}
                      </div>
                      <input type="hidden" name="Username" value={form.Username} />
                    </div>
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เบอร์โทร <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="T_Phone"
                      placeholder="เบอร์โทรจะแสดงอัตโนมัติ"
                      value={form.T_Phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed"
                      required
                      readOnly
                    />
                    <small className="text-xs text-gray-500 mt-1">เบอร์โทรจะถูกดึงจากข้อมูลอาจารย์โดยอัตโนมัติ</small>
                  </div>
                </div>
              </div>

              {/* Students Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">ข้อมูลนักเรียน (ไม่บังคับ)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Student 1 Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-100">
                    <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      นักเรียนคนที่ 1
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">รหัสนักเรียน</label>
                        <input name="Std_ID1" placeholder="เช่น 640610001" value={form.Std_ID1} onChange={handleChange} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                        <input name="Std_name1" placeholder="เช่น นายสมชาย ใจดี" value={form.Std_name1} onChange={handleChange} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Student 2 Section */}
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border-2 border-green-100">
                    <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      นักเรียนคนที่ 2
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">รหัสนักเรียน</label>
                        <input name="Std_ID2" placeholder="เช่น 640610002" value={form.Std_ID2} onChange={handleChange} className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                        <input name="Std_name2" placeholder="เช่น นางสาวสมหญิง รักเรียน" value={form.Std_name2} onChange={handleChange} className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-between">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      บันทึกการจอง
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}