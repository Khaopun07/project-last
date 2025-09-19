import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/app/db/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface Guidance extends RowDataPacket {
  GuidanceID: number;
  guidance_date: string;
  school_id: number;
  counselor_id: string;
  student_count: number;
  study_plan: string;
  faculty_in_charge: string;
  professor_in_charge: string;
  Category: string;
  status: string;
  Start_Time: string;
  Start_Stop: string;
  car_registration: string;
  number_seats: number;
  car_type: string;
  car_phone: string;
  // School fields
  Sc_name: string;
  Sc_address: string;
  Sc_district: string;
  Sc_subdistrict: string;
  Sc_province: string;
  Sc_postal: string;
  Sc_phone: string;
  Sc_email: string;
  Sc_website: string;
  Contact_name: string;
  Contact_no: string;
  // Computed fields
  formatted_date: string;
  formatted_start_time: string;
  formatted_end_time: string;
  full_address: string;
  is_available: boolean;
  days_until_event: number;
}

// ✅ ฟังก์ชันช่วยแปลง ID
const parseGuidanceID = (id: string | undefined): number | null => {
  if (!id) return null;
  const num = parseInt(id, 10);
  return isNaN(num) ? null : num;
};

// ฟังก์ชันช่วยในการ format ข้อมูล
const formatGuidanceData = (row: any): Guidance => {
  // Format date
  const guidanceDate = new Date(row.guidance_date);
  const formatted_date = guidanceDate.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Format times
  const formatTime = (timeStr: string) => {
    try {
      const time = new Date(`2000-01-01 ${timeStr}`);
      return time.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }) + ' น.';
    } catch {
      return timeStr;
    }
  };

  const formatted_start_time = formatTime(row.Start_Time);
  const formatted_end_time = formatTime(row.Start_Stop);

  // Build full address
  const addressParts = [
    row.Sc_address,
    row.Sc_subdistrict,
    row.Sc_district,
    row.Sc_province,
    row.Sc_postal
  ].filter(Boolean);
  const full_address = addressParts.join(' ');

  // Calculate days until event
  const today = new Date();
  const eventDate = new Date(row.guidance_date);
  const diffTime = eventDate.getTime() - today.getTime();
  const days_until_event = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine availability
  const is_available = row.status === 'เปิดรับ' && days_until_event >= 0;

  return {
    ...row,
    formatted_date,
    formatted_start_time,
    formatted_end_time,
    full_address,
    is_available,
    days_until_event
  };
};

// ดึง GuidanceID จาก URL Path
function getGuidanceIDFromReq(req: NextRequest): number | null {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    return parseGuidanceID(lastSegment);
  } catch {
    return null;
  }
}

// 📌 GET: ดึงข้อมูลกิจกรรมแนะแนวตาม ID
export async function GET(req: NextRequest) {
  try {
    const guidanceID = getGuidanceIDFromReq(req);
    if (!guidanceID) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid GuidanceID' 
      }, { status: 400 });
    }

    const [rows] = await pool.query<Guidance[]>(
      `SELECT 
        g.*,
        s.Sc_name,
        s.Sc_address,
        s.Sc_district,
        s.Sc_subdistrict,
        s.Sc_province,
        s.Sc_postal,
        s.Sc_phone,
        s.Sc_email,
        s.Sc_website,
        s.Contact_name,
        s.Contact_no
      FROM guidance_table g
      LEFT JOIN school_table s ON g.school_id = s.Sc_id
      WHERE g.GuidanceID = ?`,
      [guidanceID]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Guidance not found' 
      }, { status: 404 });
    }

    const formattedData = formatGuidanceData(rows[0]);
    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error fetching guidance' 
    }, { status: 500 });
  }
}

// 📌 PUT: แก้ไขกิจกรรมแนะแนว
export async function PUT(req: NextRequest) {
  try {
    const guidanceID = getGuidanceIDFromReq(req);
    if (!guidanceID) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid GuidanceID' 
      }, { status: 400 });
    }

    const body = await req.json();
    const {
      guidance_date,
      school_id,
      counselor_id,
      student_count,
      study_plan,
      faculty_in_charge,
      professor_in_charge,
      Category,
      status,
      Start_Time,
      Start_Stop,
      car_registration,
      number_seats,
      car_type,
      car_phone,
    } = body;

    const formattedDate = guidance_date?.includes('T') ? guidance_date : `${guidance_date ?? ''}T00:00:00`;
    const formattedStartTime = Start_Time?.includes('T') ? Start_Time : `1970-01-01T${Start_Time}:00`;
    const formattedEndTime = Start_Stop?.includes('T') ? Start_Stop : `1970-01-01T${Start_Stop}:00`;

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE guidance_table SET
        guidance_date = ?, school_id = ?, counselor_id = ?, student_count = ?,
        study_plan = ?, faculty_in_charge = ?, professor_in_charge = ?, Category = ?,
        status = ?, Start_Time = ?, Start_Stop = ?, car_registration = ?, 
        number_seats = ?, car_type = ?, car_phone = ?
      WHERE GuidanceID = ?`,
      [
        formattedDate,
        school_id,
        counselor_id,
        parseInt(student_count) || 0,
        study_plan,
        faculty_in_charge,
        professor_in_charge,
        Category,
        status,
        formattedStartTime,
        formattedEndTime,
        car_registration || null,
        parseInt(number_seats) || 13,
        car_type || null,
        car_phone || null,
        guidanceID,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Guidance not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Guidance updated successfully' 
    });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error updating guidance', 
      error: error.message 
    }, { status: 500 });
  }
}

// 📌 DELETE: ลบกิจกรรมแนะแนว
export async function DELETE(req: NextRequest) {
  const connection = await pool.getConnection();

  try {
    const guidanceID = getGuidanceIDFromReq(req);

    if (!guidanceID) {
      return NextResponse.json(
        { success: false, message: 'Invalid GuidanceID' },
        { status: 400 }
      );
    }

    // ลบเฉพาะ guidance_table
    const [deleteResult] = await connection.execute<ResultSetHeader>(
      'DELETE FROM guidance_table WHERE GuidanceID = ?',
      [guidanceID]
    );

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Guidance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Guidance deleted successfully',
      deletedRecords: deleteResult.affectedRows,
    });
  } catch (error: any) {
    console.error('DELETE error:', error);

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json(
        {
          success: false,
          message:
            'Cannot delete guidance: There are related records in other tables (foreign key constraint)',
          error: 'FOREIGN_KEY_CONSTRAINT',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Error deleting guidance',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
