import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/app/db/mysql';
import { comparePassword } from '@/src/lib/auth';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // ✅ 1. Officer
    const [officerRows]: any = await pool.query('SELECT * FROM officer_table WHERE Off_Email = ?', [email]);

    if (officerRows.length > 0) {
      const user = officerRows[0];
      const isMatch = await comparePassword(password, user.Off_Password);
      if (!isMatch) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

      // 🔥 เพิ่ม ID ใน JWT token
      const token = jwt.sign({ 
        id: user.Off_ID,         // เพิ่ม ID
        email: user.Off_Email, 
        role: 'officer' 
      }, SECRET, { expiresIn: '1d' });

      const response = NextResponse.json({
        role: 'officer',
        token,
        user: {
          Off_ID: user.Off_ID,     // 🔥 เพิ่ม ID ใน response
          Off_Fname: user.Off_Fname,
          Off_Lname: user.Off_Lname,
          Off_Email: user.Off_Email, // เพิ่ม Email ด้วย
        }
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return response;
    }

    // ✅ 2. Teacher - แก้ไขให้ตรงกับโครงสร้างฐานข้อมูล
    const [teacherRows]: any = await pool.query('SELECT * FROM teacher_table WHERE Email = ?', [email]);

    if (teacherRows.length > 0) {
      const user = teacherRows[0];
      const isMatch = await comparePassword(password, user.Password);
      if (!isMatch) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });

      // 🔥 แก้ไข: ใช้ TeacherID แทน Teacher_ID (ตรงกับชื่อ column จริง)
      const token = jwt.sign({ 
        id: user.TeacherID,      // แก้ไข: ใช้ TeacherID
        email: user.Email, 
        role: 'teacher' 
      }, SECRET, { expiresIn: '1d' });

      const response = NextResponse.json({
        role: 'teacher',
        token,
        user: {
          TeacherID: user.TeacherID,    // 🔥 แก้ไข: ใช้ TeacherID
          Username: user.Username,
          Prefix: user.Prefix,          // เพิ่ม Prefix
          F_name: user.F_name,
          L_name: user.L_name,
          Faculty: user.Faclty,         // Note: ใช้ Faclty ตามที่มีในฐานข้อมูล (มี typo)
          Phone: user.Phone,            // เพิ่ม Phone
          Email: user.Email,
          Role: user.Role               // เพิ่ม Role
        }
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ message: 'User not found' }, { status: 404 });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login error', error: error.message }, { status: 500 });
  }
}