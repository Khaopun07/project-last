'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback, useMemo } from 'react';

type SchoolForm = {
  Sc_name: string;
  Sc_address: string;
  Sc_district: string;
  Sc_subdistrict: string;
  Sc_province: string;
  Sc_postal: string;
  Sc_phone: string;
  Sc_email: string;
  Sc_website: string;
  Contact_no: string;
  Contact_name: string;
};

type ProposedSchool = SchoolForm & {
  Sc_id: string;
  is_approved: number;
  proposed_by?: string;
};

type Teacher = {
  TeacherID?: string;
  F_name?: string;
  L_name?: string;
  Username?: string;
};

const emptyForm: SchoolForm = {
  Sc_name: '',
  Sc_address: '',
  Sc_district: '',
  Sc_subdistrict: '',
  Sc_province: '',
  Sc_postal: '',
  Sc_phone: '',
  Sc_email: '',
  Sc_website: '',
  Contact_no: '',
  Contact_name: '',
};

const inputFields = [
  { name: 'Sc_name', placeholder: 'ชื่อโรงเรียน', required: true, type: 'text', icon: 'school' },
  { name: 'Sc_address', placeholder: 'ที่อยู่', required: false, type: 'text', icon: 'location' },
  { name: 'Sc_district', placeholder: 'อำเภอ', required: false, type: 'text', icon: 'map' },
  { name: 'Sc_subdistrict', placeholder: 'ตำบล', required: false, type: 'text', icon: 'map' },
  { name: 'Sc_province', placeholder: 'จังหวัด', required: false, type: 'text', icon: 'map-pin' },
  { name: 'Sc_postal', placeholder: 'รหัสไปรษณีย์', required: false, type: 'text', icon: 'mail' },
  { name: 'Sc_phone', placeholder: 'เบอร์โทรศัพท์โรงเรียน', required: false, type: 'tel', icon: 'phone' },
  { name: 'Sc_email', placeholder: 'อีเมลโรงเรียน', required: false, type: 'email', icon: 'mail' },
  { name: 'Sc_website', placeholder: 'เว็บไซต์โรงเรียน', required: false, type: 'url', icon: 'globe' },
  { name: 'Contact_name', placeholder: 'ชื่อผู้ติดต่อ', required: false, type: 'text', icon: 'user' },
  { name: 'Contact_no', placeholder: 'เบอร์ผู้ติดต่อ', required: false, type: 'tel', icon: 'phone' },
];

const getIcon = (iconName: string) => {
  const icons: { [key: string]: string } = {
    school: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
    location: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    'map-pin': "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    mail: "M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    globe: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  };
  return icons[iconName] || icons.user;
};

export default function ProposeSchoolPage() {
  const [form, setForm] = useState<SchoolForm>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proposedSchools, setProposedSchools] = useState<ProposedSchool[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);

  // Function to load user data from localStorage (same as HeaderTeacher)
  const loadUserData = useCallback(() => {
    console.log('Loading user data from storage...');
    
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');

    if (token && userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        console.log('Parsed user from storage:', parsedUser);
        setCurrentUser(parsedUser);
        setUserLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    console.log('No valid user data found');
    setCurrentUser(null);
    setUserLoading(false);
  }, []);

  // Function to refresh user data
  const refreshUserData = useCallback(() => {
    setUserLoading(true);
    loadUserData();
  }, [loadUserData]);

  const filteredSchools = useMemo(() => {
    return proposedSchools
      .filter(s => s.is_approved === 0)
      .filter(school => 
        school.Sc_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.Sc_province.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.Contact_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [proposedSchools, searchTerm]);

  const fetchProposedSchools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/school?is_approved=false');
      if (!res.ok) throw new Error('ไม่สามารถโหลดข้อมูลได้');
      const data = await res.json();
      setProposedSchools(data);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize on component mount
  useEffect(() => {
    loadUserData();
    fetchProposedSchools();

    // Listen for auth changes (same as HeaderTeacher)
    const handleAuthChanged = () => {
      console.log('Auth changed event detected');
      loadUserData();
    };

    window.addEventListener('authChanged', handleAuthChanged);

    return () => {
      window.removeEventListener('authChanged', handleAuthChanged);
    };
  }, [loadUserData, fetchProposedSchools]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (message || error) {
      setMessage(null);
      setError(null);
    }
  }, [message, error]);

  const validateForm = useCallback(() => {
    if (!form.Sc_name.trim()) {
      throw new Error('กรุณากรอกชื่อโรงเรียน');
    }
    if (form.Sc_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Sc_email)) {
      throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
    }
    if (form.Sc_website && !/^https?:\/\/.+/.test(form.Sc_website)) {
      setForm(prev => ({ ...prev, Sc_website: form.Sc_website.startsWith('http') ? form.Sc_website : `https://${form.Sc_website}` }));
    }
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      // ตรวจสอบว่ามีข้อมูลผู้ใช้และ TeacherID หรือไม่
      if (!currentUser?.TeacherID) {
        throw new Error('ไม่พบข้อมูลครู กรุณาเข้าสู่ระบบใหม่');
      }

      console.log('Current user TeacherID:', currentUser.TeacherID); // Debug log

      validateForm();
      
      const requestData = {
        ...form, 
        is_approved: false,
        proposed_by: currentUser.TeacherID // ✅ ส่ง TeacherID ไปใน proposed_by
      };

      console.log('Sending request data:', requestData); // Debug log
      
      const res = await fetch('/api/school', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await res.json();
      console.log('API Response:', responseData); // Debug log

      if (!res.ok) {
        throw new Error(responseData.message || 'ไม่สามารถส่งคำขอได้');
      }

      setMessage('ส่งคำขอเสนอข้อมูลโรงเรียนเรียบร้อยแล้ว กรุณารอการอนุมัติ');
      setForm(emptyForm);
      fetchProposedSchools();
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefresh = useCallback(() => {
    fetchProposedSchools();
  }, [fetchProposedSchools]);

  // Get display name for user
  const getDisplayName = () => {
    if (currentUser?.F_name && currentUser?.L_name) {
      return `${currentUser.F_name} ${currentUser.L_name}`;
    }
    if (currentUser?.Username) {
      return currentUser.Username;
    }
    return 'ผู้ใช้';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (currentUser?.F_name && currentUser?.L_name) {
      return `${currentUser.F_name.charAt(0)}${currentUser.L_name.charAt(0)}`;
    }
    if (currentUser?.Username) {
      return currentUser.Username.substring(0, 2).toUpperCase();
    }
    return '?';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-4">
            เสนอข้อมูลโรงเรียน
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            เสนอข้อมูลโรงเรียนใหม่เพื่อเข้าร่วมระบบกิจกรรมแนะแนว
          </p>
        </div>

        {/* User Information Card */}
        {/* <div className="max-w-md mx-auto mb-8">
          {userLoading ? (
            // Loading State
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ) : currentUser ? (
            // User Found - แสดง TeacherID เพื่อ debug
            <div className="bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-white">
                    {getUserInitials()}
                  </span>
                </div>
                
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {getDisplayName()}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-indigo-600 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      @{currentUser.Username || 'ไม่พบข้อมูล'}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      รหัส: {currentUser.TeacherID || 'ไม่พบข้อมูล'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">ออนไลน์</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date().toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // No User Found
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-red-800">ไม่พบข้อมูลผู้ใช้</p>
                  <p className="text-sm text-red-600">กรุณาเข้าสู่ระบบใหม่</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-red-200">
                <button
                  onClick={refreshUserData}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  รีเฟรชข้อมูล
                </button>
              </div>
            </div>
          )}
        </div> */}

        {/* Messages */}
        {message && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6 mb-8 shadow-lg" role="alert">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-semibold text-lg">{message}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg p-6 mb-8 shadow-lg" role="alert">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-semibold text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* ปุ่มส่งต้องปิดการใช้งานถ้าไม่มี TeacherID */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">กรอกข้อมูลโรงเรียน</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inputFields.map((field) => (
                  <div key={field.name} className="relative group">
                    <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.placeholder}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getIcon(field.icon)} />
                        </svg>
                      </div>
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        placeholder={`กรอก${field.placeholder}`}
                        required={field.required}
                        value={form[field.name as keyof SchoolForm]}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={submitting || !currentUser?.TeacherID} // ✅ ปิดปุ่มถ้าไม่มี TeacherID
                  className="flex-1 group relative px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-3">
                    {submitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        กำลังส่งข้อมูล...
                      </>
                    ) : !currentUser?.TeacherID ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ไม่พบข้อมูลครู
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        ส่งคำขอเสนอ
                      </>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm(emptyForm)}
                  className="px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-300 border border-gray-300"
                >
                  ล้างข้อมูล
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}