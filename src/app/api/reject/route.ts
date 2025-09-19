// /src/app/api/schools/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/app/db/mysql';

export async function POST(request: NextRequest) {
  try {
    const { schoolId } = await request.json();

    if (!schoolId) {
      return NextResponse.json({ error: 'Missing schoolId' }, { status: 400 });
    }

    // สมมติว่าการปฏิเสธคือการลบข้อมูลโรงเรียน (ถ้าต้องการเปลี่ยนเป็น update ก็บอกได้ครับ)
    const [result] = await pool.query(
      'DELETE FROM school_table WHERE Sc_id = ?',
      [schoolId]
    );

    // @ts-ignore
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'ไม่พบโรงเรียนที่ต้องการลบ' }, { status: 404 });
    }

    return NextResponse.json({ message: 'ปฏิเสธและลบโรงเรียนเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error in reject API:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
