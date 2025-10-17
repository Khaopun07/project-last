import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/src/app/db/mysql';
import { Guidance, GuidanceSummary } from '@/src/types/guidance_1';
import { generateActivityReportPDF, generateTeacherReportPDF, generateStudentReportPDF } from '@/src/lib/pdf-generator';

// GET /api/guidance-reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guidanceId = searchParams.get('id');
    const action = searchParams.get('action');
    const reportType = searchParams.get('reportType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (reportType && startDate && endDate) {
      let data;
      let pdfBuffer;

      switch (reportType) {
        case 'activity':
          data = await getActivityReportData(startDate, endDate);
          pdfBuffer = await generateActivityReportPDF(data, startDate, endDate);
          break;
        case 'teacher':
          data = await getTeacherReportData(startDate, endDate);
          pdfBuffer = await generateTeacherReportPDF(data, startDate, endDate);
          break;
        case 'student':
          data = await getStudentReportData(startDate, endDate);
          pdfBuffer = await generateStudentReportPDF(data, startDate, endDate);
          break;
        default:
          return NextResponse.json({ error: 'Invalid report type', success: false }, { status: 400 });
      }

      return new Response(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${reportType}_report_${startDate}_to_${endDate}.pdf"`,
        },
      });
    }

    if (guidanceId) {
      const report = await getGuidanceReport(parseInt(guidanceId));
      if (!report) {
        return NextResponse.json({ error: 'Guidance activity not found', success: false }, { status: 404 });
      }
      return NextResponse.json({ data: report, success: true });
    }

    if (action === 'summary') {
      const summary = await getGuidanceSummary();
      return NextResponse.json({ data: summary, success: true });
    }

    const activities = await getAllGuidanceActivities();
    return NextResponse.json({ data: activities, count: activities.length, success: true });

  } catch (error) {
    console.error('Error in guidance reports API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error', success: false },
      { status: 500 }
    );
  }
}

// ดึงกิจกรรมทั้งหมด (mapped เป็น Guidance)
async function getAllGuidanceActivities(): Promise<Guidance[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT g.GuidanceID, g.study_plan, g.faculty_in_charge, g.professor_in_charge,
           g.guidance_date, g.Start_Time, g.Start_Stop, g.student_count,
           g.school_id, g.counselor_id, g.status, g.Category
    FROM guidance_table g
    ORDER BY g.guidance_date DESC, g.Start_Time ASC
  `);

  return rows.map(row => ({
    GuidanceID: row.GuidanceID,
    study_plan: row.study_plan,
    faculty_in_charge: row.faculty_in_charge,
    professor_in_charge: row.professor_in_charge,
    guidance_date: row.guidance_date,
    Start_Time: row.Start_Time,
    Start_Stop: row.Start_Stop,
    student_count: Number(row.student_count),
    school_id: Number(row.school_id),
    counselor_id: Number(row.counselor_id),
    status: row.status,
    Category: row.Category
  }));
}

// ดึงสรุปสถิติ (mapped เป็น GuidanceSummary)
async function getGuidanceSummary(): Promise<GuidanceSummary> {
  const [[{ totalActivities }]] = await pool.execute<RowDataPacket[]>(`SELECT COUNT(*) AS totalActivities FROM guidance_table`);
  const [[{ totalStudents }]] = await pool.execute<RowDataPacket[]>(`SELECT SUM(student_count) AS totalStudents FROM guidance_table`);
  const [[{ totalSchools }]] = await pool.execute<RowDataPacket[]>(`SELECT COUNT(DISTINCT school_id) AS totalSchools FROM guidance_table`);

  // status breakdown
  const [statusRows] = await pool.execute<RowDataPacket[]>(`SELECT status, COUNT(*) AS count FROM guidance_table GROUP BY status`);

  return {
    summary: {
      totalActivities: Number(totalActivities),
      totalStudents: Number(totalStudents),
      totalSchools: Number(totalSchools)
    },
    statusBreakdown: statusRows.map(row => ({
      status: row.status,
      count: Number(row.count)
    }))
  };
}

// ดึงรายงานกิจกรรมเฉพาะ
async function getGuidanceReport(guidanceId: number) {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT * FROM guidance_table WHERE GuidanceID = ?
  `, [guidanceId]);

  if (rows.length === 0) return null;
  const activity: Guidance = {
    GuidanceID: rows[0].GuidanceID,
    study_plan: rows[0].study_plan,
    faculty_in_charge: rows[0].faculty_in_charge,
    professor_in_charge: rows[0].professor_in_charge,
    guidance_date: rows[0].guidance_date,
    Start_Time: rows[0].Start_Time,
    Start_Stop: rows[0].Start_Stop,
    student_count: Number(rows[0].student_count),
    school_id: Number(rows[0].school_id),
    counselor_id: Number(rows[0].counselor_id),
    status: rows[0].status,
    Category: rows[0].Category
  };

  return activity;
}

async function getActivityReportData(startDate: string, endDate: string): Promise<any[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT g.GuidanceID, g.guidance_date, s.Sc_name, g.student_count
    FROM guidance_table g
    JOIN school_table s ON g.school_id = s.Sc_id
    WHERE g.guidance_date BETWEEN ? AND ?
    ORDER BY g.guidance_date ASC
  `, [startDate, endDate]);
  return rows;
}

async function getTeacherReportData(startDate: string, endDate: string): Promise<any[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT DISTINCT t.Username, t.F_name, t.L_name, s.Sc_name
    FROM teacher_table t
    JOIN book_table b ON t.TeacherID = b.TeacherID
    JOIN guidance_table g ON b.GuidanceID = g.GuidanceID
    JOIN school_table s ON g.school_id = s.Sc_id
    WHERE g.guidance_date BETWEEN ? AND ?
    ORDER BY s.Sc_name, t.F_name
  `, [startDate, endDate]);
  return rows;
}

async function getStudentReportData(startDate: string, endDate: string): Promise<any[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT g.guidance_date, s.Sc_name, b.Std_ID1, b.Std_name1, b.Std_ID2, b.Std_name2
    FROM book_table b
    JOIN guidance_table g ON b.GuidanceID = g.GuidanceID
    JOIN school_table s ON g.school_id = s.Sc_id
    WHERE g.guidance_date BETWEEN ? AND ?
  `, [startDate, endDate]);

  const students: any[] = [];
  rows.forEach(row => {
    if (row.Std_ID1 && row.Std_name1) {
      students.push({
        guidance_date: row.guidance_date,
        Sc_name: row.Sc_name,
        name: row.Std_name1,
        lastname: ''
      });
    }
    if (row.Std_ID2 && row.Std_name2) {
      students.push({
        guidance_date: row.guidance_date,
        Sc_name: row.Sc_name,
        name: row.Std_name2,
        lastname: ''
      });
    }
  });

  return students;
}
