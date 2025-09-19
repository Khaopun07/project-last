import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/app/db/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// ฟังก์ชันช่วยแปลง id
const parseID = (id: string | undefined): number | null => {
  if (!id) return null;
  const num = parseInt(id, 10);
  return isNaN(num) ? null : num;
};

// ดึง id จาก URL path
function getIDFromReq(req: NextRequest): number | null {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    return parseID(lastSegment);
  } catch {
    return null;
  }
}

// GET: อ่านรายการจองพร้อมข้อมูล Guidance + Teacher + School
export async function GET(req: NextRequest) {
  try {
    const id = getIDFromReq(req);
    if (!id) return NextResponse.json({ message: 'Invalid booking ID' }, { status: 400 });

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
          b.Book_ID, b.GuidanceID, b.TeacherID,
          b.T_PickupPoint, b.T_Phone,
          b.Std_ID1, b.Std_name1, b.Std_ID2, b.Std_name2,
          g.guidance_date, 
          s.Sc_name, 
          t.F_name, t.L_name
       FROM book_table b
       LEFT JOIN guidance_table g ON b.GuidanceID = g.GuidanceID
       LEFT JOIN school_table s ON g.school_id = s.Sc_id
       LEFT JOIN teacher_table t ON b.TeacherID = t.TeacherID
       WHERE b.Book_ID = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    const booking = rows[0];
    return NextResponse.json({
      ...booking,
      Book_ID: booking.Book_ID?.toString().padStart(6, '0') || '000000',
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'Error fetching booking' }, { status: 500 });
  }
}

// PUT: อัปเดตรายการจอง
export async function PUT(req: NextRequest) {
  try {
    const id = getIDFromReq(req);
    if (!id) return NextResponse.json({ message: 'Invalid booking ID' }, { status: 400 });

    const {
      T_PickupPoint,
      T_Phone,
      Std_ID1,
      Std_name1,
      Std_ID2,
      Std_name2,
    } = await req.json();

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE book_table SET 
        T_PickupPoint = ?, 
        T_Phone = ?, 
        Std_ID1 = ?, 
        Std_name1 = ?, 
        Std_ID2 = ?, 
        Std_name2 = ? 
      WHERE Book_ID = ?`,
      [T_PickupPoint, T_Phone, Std_ID1, Std_name1, Std_ID2, Std_name2, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ message: 'Error updating booking' }, { status: 500 });
  }
}

// DELETE: ลบรายการจอง
export async function DELETE(req: NextRequest) {
  try {
    const id = getIDFromReq(req);
    if (!id) return NextResponse.json({ message: 'Invalid booking ID' }, { status: 400 });

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM book_table WHERE Book_ID = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ message: 'Error deleting booking' }, { status: 500 });
  }
}
