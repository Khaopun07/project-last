// /src/app/api/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/app/db/mysql';

export async function POST(request: NextRequest) {
  try {
    const { schoolId, isApproved } = await request.json();

    if (!schoolId || typeof isApproved !== 'boolean') {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    const [result] = await pool.query(
      'UPDATE school_table SET is_approved = ? WHERE Sc_id = ?',
      [isApproved ? 1 : 0, schoolId]
    );

    // ตรวจสอบว่าอัพเดตสำเร็จ
    // @ts-ignore
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'ไม่พบโรงเรียนที่ต้องการแก้ไข' }, { status: 404 });
    }

    return NextResponse.json({ message: 'อนุมัติเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error in approve API:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
