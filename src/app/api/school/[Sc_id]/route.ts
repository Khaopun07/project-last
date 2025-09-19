import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/app/db/mysql';
import type { ResultSetHeader } from 'mysql2';

// ฟังก์ชันช่วยดึง Sc_id จาก URL path
function getScIdFromReq(req: NextRequest): string | null {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    // สมมติ Sc_id อยู่ใน segment สุดท้าย เช่น /api/school/12345
    const scId = segments[segments.length - 1];
    return scId || null;
  } catch {
    return null;
  }
}

// GET: อ่านข้อมูลโรงเรียนตาม Sc_id
export async function GET(req: NextRequest) {
  const Sc_id = getScIdFromReq(req);
  if (!Sc_id) {
    return NextResponse.json({ message: 'Sc_id is required' }, { status: 400 });
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM School_Table WHERE Sc_id = ?',
      [Sc_id]
    );

    const result = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!result) {
      return NextResponse.json({ message: 'ไม่พบข้อมูลโรงเรียน' }, { status: 404 });
    }

    // ฟอร์แมต Sc_id ให้มี 6 หลัก
    const formattedResult = {
      ...result,
      Sc_id: result.Sc_id.toString().padStart(6, '0'),
    };

    return NextResponse.json(formattedResult);
  } catch (error) {
    console.error('GET by Sc_id error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโรงเรียน' }, { status: 500 });
  }
}

// PUT: แก้ไขข้อมูลโรงเรียนตาม Sc_id
export async function PUT(req: NextRequest) {
  const Sc_id = getScIdFromReq(req);
  if (!Sc_id) {
    return NextResponse.json({ message: 'Sc_id is required' }, { status: 400 });
  }

  try {
    const body = await req.json();

    const {
      Sc_name,
      Sc_address,
      Sc_district,
      Sc_subdistrict,
      Sc_province,
      Sc_postal,
      Sc_phone,
      Sc_email,
      Sc_website,
      Contact_no,
      Contact_name,
      is_approved,
    } = body;

    if (!Sc_name || Sc_name.trim() === '') {
      return NextResponse.json({ message: 'ชื่อโรงเรียนเป็นข้อมูลที่จำเป็น' }, { status: 400 });
    }

    // ตรวจสอบว่ามีโรงเรียนนี้อยู่จริงก่อน
    const [existingSchool]: any = await pool.query(
      'SELECT Sc_id FROM School_Table WHERE Sc_id = ?',
      [Sc_id]
    );

    if (!existingSchool || existingSchool.length === 0) {
      return NextResponse.json({ message: 'ไม่พบข้อมูลโรงเรียน' }, { status: 404 });
    }

    const paramsArray = [
      Sc_name.trim(),
      Sc_address?.trim() || null,
      Sc_district?.trim() || null,
      Sc_subdistrict?.trim() || null,
      Sc_province?.trim() || null,
      Sc_postal?.trim() || null,
      Sc_phone?.trim() || null,
      Sc_email?.trim() || null,
      Sc_website?.trim() || null,
      Contact_no?.trim() || null,
      Contact_name?.trim() || null,
    ];

    if (is_approved !== undefined) {
      paramsArray.push(is_approved ? 1 : 0);
    }

    paramsArray.push(Sc_id);

    const query = `
      UPDATE School_Table SET
        Sc_name = ?,
        Sc_address = ?,
        Sc_district = ?,
        Sc_subdistrict = ?,
        Sc_province = ?,
        Sc_postal = ?,
        Sc_phone = ?,
        Sc_email = ?,
        Sc_website = ?,
        Contact_no = ?,
        Contact_name = ?
        ${is_approved !== undefined ? ', is_approved = ?' : ''}
      WHERE Sc_id = ?
    `;

    const [result] = await pool.query<ResultSetHeader>(query, paramsArray);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'ไม่สามารถอัพเดทข้อมูลได้' }, { status: 400 });
    }

    console.log(`School updated: ID=${Sc_id}, Name=${Sc_name}`);

    return NextResponse.json({
      success: true,
      message: 'อัพเดทข้อมูลโรงเรียนเรียบร้อยแล้ว',
      data: {
        id: Sc_id.toString().padStart(6, '0'),
        name: Sc_name,
      },
    });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' }, { status: 500 });
  }
}

// PATCH: อัปเดต is_approved หรือข้อมูลบางส่วน
export async function PATCH(req: NextRequest) {
  const Sc_id = getScIdFromReq(req);
  if (!Sc_id) {
    return NextResponse.json({ message: 'Sc_id is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { is_approved, admin_note } = body;

    if (is_approved === undefined) {
      return NextResponse.json({ message: 'ข้อมูลการอนุมัติเป็นข้อมูลที่จำเป็น' }, { status: 400 });
    }

    // ตรวจสอบว่าโรงเรียนมีอยู่จริง
    const [existingSchool]: any = await pool.query(
      'SELECT Sc_name, is_approved FROM School_Table WHERE Sc_id = ?',
      [Sc_id]
    );

    if (!existingSchool || existingSchool.length === 0) {
      return NextResponse.json({ message: 'ไม่พบข้อมูลโรงเรียน' }, { status: 404 });
    }

    const schoolName = existingSchool[0].Sc_name;
    const currentStatus = existingSchool[0].is_approved;

    if (currentStatus === (is_approved ? 1 : 0)) {
      const statusText = is_approved ? 'อนุมัติแล้ว' : 'ยังไม่ได้อนุมัติ';
      return NextResponse.json(
        {
          message: `โรงเรียนนี้${statusText}อยู่แล้ว`,
          current_status: currentStatus,
        },
        { status: 409 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `
      UPDATE School_Table SET 
        is_approved = ?,
        admin_note = ?,
        approved_at = CASE WHEN ? = 1 THEN NOW() ELSE NULL END
      WHERE Sc_id = ?
      `,
      [is_approved ? 1 : 0, admin_note || null, is_approved ? 1 : 0, Sc_id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'ไม่สามารถอัพเดทสถานะได้' }, { status: 400 });
    }

    const statusText = is_approved ? 'อนุมัติ' : 'ปฏิเสธ';
    console.log(`School ${statusText}: ID=${Sc_id}, Name=${schoolName}`);

    return NextResponse.json({
      success: true,
      message: `${statusText}โรงเรียน "${schoolName}" เรียบร้อยแล้ว`,
      data: {
        id: Sc_id.toString().padStart(6, '0'),
        name: schoolName,
        is_approved: is_approved,
        previous_status: currentStatus,
      },
    });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการอัพเดทสถานะ' }, { status: 500 });
  }
}

// DELETE: ลบข้อมูลโรงเรียนตาม Sc_id
export async function DELETE(req: NextRequest) {
  const Sc_id = getScIdFromReq(req);
  if (!Sc_id) {
    return NextResponse.json({ message: 'Sc_id is required' }, { status: 400 });
  }

  try {
    // ตรวจสอบว่าโรงเรียนมีอยู่จริงและดึงชื่อมาแสดง
    const [existingSchool]: any = await pool.query(
      'SELECT Sc_name, proposed_by FROM School_Table WHERE Sc_id = ?',
      [Sc_id]
    );

    if (!existingSchool || existingSchool.length === 0) {
      return NextResponse.json({ message: 'ไม่พบข้อมูลโรงเรียน' }, { status: 404 });
    }

    const schoolName = existingSchool[0].Sc_name;
    const proposedBy = existingSchool[0].proposed_by;

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM School_Table WHERE Sc_id = ?',
      [Sc_id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'ไม่สามารถลบข้อมูลได้' }, { status: 400 });
    }

    console.log(`School deleted: ID=${Sc_id}, Name=${schoolName}, ProposedBy=${proposedBy}`);

    return NextResponse.json({
      success: true,
      message: `ลบโรงเรียน "${schoolName}" เรียบร้อยแล้ว`,
      data: {
        id: Sc_id.toString().padStart(6, '0'),
        name: schoolName,
        proposed_by: proposedBy,
      },
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการลบข้อมูล' }, { status: 500 });
  }
}
