// app/api/officer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import pool from '@/src/app/db/mysql';

// ✅ GET: อ่านเจ้าหน้าที่ทั้งหมด
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM officer_table');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'Error fetching officer' }, { status: 500 });
  }
}

// ✅ POST: สร้างเจ้าหน้าที่ใหม่
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      Username,
      Off_Fname,
      Off_Lname,
      Off_Position,
      Off_Email,
      Off_Phone,
      Off_Password,
      Role, // เพิ่มรับ role จาก body เผื่อกรณีต้องการ override
    } = body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!Off_Email || !Off_Password) {
      return NextResponse.json({ message: 'Email and Password are required' }, { status: 400 });
    }

    // ถ้าจะเข้ารหัสรหัสผ่าน (optional)
    // import bcrypt from 'bcryptjs';
    // const hashedPassword = await bcrypt.hash(Off_Password, 10);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO officer_table 
      (Username, Off_Fname, Off_Lname, Off_Position, Off_Email, Off_Phone, Off_Password, Role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Username,
        Off_Fname,
        Off_Lname,
        Off_Position,
        Off_Email,
        Off_Phone,
        Off_Password, // หรือ hashedPassword ถ้าทำ hashing
        Role || 'officer', // หากไม่ส่งมา ใช้ default 'officer'
      ]
    );

    return NextResponse.json({ message: 'Officer created', id: result.insertId });
  } catch (error: any) {
    console.error('POST error:', error);

    // ตรวจสอบ error ถ้าเป็น duplicate email
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    return NextResponse.json({ message: 'Error creating officer' }, { status: 500 });
  }
}
