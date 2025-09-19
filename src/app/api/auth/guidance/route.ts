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

// ✅ GET: ดึงข้อมูลกิจกรรมแนะแนวทั้งหมด พร้อมข้อมูลโรงเรียน
export async function GET() {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        g.*, 
        s.Sc_name,
        s.Sc_address,
        s.Sc_phone,
        s.Sc_email,
        s.Sc_website,
        s.Contact_name as teacher_in_charge
      FROM guidance_table AS g
      LEFT JOIN school_table AS s ON CAST(g.school_id AS UNSIGNED) = CAST(s.Sc_id AS UNSIGNED)
      ORDER BY g.guidance_date DESC`
    );

    return NextResponse.json({ success: true, data: rows, count: Array.isArray(rows) ? rows.length : 0 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Error fetching guidance', error: error.message }, { status: 500 });
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
        professor_in_charge || null, Category || 'ในนามคณะ', status || null,
        formattedStart, formattedEnd, car_registration || null,
        parseInt(number_seats) || 13, car_type || null, car_phone || null
      ]
    );

    return NextResponse.json({ success: true, message: 'Guidance created successfully', id: (result as ResultSetHeader).insertId });
  } catch (error: any) {
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
        professor_in_charge || null, Category || 'ในนามคณะ', status || null,
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
    return NextResponse.json({ success: false, message: 'Error updating guidance', error: error.message }, { status: 500 });
  }
}