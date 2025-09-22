import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/app/db/mysql';

// ฟังก์ชันช่วยดึง username จาก URL path
function getUsernameFromReq(req: NextRequest): string | null {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const username = segments[segments.length - 1];
    return username || null;
  } catch {
    return null;
  }
}

// GET: อ่านข้อมูลอาจารย์ตาม Username
export async function GET(req: NextRequest) {
  const username = getUsernameFromReq(req);
  if (!username) {
    return NextResponse.json({ message: 'Username is required' }, { status: 400 });
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM teacher_table WHERE Username = ?',
      [username]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('GET by username error:', error);
    return NextResponse.json({ message: 'Error fetching teacher' }, { status: 500 });
  }
}

// PUT: แก้ไขข้อมูลอาจารย์
export async function PUT(req: NextRequest) {
  const username = getUsernameFromReq(req);
  if (!username) {
    return NextResponse.json({ message: 'Username is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const {
      Prefix,
      F_name,
      L_name,
      Faclty,
      Phone,
      Email,
      Password,
      Role,
    } = body;

    const [result]: any = await pool.query(
      `UPDATE teacher_table SET 
       Prefix = ?, 
       F_name = ?, 
       L_name = ?, 
       Faclty = ?, 
       Phone = ?, 
       Email = ?, 
       Password = ?,
       Role = ?
       WHERE Username = ?`,
      [Prefix, F_name, L_name, Faclty, Phone, Email, Password, Role || 'teacher', username]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Teacher not found or no changes' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Teacher updated' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ message: 'Error updating teacher' }, { status: 500 });
  }
}

// DELETE: ลบข้อมูลอาจารย์ตาม Username
export async function DELETE(req: NextRequest) {
  const username = getUsernameFromReq(req);
  if (!username) {
    return NextResponse.json({ message: 'Username is required' }, { status: 400 });
  }

  try {
    // 1. ค้นหา TeacherID จาก Username
    const [teacherRows]: any = await pool.query(
      'SELECT TeacherID FROM teacher_table WHERE Username = ?',
      [username]
    );

    if (teacherRows.length === 0) {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }
    const teacherId = teacherRows[0].TeacherID;

    // 2. ลบข้อมูลการจองที่เกี่ยวข้องกับ TeacherID นี้ใน book_table
    // การทำเช่นนี้ปลอดภัยกว่า แม้ว่าอาจารย์จะไม่มีการจองก็ตาม
    await pool.query('DELETE FROM book_table WHERE TeacherID = ?', [teacherId]);

    // 3. ลบข้อมูลใน teacher_table
    const [result]: any = await pool.query(
      'DELETE FROM teacher_table WHERE Username = ?',
      [username]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Teacher deleted' });
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json({ message: 'Error deleting teacher: ' + error.message }, { status: 500 });
  }
}
