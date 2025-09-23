import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import pool from '@/src/app/db/mysql';


// ✅ GET: อ่านข้อมูลโรงเรียนทั้งหมด หรือกรองตามผู้เสนอ (proposedBy)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const proposedBy = url.searchParams.get('proposedBy');
    const isApprovedParam = url.searchParams.get('is_approved');

    let sql = 'SELECT * FROM school_table';
    const conditions: string[] = [];
    const params: any[] = [];

    if (proposedBy) {
      conditions.push('proposed_by = ?');
      params.push(proposedBy);
    }

    if (isApprovedParam !== null) {
      const isApproved = isApprovedParam === 'true' || isApprovedParam === '1';
      conditions.push('is_approved = ?');
      params.push(isApproved ? 1 : 0);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY Sc_id DESC';

    const [rows]: any = await pool.query(sql, params);

    const formattedRows = rows.map((row: any) => ({
      ...row,
      Sc_id: row.Sc_id.toString().padStart(6, '0'),
    }));

    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'Error fetching schools' }, { status: 500 });
  }
}

// ✅ POST: สร้างข้อมูลโรงเรียนใหม่ พร้อมบันทึก proposed_by
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      Sc_name,
      Sc_address,
      Sc_district,
      Sc_subdistrict,   // ✅ เพิ่ม
      Sc_province,
      Sc_postal,
      Sc_phone,
      Sc_email,
      Sc_website,
      Contact_no,
      Contact_name,
      is_approved = false,
      proposed_by,
    } = body;

    if (!Sc_name || Sc_name.trim() === '') {
      return NextResponse.json(
        { message: 'ชื่อโรงเรียนเป็นข้อมูลที่จำเป็น' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO school_table 
      (Sc_name, Sc_address, Sc_district, Sc_subdistrict, Sc_province, Sc_postal, Sc_phone, Sc_email, Sc_website, Contact_no, Contact_name, is_approved, proposed_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Sc_name.trim(),
        Sc_address?.trim() || null,
        Sc_district?.trim() || null,
        Sc_subdistrict?.trim() || null, // ✅ เพิ่ม
        Sc_province?.trim() || null,
        Sc_postal?.trim() || null,
        Sc_phone?.trim() || null,
        Sc_email?.trim() || null,
        Sc_website?.trim() || null,
        Contact_no?.trim() || null,
        Contact_name?.trim() || null,
        is_approved ? 1 : 0,
        proposed_by || null,
      ]
    );

    const paddedId = result.insertId.toString().padStart(6, '0');

    return NextResponse.json({
      success: true,
      message: 'เสนอข้อมูลโรงเรียนเรียบร้อยแล้ว',
      data: {
        id: paddedId,
        name: Sc_name,
        proposed_by: proposed_by
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูลโรงเรียน', error: error.message },
      { status: 500 }
    );
  }
}
