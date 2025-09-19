// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import pool from '@/src/app/db/mysql';

export async function GET() {
  try {
    // ทดสอบ query แค่ 1 รายการ
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('Database เชื่อมต่อแล้วเรียบร้อย');
    return NextResponse.json({ success: true, result: rows });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
