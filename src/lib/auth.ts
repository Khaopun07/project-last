import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "mysecret";

/* ===================== 🔑 JWT ===================== */

// ✅ ตรวจสอบ token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
  } catch (err) {
    throw new Error("Invalid token");
  }
}

// ✅ สร้าง token (ใช้ตอน login สำเร็จ)
export function signToken(payload: { userId: string; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); // กำหนดอายุ token 7 วัน
}

/* ===================== 🔒 Password ===================== */

// ✅ Hash password ก่อนเก็บ DB
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// ✅ เปรียบเทียบ password ตอน login
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
