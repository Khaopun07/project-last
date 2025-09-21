'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';

type Booking = {
  Book_ID: string;
  GuidanceID: string;
  Username: string;
  TeacherID: string;
  T_PickupPoint: string;
  T_Phone: string;
  Std_ID1: string;
  Std_name1: string;
  Std_ID2: string;
  Std_name2: string;
};

type ProposedSchool = {
  Sc_id: string;
  Sc_name: string;
  Sc_address?: string;
  Sc_province: string;
  Sc_district: string;
  Sc_subdistrict?: string;
  Sc_postal?: string;
  Sc_phone?: string;
  Sc_email: string;
  Sc_website?: string;
  Contact_name: string;
  Contact_no: string;
  is_approved: number;
  proposed_by?: string;
};

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
  F_name: string;
  L_name: string;
};

export default function ActivityHistoryPage() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [proposedSchools, setProposedSchools] = useState<ProposedSchool[]>([]);
  const [guidances, setGuidances] = useState<Guidance[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [currentTeacherUsername, setCurrentTeacherUsername] = useState<string | null>(null);
  const [currentTeacherID, setCurrentTeacherID] = useState<string | null>(null);

  // Loading states
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  
  // Loading state for initial authentication check
  const [initialLoading, setInitialLoading] = useState(true);

  // Function to get current user from Header pattern and localStorage
  const getCurrentUser = useCallback(async () => {
    console.log('Getting current user from Header pattern...');
    
    try {
      // 1. Get from localStorage following Header pattern
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      
      console.log('Storage check:', { 
        hasToken: !!token, 
        hasUser: !!userJson,
        userJson: userJson?.substring(0, 100) + '...'
      });
      
      if (token && userJson) {
        try {
          const parsedUser = JSON.parse(userJson);
          console.log('Parsed user data:', parsedUser);
          
          const username = parsedUser.Username;
          const teacherID = parsedUser.TeacherID || parsedUser.teacherID;
          const firstName = parsedUser.F_name;
          const lastName = parsedUser.L_name;
          
          if (username) {
            console.log('Found user data:', { username, teacherID, firstName, lastName });
            return { 
              username, 
              teacherID,
              firstName,
              lastName,
              fullUser: parsedUser 
            };
          }
        } catch (parseError) {
          console.error('Error parsing user JSON:', parseError);
        }
      }
      
      // 2. Try sessionStorage if localStorage doesn't work
      const sessionUser = sessionStorage.getItem('user');
      const sessionToken = sessionStorage.getItem('token');
      
      if (sessionToken && sessionUser) {
        try {
          const parsedUser = JSON.parse(sessionUser);
          const username = parsedUser.Username;
          const teacherID = parsedUser.TeacherID || parsedUser.teacherID;
          
          if (username) {
            console.log('Found user data in session:', { username, teacherID });
            return { 
              username, 
              teacherID,
              firstName: parsedUser.F_name,
              lastName: parsedUser.L_name,
              fullUser: parsedUser 
            };
          }
        } catch (parseError) {
          console.error('Error parsing session user JSON:', parseError);
        }
      }
      
      // 3. Try legacy storage keys
      const legacyUsername = localStorage.getItem("teacherUsername") || 
                             localStorage.getItem("username");
      const legacyTeacherID = localStorage.getItem("teacherID") ||
                              localStorage.getItem("TeacherID");
      
      if (legacyUsername || legacyTeacherID) {
        console.log('Found legacy data:', { legacyUsername, legacyTeacherID });
        return { 
          username: legacyUsername, 
          teacherID: legacyTeacherID 
        };
      }
      
      console.log('No user data found in any storage');
      return { username: null, teacherID: null };
      
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return { username: null, teacherID: null };
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!currentTeacherID) {
      console.log('Cannot fetch history, no TeacherID');
      return;
    }

    try {
      setBookingsLoading(true);
      setSchoolsLoading(true);
      setError(null);
      console.log('Fetching history for TeacherID:', currentTeacherID);
      const res = await fetch('/api/auth/history');
      if (!res.ok) {
        throw new Error(`ไม่สามารถโหลดข้อมูลประวัติได้ (HTTP ${res.status})`);
      }
      const data = await res.json();
      console.log('History data received:', data);

      // Assuming data is { bookings: [...], proposedSchools: [...] }
      const allBookings = data.bookings || [];
      const allSchools = data.proposedSchools || [];

      // Filter bookings and schools to get only those belonging to the current user
      const userBookings = allBookings.filter(
        (b: Booking) => b.TeacherID === currentTeacherID
      );
      const userSchools = allSchools.filter(
        (s: ProposedSchool) => s.proposed_by === currentTeacherID
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compare against the start of the day

      const currentBookings: Booking[] = [];
      const pastBookingsData: Booking[] = [];

      // Separate the user's bookings into past and current/future
      userBookings.forEach((booking: Booking) => {
        const guidance = guidances.find(g => g.GuidanceID === booking.GuidanceID);
        // A booking is 'past' if its guidance date is before today.
        const isPast = guidance?.guidance_date ? new Date(guidance.guidance_date) < today : false;

        if (isPast) {
          pastBookingsData.push(booking);
        } else {
          // It's a current/future booking (or date is unknown), so add to "My Bookings".
          currentBookings.push(booking);
        }
      });

      setBookings(currentBookings);
      setPastBookings(pastBookingsData);
      setProposedSchools(userSchools);

    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message);
      setBookings([]);
      setPastBookings([]);
      setProposedSchools([]);
    } finally {
      setBookingsLoading(false);
      setSchoolsLoading(false);
    }
  }, [currentTeacherID, guidances]);

  const fetchGuidances = async () => {
    try {
      const res = await fetch('/api/auth/guidance');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // Handle both { data: [...] } and [...] response structures
      const guidanceData = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      console.log('Guidances data:', guidanceData);
      setGuidances(guidanceData);
    } catch (error: any) {
      console.error('Error fetching guidances:', error);
      setGuidances([]); // Clear data on error
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teacher');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      // Handle both { data: [...] } and [...] response structures
      const teacherData = data.data && Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      console.log('Teachers data:', teacherData);
      setTeachers(teacherData);
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      setTeachers([]); // Clear data on error
    }
  };

  // Listen for auth changes from Header
  useEffect(() => {
    const handleAuthChanged = async () => {
      console.log('Auth changed event detected, refreshing user data...');
      const { username, teacherID } = await getCurrentUser();
      
      if (username) {
        setCurrentTeacherUsername(username);
      }
      if (teacherID) {
        setCurrentTeacherID(teacherID);
      }
      
      // The main data fetch will be triggered by the useEffect that depends on currentTeacherID
    };

    window.addEventListener('authChanged', handleAuthChanged);
    
    return () => {
      window.removeEventListener('authChanged', handleAuthChanged);
    };
  }, [getCurrentUser, fetchHistory]);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      setInitialLoading(true);
      
      try {
        // Get user data from Header pattern
        const { username, teacherID, firstName, lastName } = await getCurrentUser();
        
        console.log('Initial user data:', { username, teacherID, firstName, lastName });
        
        if (username) {
          console.log('Found username:', username);
          setCurrentTeacherUsername(username);
        }
        
        if (teacherID) {
          console.log('Found TeacherID:', teacherID);
          setCurrentTeacherID(teacherID);
        }
        
        // Load basic data first
        await Promise.all([
          fetchGuidances(),
          fetchTeachers()
        ]);
        
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาเข้าสู่ระบบใหม่');
      }
      
      setInitialLoading(false);
    };

    initializeData();
  }, [getCurrentUser]);

  // Look for TeacherID from teachers data if not found initially
  useEffect(() => {
    if (!initialLoading && currentTeacherUsername && !currentTeacherID && teachers.length > 0) {
      console.log('Looking for TeacherID from teachers data...');
      const teacher = teachers.find(t => t.Username === currentTeacherUsername);
      if (teacher && teacher.TeacherID) {
        console.log('Found TeacherID from teachers data:', teacher.TeacherID);
        setCurrentTeacherID(teacher.TeacherID);
        localStorage.setItem("teacherID", teacher.TeacherID);
      } else {
        console.log('No matching teacher found in teachers data');
      }
    }
  }, [teachers, currentTeacherUsername, currentTeacherID, initialLoading]);

  // Fetch history when user data is available
  useEffect(() => {
    if (!initialLoading && currentTeacherID) {
      console.log('User data available, fetching history...', { 
        teacherID: currentTeacherID 
      });
      fetchHistory();
    }
  }, [currentTeacherID, initialLoading, fetchHistory]);

  // --- Handler Functions for Edit/Delete ---

  const handleDeleteBooking = async (bookingId: string) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณต้องการยกเลิกการจองใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ยกเลิกเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/auth/book/${bookingId}`, {
            method: 'DELETE',
          });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'ไม่สามารถลบข้อมูลได้' }));
            throw new Error(errorData.message);
          }
          Swal.fire(
            'สำเร็จ!',
            'การจองของคุณถูกยกเลิกแล้ว',
            'success'
          );
          fetchHistory(); // Refresh the list
        } catch (err: any) {
          console.error('Error deleting booking:', err);
          Swal.fire(
            'เกิดข้อผิดพลาด!',
            `เกิดข้อผิดพลาดในการยกเลิกการจอง: ${err.message}`,
            'error'
          );
        }
      }
    });
  };

  const handleUpdateBooking = async (updatedBooking: Booking) => {
    if (!updatedBooking || !updatedBooking.Book_ID) return;
    try {
      const res = await fetch(`/api/auth/book/${updatedBooking.Book_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'ไม่สามารถอัปเดตข้อมูลได้' }));
        throw new Error(errorData.message);
      }
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'อัปเดตการจองสำเร็จ',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      fetchHistory();
    } catch (err: any) {
      console.error('Error updating booking:', err);
      Swal.fire(
        'เกิดข้อผิดพลาด!',
        `เกิดข้อผิดพลาดในการอัปเดตการจอง: ${err.message}`,
        'error'
      );
    }
  };

  const handleEditBookingClick = (booking: Booking) => {
    const schoolInfo = getSchoolInfo(booking.GuidanceID);
    const schoolName = schoolInfo ? schoolInfo.schoolName : 'ข้อมูลการจอง';

    const pickupPoints = [
      'หน้าคณะวิทยาศาสตร์',
      'หน้าหอพักอาจารย์',
      'หน้ามหาวิทยาลัยทักษิณ',
    ];
    const pickupOptions = pickupPoints.map(point => 
      `<option value="${point}" ${booking.T_PickupPoint === point ? 'selected' : ''}>${point}</option>`
    ).join('');

    Swal.fire({
      title: `<span class="flex items-center justify-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                แก้ไขการจอง: ${schoolName}
              </span>`,
      html: `
        <div class="space-y-4 text-left p-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">จุดรับส่ง</label>
            <select id="swal-pickup" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300">
              <option value="">-- เลือกจุดรับส่ง --</option>
              ${pickupOptions}
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">นักเรียนคนที่ 1 (ชื่อ)</label>
            <input id="swal-std1-name" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${booking.Std_name1 || ''}">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">นักเรียนคนที่ 1 (รหัส)</label>
            <input id="swal-std1-id" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${booking.Std_ID1 || ''}">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">นักเรียนคนที่ 2 (ชื่อ)</label>
            <input id="swal-std2-name" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${booking.Std_name2 || ''}">
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">นักเรียนคนที่ 2 (รหัส)</label>
            <input id="swal-std2-id" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${booking.Std_ID2 || ''}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึกการแก้ไข',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-gray-100',
        title: 'text-2xl font-bold text-gray-800 pt-6',
        confirmButton: 'px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300',
        cancelButton: 'px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-all duration-300'
      },
      buttonsStyling: false,
      preConfirm: () => {
        return {
          ...booking,
          T_PickupPoint: (document.getElementById('swal-pickup') as HTMLSelectElement).value,
          Std_name1: (document.getElementById('swal-std1-name') as HTMLInputElement).value,
          Std_ID1: (document.getElementById('swal-std1-id') as HTMLInputElement).value,
          Std_name2: (document.getElementById('swal-std2-name') as HTMLInputElement).value,
          Std_ID2: (document.getElementById('swal-std2-id') as HTMLInputElement).value,
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdateBooking(result.value);
      }
    });
  };

  const handleUpdateSchool = async (updatedSchool: ProposedSchool) => {
    if (!updatedSchool || !updatedSchool.Sc_id) return;
    try {
      const res = await fetch(`/api/school/${updatedSchool.Sc_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSchool),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'ไม่สามารถอัปเดตข้อมูลได้' }));
        throw new Error(errorData.message);
      }
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'อัปเดตข้อมูลโรงเรียนสำเร็จ',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      fetchHistory();
    } catch (err: any) {
      console.error('Error updating school:', err);
      Swal.fire(
        'เกิดข้อผิดพลาด!',
        `เกิดข้อผิดพลาดในการอัปเดตข้อมูลโรงเรียน: ${err.message}`,
        'error'
      );
    }
  };

  const handleEditSchoolClick = (school: ProposedSchool) => {
    Swal.fire({
      title: `<span class="flex items-center justify-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                แก้ไขโรงเรียนที่เสนอ
              </span>`,
      html: `
        <div class="space-y-4 text-left max-h-[60vh] overflow-y-auto p-4">
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">ชื่อโรงเรียน</label><input id="swal-sc-name" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Sc_name || ''}"></div>
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">ที่อยู่</label><input id="swal-sc-address" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Sc_address || ''}"></div>
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">ตำบล</label><input id="swal-sc-subdistrict" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Sc_subdistrict || ''}"></div>
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">อำเภอ</label><input id="swal-sc-district" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Sc_district || ''}"></div>
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">จังหวัด</label><input id="swal-sc-province" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Sc_province || ''}"></div>
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">รหัสไปรษณีย์</label><input id="swal-sc-postal" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Sc_postal || ''}"></div>
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">เบอร์โทรศัพท์โรงเรียน</label><input id="swal-sc-phone" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Sc_phone || ''}"></div>
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">อีเมลโรงเรียน</label><input id="swal-sc-email" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Sc_email || ''}"></div>
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">เว็บไซต์โรงเรียน</label><input id="swal-sc-website" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Sc_website || ''}"></div>
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">ชื่อผู้ติดต่อ</label><input id="swal-contact-name" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Contact_name || ''}"></div>
          <div><label class="block text-sm font-semibold text-gray-700 mb-1">เบอร์ผู้ติดต่อ</label><input id="swal-contact-no" class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all duration-300" value="${school.Contact_no || ''}"></div>
        </div>
      `,
      width: '800px',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึกการแก้ไข',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-gray-100',
        title: 'text-2xl font-bold text-gray-800 pt-6',
        confirmButton: 'px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300',
        cancelButton: 'px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-all duration-300'
      },
      buttonsStyling: false,
      preConfirm: () => {
        return {
          ...school,
          Sc_name: (document.getElementById('swal-sc-name') as HTMLInputElement).value,
          Sc_address: (document.getElementById('swal-sc-address') as HTMLInputElement).value,
          Sc_subdistrict: (document.getElementById('swal-sc-subdistrict') as HTMLInputElement).value,
          Sc_district: (document.getElementById('swal-sc-district') as HTMLInputElement).value,
          Sc_province: (document.getElementById('swal-sc-province') as HTMLInputElement).value,
          Sc_postal: (document.getElementById('swal-sc-postal') as HTMLInputElement).value,
          Sc_phone: (document.getElementById('swal-sc-phone') as HTMLInputElement).value,
          Sc_email: (document.getElementById('swal-sc-email') as HTMLInputElement).value,
          Sc_website: (document.getElementById('swal-sc-website') as HTMLInputElement).value,
          Contact_name: (document.getElementById('swal-contact-name') as HTMLInputElement).value,
          Contact_no: (document.getElementById('swal-contact-no') as HTMLInputElement).value,
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleUpdateSchool(result.value);
      }
    });
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: `คุณต้องการลบโรงเรียนที่เสนอ "${schoolName}"? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/school/${schoolId}`, { method: 'DELETE' });
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'ไม่สามารถลบข้อมูลได้' }));
            throw new Error(errorData.message);
          }
          Swal.fire(
            'สำเร็จ!',
            'ลบโรงเรียนที่เสนอเรียบร้อยแล้ว',
            'success'
          );
          fetchHistory();
        } catch (err: any) {
          console.error('Error deleting school:', err);
          Swal.fire(
            'เกิดข้อผิดพลาด!',
            `เกิดข้อผิดพลาดในการลบโรงเรียน: ${err.message}`,
            'error'
          );
        }
      }
    });
  };

  // Helper functions
  const getSchoolInfo = (guidanceID: string) => {
    const guidance = guidances.find(g => g.GuidanceID === guidanceID);
    return guidance
      ? {
          schoolName: guidance.Sc_name,
          studyPlan: guidance.study_plan,
          carType: guidance.car_type,
          carRegistration: guidance.car_registration,
          numberSeats: guidance.number_seats,
          carPhone: guidance.car_phone,
        }
      : {
          schoolName: 'ไม่ทราบ',
          studyPlan: '',
          carType: undefined, carRegistration: undefined,
          numberSeats: undefined, carPhone: undefined
        };
  };

  const getTeacherName = (username: string) => {
    const teacher = teachers.find(t => t.Username === username);
    return teacher ? `${teacher.F_name} ${teacher.L_name}` : username || 'ไม่ทราบ';
  };

  const getCurrentTeacherInfo = () => {
    if (!currentTeacherUsername) return null;
    const teacher = teachers.find(t => t.Username === currentTeacherUsername);
    return teacher;
  };

  const getStatusBadge = (isApproved: number) => {
    if (isApproved === 1) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          อนุมัติแล้ว
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          รออนุมัติ
        </span>
      );
    }
  };

  // Filter data
  const filteredBookings = bookings.filter((booking) => {
    if (searchTerm.trim() === '') {
      return true;
    }

    const schoolInfo = getSchoolInfo(booking.GuidanceID);
    const teacherName = getTeacherName(booking.Username);
    const searchLower = searchTerm.toLowerCase();

    return (
      schoolInfo.schoolName.toLowerCase().includes(searchLower) ||
      teacherName.toLowerCase().includes(searchLower) ||
      booking.Std_name1.toLowerCase().includes(searchLower) ||
      (booking.Std_name2 && booking.Std_name2.toLowerCase().includes(searchLower)) ||
      booking.T_PickupPoint.toLowerCase().includes(searchLower) ||
      booking.T_Phone.includes(searchTerm) ||
      (schoolInfo.carType && schoolInfo.carType.toLowerCase().includes(searchLower)) ||
      (schoolInfo.carRegistration && schoolInfo.carRegistration.toLowerCase().includes(searchLower))
    );
  });

  console.log('Filter results:', {
    totalBookings: bookings.length,
    filteredBookings: filteredBookings.length,
    currentTeacherUsername,
    searchTerm,
    hasUsername: !!currentTeacherUsername
  });

  const filteredPastBookings = pastBookings.filter((booking) => {
    if (searchTerm.trim() === '') {
      return true;
    }

    const schoolInfo = getSchoolInfo(booking.GuidanceID);
    const teacherName = getTeacherName(booking.Username);
    const searchLower = searchTerm.toLowerCase();

    return (
      schoolInfo.schoolName.toLowerCase().includes(searchLower) ||
      teacherName.toLowerCase().includes(searchLower) ||
      booking.Std_name1.toLowerCase().includes(searchLower) ||
      (booking.Std_name2 && booking.Std_name2.toLowerCase().includes(searchLower)) ||
      booking.T_PickupPoint.toLowerCase().includes(searchLower) ||
      booking.T_Phone.includes(searchTerm) ||
      (schoolInfo.carType && schoolInfo.carType.toLowerCase().includes(searchLower)) ||
      (schoolInfo.carRegistration && schoolInfo.carRegistration.toLowerCase().includes(searchLower))
    );
  });

  const filteredSchools = proposedSchools.filter(school => {
    if (school.is_approved !== 0) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      school.Sc_name.toLowerCase().includes(searchLower) ||
      school.Sc_province.toLowerCase().includes(searchLower) ||
      (school.Contact_name || '').toLowerCase().includes(searchLower) ||
      (school.Contact_no || '').includes(searchTerm)
    );
  });

  const filteredApprovedSchools = proposedSchools.filter(school => {
    if (school.is_approved !== 1) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      school.Sc_name.toLowerCase().includes(searchLower) ||
      school.Sc_province.toLowerCase().includes(searchLower) ||
      (school.Contact_name || '').toLowerCase().includes(searchLower) ||
      (school.Contact_no || '').includes(searchTerm)
    );
  });

  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchHistory().finally(() => setLoading(false));
  }, [fetchHistory]);

  const currentLoading = activeTab === 'bookings' ? bookingsLoading : schoolsLoading;

  // Calculate statistics
  const approvedSchools = proposedSchools.filter(school => school.is_approved === 1).length;
  const pendingSchools = proposedSchools.filter(school => school.is_approved === 0).length;

  // Show loading screen while checking authentication
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">กำลังโหลดข้อมูล</h2>
          <p className="text-gray-600">กรุณารอสักครู่...</p>
        </div>
      </div>
    );
  }

  const currentTeacher = getCurrentTeacherInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section with User Info */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
            ประวัติกิจกรรม
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            ประวัติการลงชื่อกิจกรรมแนะแนวและการเสนอโรงเรียนของคุณ
          </p>
        </div>

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


        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex bg-white rounded-xl p-1 shadow-lg border border-gray-100">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'bookings'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                การจองของฉัน ({filteredBookings.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('schools')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === 'schools'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
                โรงเรียนที่เสนอ ({pendingSchools})
              </div>
            </button>
          </div>

          
        </div>

        {/* Content */}
        {activeTab === 'bookings' ? (
          <>
            {/* Bookings Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  การจองของฉัน ({filteredBookings.length} รายการ)
                </h2>
              </div>
              
              {bookingsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
                  <p className="text-xl text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">
                    {searchTerm ? 'ไม่พบการจองที่ค้นหา' : 'ยังไม่มีการจอง'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง' 
                      : 'ไม่พบการจองสำหรับผู้ใช้คนนี้'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                    >
                      ล้างคำค้นหา
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">โรงเรียน</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">วันที่จัดกิจกรรม</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">จุดรับส่ง</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">ข้อมูลรถ</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">เบอร์โทร</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">นักเรียนคนที่ 1</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">นักเรียนคนที่ 2</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">การดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b, index) => {
                        const schoolInfo = getSchoolInfo(b.GuidanceID);
                        const guidance = guidances.find(g => g.GuidanceID === b.GuidanceID);
                        const activityDate = guidance?.guidance_date
                          ? new Date(guidance.guidance_date).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A';
                        return (
                          <tr key={b.Book_ID} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                {schoolInfo.schoolName}
                              </span>
                              {schoolInfo.studyPlan && (
                                <div className="text-xs text-gray-500 mt-1">{schoolInfo.studyPlan}</div>
                              )}
                            </td>
                            <td className="py-4 px-6 text-gray-700">{activityDate}</td>
                            <td className="py-4 px-6 text-gray-700">{b.T_PickupPoint}</td>
                            <td className="py-4 px-6 text-gray-700 text-xs">
                              {schoolInfo.carType ? (
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.92 13.12A5.002 5.002 0 0013 8h-2a5.002 5.002 0 00-4.92 5.12l.23 1.15a4 4 0 003.69 3.23h6a4 4 0 003.69-3.23l.23-1.15zM12 8V4m0 4H8m4 0h4"></path></svg>
                                  <div className="space-y-1">
                                    <p className="font-semibold">{schoolInfo.carType} ({schoolInfo.carRegistration})</p>
                                    <p className="text-gray-500">ที่นั่ง: {schoolInfo.numberSeats}</p>
                                    <p className="text-gray-500">โทร: {schoolInfo.carPhone}</p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">ไม่มีข้อมูล</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-blue-600 font-medium">{b.T_Phone}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900">{b.Std_name1}</p>
                                <p className="text-xs text-gray-500">{b.Std_ID1}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {b.Std_name2 && b.Std_name2.trim() !== '' ? (
                                <div className="space-y-1">
                                  <p className="font-medium text-gray-900">{b.Std_name2}</p>
                                  <p className="text-xs text-gray-500">{b.Std_ID2}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm italic">ไม่มี</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleEditBookingClick(b)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                  แก้ไข
                                </button>
                                <button
                                  onClick={() => handleDeleteBooking(b.Book_ID)}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                  ลบ
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Past Bookings Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  การจองที่ผ่านมา ({filteredPastBookings.length} รายการ)
                </h2>
              </div>
              
              {bookingsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-600 mb-4"></div>
                  <p className="text-xl text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
                </div>
              ) : filteredPastBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">
                    {searchTerm ? 'ไม่พบการจองที่ผ่านมา' : 'ยังไม่มีการจองที่ผ่านมา'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง' 
                      : 'ไม่พบการจองที่เสร็จสิ้นแล้วสำหรับผู้ใช้คนนี้'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                    >
                      ล้างคำค้นหา
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                      <tr>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">โรงเรียน</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">วันที่จัดกิจกรรม</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">ข้อมูลรถ</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">จุดรับส่ง</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">เบอร์โทร</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">นักเรียนคนที่ 1</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">นักเรียนคนที่ 2</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-800 border-b border-gray-200">การดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPastBookings.map((b, index) => {
                        const schoolInfo = getSchoolInfo(b.GuidanceID);
                        const guidance = guidances.find(g => g.GuidanceID === b.GuidanceID);
                        const activityDate = guidance?.guidance_date
                          ? new Date(guidance.guidance_date).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A';
                        return (
                          <tr key={b.Book_ID} className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                {schoolInfo.schoolName}
                              </span>
                              {schoolInfo.studyPlan && (
                                <div className="text-xs text-gray-500 mt-1">{schoolInfo.studyPlan}</div>
                              )}
                            </td>
                            <td className="py-4 px-6 text-gray-700">{activityDate}</td>
                            <td className="py-4 px-6 text-gray-700 text-xs">
                              {schoolInfo.carType ? (
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.92 13.12A5.002 5.002 0 0013 8h-2a5.002 5.002 0 00-4.92 5.12l.23 1.15a4 4 0 003.69 3.23h6a4 4 0 003.69-3.23l.23-1.15zM12 8V4m0 4H8m4 0h4"></path></svg>
                                  <div className="space-y-1">
                                    <p className="font-semibold">{schoolInfo.carType} ({schoolInfo.carRegistration})</p>
                                    <p className="text-gray-500">ที่นั่ง: {schoolInfo.numberSeats}</p>
                                    <p className="text-gray-500">โทร: {schoolInfo.carPhone}</p>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">ไม่มีข้อมูล</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-gray-700">{b.T_PickupPoint}</td>
                            <td className="py-4 px-6">
                              <span className="text-blue-600 font-medium">{b.T_Phone}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900">{b.Std_name1}</p>
                                <p className="text-xs text-gray-500">{b.Std_ID1}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              {b.Std_name2 && b.Std_name2.trim() !== '' ? (
                                <div className="space-y-1">
                                  <p className="font-medium text-gray-900">{b.Std_name2}</p>
                                  <p className="text-xs text-gray-500">{b.Std_ID2}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm italic">ไม่มี</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleDeleteBooking(b.Book_ID)}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                  ลบ
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Proposed Schools Section */
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">รายการเสนอข้อมูลโรงเรียน</h2>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  พบ <span className="font-semibold text-indigo-600">{filteredSchools.length}</span> โรงเรียน
                </p>
              </div>
            </div>

            <div className="p-6">
              {currentLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                  <p className="text-xl text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
                </div>
              ) : filteredSchools.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">ไม่พบข้อมูล</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'ไม่พบโรงเรียนที่ตรงกับคำค้นหา' : 'ไม่มีคำขอเสนอข้อมูลโรงเรียน'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                    >
                      ล้างคำค้นหา
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ลำดับ</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ชื่อโรงเรียน</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">จังหวัด</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ผู้ติดต่อ</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">เบอร์ติดต่อ</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">สถานะ</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">การดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSchools.map((school, index) => (
                        <tr key={school.Sc_id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 transition-all duration-300">
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-sm font-bold rounded-full">
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-900">{school.Sc_name}</div>
                            {school.Sc_email && (
                              <div className="text-sm text-gray-500">{school.Sc_email}</div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-800">{school.Sc_province}</div>
                            {school.Sc_district && (
                              <div className="text-sm text-gray-500">{school.Sc_district}</div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-800">{school.Contact_name}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-blue-600">{school.Contact_no}</div>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(school.is_approved)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleEditSchoolClick(school)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                แก้ไข
                              </button>
                              <button
                                onClick={() => handleDeleteSchool(school.Sc_id, school.Sc_name)}
                                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
                                ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Approved Schools Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">รายการโรงเรียนที่อนุมัติแล้ว</h2>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  พบ <span className="font-semibold text-green-600">{filteredApprovedSchools.length}</span> โรงเรียน
                </p>
              </div>
            </div>
            <div className="p-6">
              {schoolsLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mb-4"></div>
                  <p className="text-xl text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
                </div>
              ) : filteredApprovedSchools.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">ไม่พบข้อมูล</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'ไม่พบโรงเรียนที่อนุมัติแล้วที่ตรงกับคำค้นหา' : 'ยังไม่มีโรงเรียนที่เสนอและได้รับการอนุมัติ'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                    >
                      ล้างคำค้นหา
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ลำดับ</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ชื่อโรงเรียน</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">จังหวัด</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">ผู้ติดต่อ</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">เบอร์ติดต่อ</th>
                        <th className="py-4 px-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredApprovedSchools.map((school, index) => (
                        <tr key={school.Sc_id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition-all duration-300">
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-100 to-teal-100 text-green-700 text-sm font-bold rounded-full">
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-gray-900">{school.Sc_name}</div>
                            {school.Sc_email && (
                              <div className="text-sm text-gray-500">{school.Sc_email}</div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-800">{school.Sc_province}</div>
                            {school.Sc_district && (
                              <div className="text-sm text-gray-500">{school.Sc_district}</div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-800">{school.Contact_name}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-blue-600">{school.Contact_no}</div>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(school.is_approved)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          </div>

          
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">การจองของฉัน</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
                <p className="text-xs text-gray-500 mt-1">รายการที่จองทั้งหมด</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">อนุมัติแล้ว</p>
                <p className="text-2xl font-bold text-gray-900">{approvedSchools}</p>
                <p className="text-xs text-gray-500 mt-1">โรงเรียนที่อนุมัติ</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">รออนุมัติ</p>
                <p className="text-2xl font-bold text-gray-900">{pendingSchools}</p>
                <p className="text-xs text-gray-500 mt-1">โรงเรียนรออนุมัติ</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}