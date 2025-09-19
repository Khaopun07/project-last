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

// GET: อ่านเจ้าหน้าที่ตาม username
export async function GET(req: NextRequest) {
  const username = getUsernameFromReq(req);
  if (!username) {
    return NextResponse.json({ message: 'Username is required' }, { status: 400 });
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM officer_table WHERE Username = ?',
      [username]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'Officer not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('GET by username error:', error);
    return NextResponse.json({ message: 'Error fetching officer' }, { status: 500 });
  }
}

// PUT: แก้ไขข้อมูลเจ้าหน้าที่
export async function PUT(req: NextRequest) {
  const username = getUsernameFromReq(req);
  if (!username) {
    return NextResponse.json({ message: 'Username is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const {
      Off_Fname,
      Off_Lname,
      Off_Position,
      Off_Email,
      Off_Phone,
      Off_Password,
      Role,
    } = body;

    const [result]: any = await pool.query(
      `UPDATE officer_table SET 
       Off_Fname = ?, 
       Off_Lname = ?, 
       Off_Position = ?, 
       Off_Email = ?, 
       Off_Phone = ?, 
       Off_Password = ?,
       Role = ?
       WHERE Username = ?`,
      [
        Off_Fname,
        Off_Lname,
        Off_Position,
        Off_Email,
        Off_Phone,
        Off_Password,
        Role || 'officer',
        username,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Officer not found or no changes' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Officer updated' });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ message: 'Error updating officer' }, { status: 500 });
  }
}

// DELETE: ลบเจ้าหน้าที่ตาม username
export async function DELETE(req: NextRequest) {
  const username = getUsernameFromReq(req);
  if (!username) {
    return NextResponse.json({ message: 'Username is required' }, { status: 400 });
  }

  try {
    const [result]: any = await pool.query(
      'DELETE FROM officer_table WHERE Username = ?',
      [username]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Officer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Officer deleted' });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ message: 'Error deleting officer' }, { status: 500 });
  }
}
