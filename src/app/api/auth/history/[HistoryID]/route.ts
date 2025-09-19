// src/app/api/history/[HistoryID]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/src/app/db/mysql";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// ฟังก์ชันช่วยแปลง HistoryID
const parseHistoryID = (id: string | undefined): number | null => {
  if (!id) return null;
  const num = parseInt(id, 10);
  return isNaN(num) ? null : num;
};

// ดึง HistoryID จาก URL Path
function getHistoryIDFromReq(req: NextRequest): number | null {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    return parseHistoryID(lastSegment);
  } catch {
    return null;
  }
}

// GET /api/history/:HistoryID
export async function GET(req: NextRequest) {
  try {
    const historyID = getHistoryIDFromReq(req);
    if (!historyID) {
      return NextResponse.json({ error: "Invalid HistoryID" }, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM history_table WHERE HistoryID = ?",
      [historyID]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "History not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/history/:HistoryID
export async function PUT(req: NextRequest) {
  try {
    const historyID = getHistoryIDFromReq(req);
    if (!historyID) {
      return NextResponse.json({ error: "Invalid HistoryID" }, { status: 400 });
    }

    const body = await req.json();

    const query = `
      UPDATE history_table SET
        Book_ID = ?, GuidanceID = ?, TeacherID = ?,
        Std_ID1 = ?, Std_name1 = ?, Std_ID2 = ?, Std_name2 = ?,
        T_PickupPoint = ?, T_Phone = ?,
        Sc_id = ?, Sc_name = ?, Sc_address = ?, Sc_district = ?, Sc_subdistrict = ?,
        Sc_province = ?, Sc_postal = ?, Sc_phone = ?, is_approved = ?, proposed_by = ?
      WHERE HistoryID = ?
    `;

    const values = [
      body.Book_ID, body.GuidanceID, body.TeacherID,
      body.Std_ID1, body.Std_name1, body.Std_ID2, body.Std_name2,
      body.T_PickupPoint, body.T_Phone,
      body.Sc_id, body.Sc_name, body.Sc_address, body.Sc_district,
      body.Sc_subdistrict, body.Sc_province, body.Sc_postal, body.Sc_phone,
      body.is_approved ?? 0,
      body.proposed_by ?? null,
      historyID,
    ];

    const [result] = await pool.query<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "History not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "History updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/history/:HistoryID
export async function DELETE(req: NextRequest) {
  try {
    const historyID = getHistoryIDFromReq(req);
    if (!historyID) {
      return NextResponse.json({ error: "Invalid HistoryID" }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM history_table WHERE HistoryID = ?",
      [historyID]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "History not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "History deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
