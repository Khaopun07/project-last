import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from '@/src/app/db/mysql';
import { Guidance, GuidanceSummary } from '@/src/types/guidance_1';

// GET /api/guidance-reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guidanceId = searchParams.get('id');
    const action = searchParams.get('action');

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
