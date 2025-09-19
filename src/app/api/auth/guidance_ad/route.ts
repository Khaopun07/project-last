import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import pool from '@/src/app/db/mysql';

// ฟังก์ชันช่วยแปลงเวลาและวันที่เป็น 'YYYY-MM-DD HH:mm:ss'
function combineDateTime(dateStr?: string, timeStr?: string): string | null {
  if (!dateStr) return null;

  const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  let timePart = '00:00:00';

  if (timeStr) {
    if (timeStr.includes('T')) {
      const tPart = timeStr.split('T')[1].split('Z')[0].split('+')[0].split('-')[0];
      timePart = tPart.length === 5 ? `${tPart}:00` : tPart; // HH:mm → HH:mm:00
    } else if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      timePart = timeStr.length === 4 ? `0${timeStr}:00` : `${timeStr}:00`;
    } else if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeStr)) {
      timePart = timeStr.length === 7 ? `0${timeStr}` : timeStr;
    }
  }

  return `${datePart} ${timePart}`;
}

// ฟังก์ชันช่วยจัดรูปแบบข้อมูลให้ตรงกับที่ component ต้องการ
function formatGuidanceData(guidance: any, school: any) {
  const guidanceDate = new Date(guidance.guidance_date);
  const startTime = guidance.Start_Time ? new Date(`2000-01-01 ${guidance.Start_Time}`) : null;
  const endTime = guidance.Start_Stop ? new Date(`2000-01-01 ${guidance.Start_Stop}`) : null;
  const today = new Date();
  const timeDiff = guidanceDate.getTime() - today.getTime();
  const daysUntilEvent = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return {
    GuidanceID: guidance.GuidanceID,
    guidance_date: guidance.guidance_date,
    school_id: guidance.school_id,
    counselor_id: guidance.counselor_id,
    student_count: guidance.student_count,
    study_plan: guidance.study_plan,
    faculty_in_charge: guidance.faculty_in_charge,
    professor_in_charge: guidance.professor_in_charge,
    Category: guidance.Category,
    status: guidance.status || 'เปิดรับ',
    Start_Time: guidance.Start_Time,
    Start_Stop: guidance.Start_Stop,
    car_registration: guidance.car_registration,
    number_seats: guidance.number_seats,
    car_type: guidance.car_type,
    car_phone: guidance.car_phone,
    
    // ข้อมูลโรงเรียน
    Sc_name: school?.Sc_name || 'ไม่ระบุชื่อโรงเรียน',
    Sc_address: school?.Sc_address || '',
    Sc_district: school?.Sc_district || '',
    Sc_subdistrict: school?.Sc_subdistrict || '',
    Sc_province: school?.Sc_province || '',
    Sc_postal: school?.Sc_postal || '',
    Sc_phone: school?.Sc_phone || '',
    Sc_email: school?.Sc_email || '',
    Contact_name: school?.Contact_name || school?.teacher_in_charge || 'ไม่ระบุ',
    Contact_no: school?.Contact_no || school?.Sc_phone || '',
    
    // ข้อมูลจัดรูปแบบ
    formatted_date: guidanceDate.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    formatted_start_time: startTime ? startTime.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) : '',
    formatted_end_time: endTime ? endTime.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) : '',
    full_address: [
      school?.Sc_address,
      school?.Sc_subdistrict,
      school?.Sc_district,
      school?.Sc_province,
      school?.Sc_postal
    ].filter(Boolean).join(' '),
    
    // สถานะการสมัคร
    is_available: guidance.status === 'เปิดรับ' && daysUntilEvent >= 0,
    days_until_event: daysUntilEvent
  };
}

// ✅ GET: ดึงข้อมูลกิจกรรมแนะแนวทั้งหมด พร้อมข้อมูลโรงเรียน
export async function GET() {
  try {
    const [guidanceRows] = await pool.execute(
      `SELECT 
        g.*
      FROM guidance_table g
      ORDER BY g.guidance_date DESC`
    );

    const [schoolRows] = await pool.execute(
      `SELECT *
      FROM school_table`
    );

    // สร้าง Map ของโรงเรียนเพื่อใช้ในการ join
    const schoolMap = new Map();
    (schoolRows as any[]).forEach(school => {
      schoolMap.set(school.Sc_id, school);
    });

    // จัดรูปแบบข้อมูล
    const formattedGuidances = (guidanceRows as any[]).map(guidance => {
      const school = schoolMap.get(guidance.school_id);
      return formatGuidanceData(guidance, school);
    });

    // คำนวณสถิติ
    const categories = {
      'ในนามคณะ': formattedGuidances.filter(g => g.Category === 'ในนามคณะ').length,
      'ในนามยังสมาร์ท': formattedGuidances.filter(g => g.Category === 'ในนามยังสมาร์ท').length,
      'ในนามมหาวิทยาลัย': formattedGuidances.filter(g => g.Category === 'ในนามมหาวิทยาลัย').length,
    };

    const availableCount = formattedGuidances.filter(g => g.is_available).length;

    const response = {
      guidances: formattedGuidances,
      total: formattedGuidances.length,
      available_count: availableCount,
      categories: categories
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching guidance', 
      error: error.message,
      guidances: [],
      total: 0,
      available_count: 0,
      categories: {
        'ในนามคณะ': 0,
        'ในนามยังสมาร์ท': 0,
        'ในนามมหาวิทยาลัย': 0,
      }
    }, { status: 500 });
  }
}

// ✅ POST: เพิ่มกิจกรรมแนะแนวใหม่
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      guidance_date, school_id, counselor_id, student_count, study_plan,
      faculty_in_charge, professor_in_charge, Category, status,
      Start_Time, Start_Stop, car_registration, number_seats, car_type, car_phone
    } = body;

    const formattedStart = combineDateTime(guidance_date, Start_Time);
    const formattedEnd = combineDateTime(guidance_date, Start_Stop);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO guidance_table 
        (guidance_date, school_id, counselor_id, student_count, study_plan, faculty_in_charge, professor_in_charge, Category, status, Start_Time, Start_Stop, car_registration, number_seats, car_type, car_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        guidance_date, school_id || null, counselor_id || null,
        parseInt(student_count) || 0, study_plan || null, faculty_in_charge || null,
        professor_in_charge || null, Category || 'ในนามคณะ', status || 'เปิดรับ',
        formattedStart, formattedEnd, car_registration || null,
        parseInt(number_seats) || 13, car_type || null, car_phone || null
      ]
    );

    return NextResponse.json({ success: true, message: 'Guidance created successfully', id: (result as ResultSetHeader).insertId });
  } catch (error: any) {
    console.error('Create error:', error);
    return NextResponse.json({ success: false, message: 'Error creating guidance', error: error.message }, { status: 500 });
  }
}

// ✅ PUT: อัปเดตกิจกรรมแนะแนว
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      GuidanceID, guidance_date, school_id, counselor_id, student_count, study_plan,
      faculty_in_charge, professor_in_charge, Category, status,
      Start_Time, Start_Stop, car_registration, number_seats, car_type, car_phone
    } = body;

    if (!GuidanceID) return NextResponse.json({ success: false, message: 'Missing GuidanceID' }, { status: 400 });

    const formattedStart = combineDateTime(guidance_date, Start_Time);
    const formattedEnd = combineDateTime(guidance_date, Start_Stop);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE guidance_table SET
        guidance_date = ?, school_id = ?, counselor_id = ?, student_count = ?, study_plan = ?,
        faculty_in_charge = ?, professor_in_charge = ?, Category = ?, status = ?,
        Start_Time = ?, Start_Stop = ?, car_registration = ?, number_seats = ?, car_type = ?, car_phone = ?
      WHERE GuidanceID = ?`,
      [
        guidance_date, school_id || null, counselor_id || null,
        parseInt(student_count) || 0, study_plan || null, faculty_in_charge || null,
        professor_in_charge || null, Category || 'ในนามคณะ', status || 'เปิดรับ',
        formattedStart, formattedEnd, car_registration || null,
        parseInt(number_seats) || 13, car_type || null, car_phone || null,
        GuidanceID
      ]
    );

    if ((result as ResultSetHeader).affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Guidance not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Guidance updated successfully' });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json({ success: false, message: 'Error updating guidance', error: error.message }, { status: 500 });
  }
}