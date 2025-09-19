// src/app/api/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/src/app/db/mysql"; // ใช้ pool ที่คุณมีอยู่แล้ว
import { ResultSetHeader, RowDataPacket } from "mysql2";

// GET /api/history  → ดึงทั้งหมด
export async function GET() {
  try {
    // 1. Get all bookings with related teacher info
    const [bookings] = await pool.query<RowDataPacket[]>(`
      SELECT 
        b.Book_ID, b.GuidanceID, b.T_PickupPoint, b.T_Phone,
        b.Std_ID1, b.Std_name1, b.Std_ID2, b.Std_name2,
        t.TeacherID, t.Username
      FROM book_table b
      LEFT JOIN teacher_table t ON b.TeacherID = t.TeacherID
      ORDER BY b.Book_ID DESC
    `);

    // 2. Get all proposed schools
    const [proposedSchools] = await pool.query<RowDataPacket[]>(`
      SELECT 
        Sc_id, Sc_name, Sc_address, Sc_district, Sc_subdistrict, Sc_province, 
        Sc_postal, Sc_phone, Sc_email, Sc_website,
        Contact_name, Contact_no, is_approved, proposed_by 
      FROM school_table 
      ORDER BY Sc_id DESC
    `);

    // 3. Return both datasets in a single object
    return NextResponse.json({
      bookings: bookings,
      proposedSchools: proposedSchools,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/history  → เพิ่ม record ใหม่
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const query = `
  INSERT INTO history_table 
  (Book_ID, GuidanceID, TeacherID, Std_ID1, Std_name1, Std_ID2, Std_name2,
   T_PickupPoint, T_Phone, Sc_id, Sc_name, Sc_address, Sc_district, Sc_subdistrict,
   Sc_province, Sc_postal, Sc_phone, is_approved, proposed_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const values = [
  body.Book_ID, body.GuidanceID, body.TeacherID,
  body.Std_ID1, body.Std_name1, body.Std_ID2, body.Std_name2,
  body.T_PickupPoint, body.T_Phone,
  body.Sc_id, body.Sc_name, body.Sc_address, body.Sc_district,
  body.Sc_subdistrict, body.Sc_province, body.Sc_postal, body.Sc_phone,
  body.is_approved ?? 0,
  body.proposed_by ?? null
];


    const [result] = await pool.query<ResultSetHeader>(query, values);

    return NextResponse.json({ message: "History created", HistoryID: result.insertId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
