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
}

// ✅ ฟังก์ชันช่วยแปลง ID
const parseGuidanceID = (id: string | undefined): number | null => {
  if (!id) return null;
  const num = parseInt(id, 10);
  return isNaN(num) ? null : num;
};

// 📌 GET: ดึงข้อมูลกิจกรรมแนะแนวตาม ID
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const guidanceID = parseGuidanceID(url.pathname.split('/').pop());

    if (!guidanceID)
      return NextResponse.json({ success: false, message: 'Invalid GuidanceID' }, { status: 400 });

    const [rows] = await pool.query<Guidance[]>(
      `SELECT 
        g.*, 
        s.Sc_name,
        s.Sc_address,
        s.Sc_phone,
        s.Sc_email,
        s.Sc_website,
        s.Contact_name as teacher_in_charge
      FROM guidance_table g
      LEFT JOIN school_table s ON g.school_id = s.Sc_id
      WHERE g.GuidanceID = ?`,
      [guidanceID]
    );

    if (!Array.isArray(rows) || rows.length === 0)
      return NextResponse.json({ success: false, message: 'Guidance not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, message: 'Error fetching guidance' }, { status: 500 });
  }
}

// 📌 PUT: แก้ไขกิจกรรมแนะแนว
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const guidanceID = parseGuidanceID(url.pathname.split('/').pop());

    if (!guidanceID)
      return NextResponse.json({ success: false, message: 'Invalid GuidanceID' }, { status: 400 });

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

    if (result.affectedRows === 0)
      return NextResponse.json({ success: false, message: 'Guidance not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Guidance updated successfully' });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ success: false, message: 'Error updating guidance', error: error.message }, { status: 500 });
  }
}

// 📌 DELETE: ลบกิจกรรมแนะแนว
export async function DELETE(req: NextRequest) {
  const connection = await pool.getConnection();

  try {
    const url = new URL(req.url);
    const guidanceID = parseGuidanceID(url.pathname.split('/').pop());

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
