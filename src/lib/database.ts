import pool from '@/src/app/db/mysql';
import { Guidance, School, BookTable, GuidanceReport, Teacher, BookingWithTeacherInfo } from '@/src/types/guidance';

// ฟังก์ชันดึง report ของ guidance
export async function getGuidanceReport(guidanceId: number): Promise<GuidanceReport | null> {
  try {
    // ดึง guidance
    const [guidanceRows] = await pool.execute(`SELECT * FROM guidance_table WHERE GuidanceID = ?`, [guidanceId]);
    if (!Array.isArray(guidanceRows) || guidanceRows.length === 0) return null;
    const guidance = guidanceRows[0] as Guidance;

    // ดึง school
    const [schoolRows] = await pool.execute(`SELECT * FROM school_table WHERE Sc_id = ?`, [guidance.school_id]);
    const school = (schoolRows as School[])[0];

    // ดึง bookings + teachers
    const [bookingRows] = await pool.execute(`
      SELECT bt.*, tt.TeacherID, tt.Username, tt.Prefix, tt.F_name, tt.L_name, tt.Faclty, tt.Phone, tt.Email, tt.Role
      FROM book_table bt
      LEFT JOIN teacher_table tt ON bt.TeacherID = tt.TeacherID
      WHERE bt.GuidanceID = ?
    `, [guidanceId]);

    const bookings = bookingRows as BookingWithTeacherInfo[];

    // Map bookings และเตรียม students + teachers
    const students: { id: string; name: string }[] = [];
    const teacherMap = new Map<string, Teacher>();

    bookings.forEach(b => {
      // Students
      if (b.Std_ID1 && b.Std_name1) students.push({ id: b.Std_ID1, name: b.Std_name1 });
      if (b.Std_ID2 && b.Std_name2) students.push({ id: b.Std_ID2, name: b.Std_name2 });

      // Teachers
      if (b.TeacherID && !teacherMap.has(b.TeacherID.toString())) {
        teacherMap.set(b.TeacherID.toString(), {
          TeacherID: b.TeacherID,
          Username: b.Username || '',
          Prefix: b.Prefix || '',
          F_name: b.F_name || '',
          L_name: b.L_name || '',
          Faclty: b.Faclty || '',
          Phone: b.Phone || '',
          Email: b.Email || '',
          Role: b.Role || '',
        });
      }
    });

    const teachers = Array.from(teacherMap.values());

    // ถ้าไม่มีครูใด ให้สร้าง default teacher object (type ต้องไม่ null)
    const mainTeacher: Teacher = teachers[0] || {
      TeacherID: 0,
      Username: '',
      Prefix: '',
      F_name: '',
      L_name: '',
      Faclty: '',
      Phone: '',
      Email: '',
      Role: '',
    };

    return {
      guidance,
      school,
      bookings,
      teacher: mainTeacher,
      participants: {
        students,
        totalStudents: students.length,
        totalTeachers: teachers.length
      }
    };

  } catch (error) {
    console.error('Error fetching guidance report:', error);
    throw new Error('Failed to fetch guidance report');
  }
}
