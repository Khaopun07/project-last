import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '@/src/app/db/mysql';

// ✅ GET: อ่านข้อมูลการจองทั้งหมด
export async function GET() {
  try {
    const sql = `
      SELECT 
        b.Book_ID, b.GuidanceID, b.T_PickupPoint, b.T_Phone,
        b.Std_ID1, b.Std_name1, b.Std_ID2, b.Std_name2,
        g.guidance_date,
        s.Sc_name,
        t.F_name, t.L_name
      FROM book_table b
      LEFT JOIN guidance_table g ON b.GuidanceID = g.GuidanceID
      LEFT JOIN school_table s ON g.school_id = s.Sc_id
      LEFT JOIN teacher_table t ON b.TeacherID = t.TeacherID

      ORDER BY b.Book_ID DESC;
    `;

    const [rows] = await pool.query<RowDataPacket[]>(sql);

    const formattedRows = rows.map(row => ({
      ...row,
      Book_ID: row.Book_ID?.toString().padStart(6, '0') || '000000',
    }));

    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
  }
}

// ✅ POST: เพิ่มการจอง (แก้ไขส่วน validation และเพิ่มการตรวจสอบวันเวลาทับซ้อน)
export async function POST(req: NextRequest) {
  try {
    const {
      GuidanceID,
      TeacherID,
      T_PickupPoint,
      T_Phone,
      Std_ID1,
      Std_name1,
      Std_ID2,
      Std_name2,
    } = await req.json();

    console.log('📥 Request Data:', { 
      GuidanceID, 
      TeacherID, 
      TeacherID_type: typeof TeacherID,
      T_PickupPoint, 
      T_Phone 
    });

    // ตรวจสอบค่า required
    if (!GuidanceID?.toString().trim()) {
      return NextResponse.json({ message: 'GuidanceID ไม่สามารถว่างได้' }, { status: 400 });
    }

    // แก้ไข validation TeacherID ให้ดีขึ้น
    if (!TeacherID || TeacherID === '' || TeacherID === 0 || TeacherID === '0') {
      return NextResponse.json({ 
        message: 'TeacherID ต้องมีค่า',
        debug: {
          received: TeacherID,
          type: typeof TeacherID,
          suggestion: 'ตรวจสอบว่า Frontend ส่ง TeacherID มาหรือไม่'
        }
      }, { status: 400 });
    }

    if (!T_PickupPoint?.toString().trim()) {
      return NextResponse.json({ message: 'กรุณาระบุจุดรับส่ง' }, { status: 400 });
    }
    if (!T_Phone?.toString().trim()) {
      return NextResponse.json({ message: 'กรุณาระบุเบอร์โทรศัพท์' }, { status: 400 });
    }

    // ตรวจสอบ guidance
    const [guidanceRows] = await pool.query<RowDataPacket[]>(
      'SELECT GuidanceID, study_plan, school_id, guidance_date FROM guidance_table WHERE GuidanceID = ?',
      [GuidanceID]
    );
    if (guidanceRows.length === 0) {
      return NextResponse.json({ message: 'ไม่พบข้อมูลกิจกรรมแนะแนว' }, { status: 404 });
    }
    const guidance = guidanceRows[0];

    // ตรวจสอบอาจารย์
    const [teacherRows] = await pool.query<RowDataPacket[]>(
      'SELECT TeacherID, F_name, L_name, Email FROM teacher_table WHERE TeacherID = ?',
      [TeacherID]
    );
    
    if (teacherRows.length === 0) {
      return NextResponse.json({ 
        message: `ไม่พบข้อมูลอาจารย์ที่มี TeacherID: ${TeacherID}`,
        debug: {
          searchedTeacherID: TeacherID,
          suggestion: 'ตรวจสอบว่า TeacherID นี้มีอยู่ในฐานข้อมูลหรือไม่'
        }
      }, { status: 404 });
    }
    const teacher = teacherRows[0];

    // ตรวจสอบการจองซ้ำ - กิจกรรมเดียวกัน
    const [existingBooking] = await pool.query<RowDataPacket[]>(
      'SELECT Book_ID FROM book_table WHERE GuidanceID = ? AND TeacherID = ?',
      [GuidanceID, TeacherID]
    );
    if (existingBooking.length > 0) {
      return NextResponse.json({
        message: 'คุณได้ทำการจองกิจกรรมนี้แล้ว',
        bookingId: existingBooking[0].Book_ID
      }, { status: 409 });
    }

    // 🔥 ตรวจสอบการจองที่ทับซ้อนกันในวันและเวลาเดียวกัน
    const [conflictBookings] = await pool.query<RowDataPacket[]>(
      `SELECT 
         b.Book_ID, 
         g.guidance_date, 
         s.Sc_name,
         DATE_FORMAT(g.guidance_date, '%d/%m/%Y เวลา %H:%i น.') as formatted_date
       FROM book_table b
       LEFT JOIN guidance_table g ON b.GuidanceID = g.GuidanceID
       LEFT JOIN school_table s ON g.school_id = s.Sc_id
       WHERE b.TeacherID = ? 
       AND DATE(g.guidance_date) = DATE((SELECT guidance_date FROM guidance_table WHERE GuidanceID = ?))
       AND TIME(g.guidance_date) = TIME((SELECT guidance_date FROM guidance_table WHERE GuidanceID = ?))`,
      [TeacherID, GuidanceID, GuidanceID]
    );
    
    if (conflictBookings.length > 0) {
      const conflictInfo = conflictBookings[0];
      return NextResponse.json({
        message: `ไม่สามารถจองได้ เนื่องจากคุณมีการจองในวันและเวลาเดียวกันแล้ว`,
        errorType: 'DATE_CONFLICT',
        conflictDetails: {
          existingBookingId: conflictInfo.Book_ID?.toString().padStart(6, '0'),
          conflictDate: conflictInfo.formatted_date,
          conflictSchool: conflictInfo.Sc_name,
          message: `คุณได้จองไปแล้วที่ โรงเรียน${conflictInfo.Sc_name} ในวันที่ ${conflictInfo.formatted_date}`,
          suggestion: 'กรุณาเลือกกิจกรรมในวันเวลาอื่น หรือยกเลิกการจองเดิมก่อน'
        }
      }, { status: 409 });
    }

    // Insert booking
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO book_table
       (GuidanceID, TeacherID, T_PickupPoint, T_Phone, Std_ID1, Std_name1, Std_ID2, Std_name2)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        GuidanceID,
        TeacherID,
        T_PickupPoint,
        T_Phone,
        Std_ID1?.toString().trim() || null,
        Std_name1?.toString().trim() || null,
        Std_ID2?.toString().trim() || null,
        Std_name2?.toString().trim() || null
      ]
    );

    const insertId = (result.insertId as number | undefined) ?? 0;

    // Format guidance date for response
    const formattedGuidanceDate = guidance.guidance_date ? 
      new Date(guidance.guidance_date).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'ไม่ระบุ';

    return NextResponse.json({
      message: 'เพิ่มรายการจองเรียบร้อยแล้ว',
      bookingId: insertId.toString().padStart(6, '0'),
      bookingDetails: {
        guidanceId: GuidanceID,
        schoolId: guidance.school_id,
        studyPlan: guidance.study_plan,
        guidanceDate: formattedGuidanceDate,
        teacher: `${teacher.F_name} ${teacher.L_name}`,
        pickupPoint: T_PickupPoint,
        phone: T_Phone,
        students: [
          ...(Std_ID1 && Std_name1 ? [{ id: Std_ID1, name: Std_name1 }] : []),
          ...(Std_ID2 && Std_name2 ? [{ id: Std_ID2, name: Std_name2 }] : [])
        ]
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}