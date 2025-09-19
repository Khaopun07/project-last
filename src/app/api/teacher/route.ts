// app/api/teacher/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import pool from '@/src/app/db/mysql'; // ปรับ path ให้ตรงกับของคุณ

// ✅ GET: อ่านข้อมูลอาจารย์ทั้งหมด
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM teacher_table');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'Error fetching teacher' }, { status: 500 });
  }
}

// ✅ POST: สร้างข้อมูลอาจารย์ใหม่
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      Username,
      Prefix,
      F_name,
      L_name,
      Faclty,
      Phone,
      Email,
      Password,
      Role, // ✅ เพิ่มรับ Role จาก body (optional)
    } = body;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO teacher_table 
      (Username, Prefix, F_name, L_name, Faclty, Phone, Email, Password, Role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Username,
        Prefix,
        F_name,
        L_name,
        Faclty,
        Phone,
        Email,
        Password,
        Role || 'teacher', // ✅ หากไม่ได้ส่งมา ใช้ 'teacher' เป็น default
      ]
    );

    return NextResponse.json({ message: 'Teacher created', id: result.insertId });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ message: 'Error creating teacher' }, { status: 500 });
  }
}
