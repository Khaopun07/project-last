// src/types/guidance.ts
export interface Officer {
  id: number;
  Username: string;
  Off_Fname: string;
  Off_Lname: string;
  Off_Position: string;
  Off_Email: string;
  Off_Phone: string;
  Role: string;
}

export interface Teacher {
  TeacherID: number;
  Username: string;
  Prefix: string;
  F_name: string;
  L_name: string;
  Faclty: string;
  Phone: string;
  Email: string;
  Role: string;
}

export interface School {
  Sc_id: number;
  Sc_name: string;
  Sc_address: string;
  Sc_district: string;
  Sc_province: string;
  Sc_postal: string;
  Sc_phone: string;
  Sc_email: string;
  Sc_website: string;
  Contact_no: string;
  Contact_name: string;
  is_approved: boolean;
  proposed_by: string;
}

export interface Guidance {
  GuidanceID: number;
  guidance_date: string;
  school_id: number;
  counselor_id: string;
  student_count: number;
  study_plan: string;
  faculty_in_charge: string;
  professor_in_charge: string;
  Category: 'ในนามคณะ' | 'ในนามยังสมาร์ท' | 'ในนามมหาวิทยาลัย';
  status: 'เปิดรับ' | 'ปิดรับ' | 'เสร็จสิ้น';
  Start_Time: string;
  Start_Stop: string;
  car_type?: string;
  car_registration?: string;
  number_seats?: number;
  car_phone?: string;  
}

export interface BookTable {
  GuidanceID: number;
  TeacherID: number;
  Book_ID: number;
  T_PickupPoint: string;
  T_Phone: string;
  Std_ID1: string;
  Std_name1: string;
  Std_ID2: string;
  Std_name2: string;
}

export type BookingWithTeacherInfo = BookTable & Partial<Teacher>;

export interface GuidanceReport {
  guidance: Guidance;
  school: School;
  teacher: Teacher;
  bookings: BookingWithTeacherInfo[];
  participants: {
    students: Array<{ id: string; name: string; }>;
    totalStudents: number;
    totalTeachers: number;
  };
}

export interface PDFReportData {
  guidanceInfo: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    category: string;
    status: string;
    studyPlan: string;
    facultyInCharge: string;
    professorInCharge: string;
    car_registration: string;
    number_seats: string;
    car_type: string;
    car_phone: string;
  };
  schoolInfo: {
    name: string;
    address: string;
    district: string;
    province: string;
    postal: string;
    phone: string;
    email: string;
    contactName: string;
    contactNo: string;
  };
  participants: {
    teachers: Array<{ name: string; phone: string; pickupPoint: string; }>;
    students: Array<{ id: string; name: string; }>;
    vehicles: Array<{ type: string; license: string; seats: string | number; phone: string; }>;
  };
  summary: {
    totalStudents: number;
    totalTeachers: number;
    totalParticipants: number;
  };
}