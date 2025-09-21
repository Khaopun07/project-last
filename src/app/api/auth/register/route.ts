import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/app/db/mysql';
import { hashPassword } from '@/src/lib/auth';

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request Body:', body);

    const role = body.role?.toLowerCase();

    if (!role || !['officer', 'teacher'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    if (role === 'officer') {
      let {
        username,
        fname = '',
        lname = '',
        Off_Position = '',
        email,
        phone = '',
        password,
      } = body;

      username = username?.trim();
      fname = fname.trim();
      lname = lname.trim();
      Off_Position = Off_Position.trim();
      email = email?.trim().toLowerCase();
      phone = phone.trim();
      password = password?.trim();

      if (!username) {
        return NextResponse.json({ message: 'Username is required' }, { status: 400 });
      }
      if (!email || !isValidEmail(email)) {
        return NextResponse.json({ message: 'Valid email is required' }, { status: 400 });
      }
      if (!password) {
        return NextResponse.json({ message: 'Password is required' }, { status: 400 });
      }

      const hashed = await hashPassword(password);

      const [result] = await pool.query(
        `INSERT INTO officer_table 
         (Username, Off_Fname, Off_Lname, Off_Position, Off_Email, Off_Phone, Off_Password) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, fname, lname, Off_Position, email, phone, hashed]
      );

      console.log('Officer Insert Result:', result);
    }

    if (role === 'teacher') {
      let {
        username,
        prefix = '',
        fname = '',
        lname = '',
        Faclty = '',
        phone = '',
        email,
        password,
      } = body;

      username = username?.trim();
      prefix = prefix.trim();
      fname = fname.trim();
      lname = lname.trim();
      Faclty = Faclty.trim();
      phone = phone.trim();
      email = email?.trim().toLowerCase();
      password = password?.trim();

      if (!username) {
        return NextResponse.json({ message: 'Username is required' }, { status: 400 });
      }
      if (!email || !isValidEmail(email)) {
        return NextResponse.json({ message: 'Valid email is required' }, { status: 400 });
      }
      if (!password) {
        return NextResponse.json({ message: 'Password is required' }, { status: 400 });
      }

      const hashed = await hashPassword(password);

      const [result] = await pool.query(
        `INSERT INTO teacher_table 
         (Username, Prefix, F_name, L_name, Faclty, Phone, Email, Password) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, prefix, fname, lname, Faclty, phone, email, hashed]
      );

      console.log('Teacher Insert Result:', result);
    }

    return NextResponse.json({ message: 'Registered successfully' });
  } catch (error: any) {
    console.error('Registration Error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Username or Email already exists' }, { status: 409 });
    }

    return NextResponse.json(
      { message: 'Error registering user', error: error.message },
      { status: 500 }
    );
  }
}
