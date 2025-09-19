// src/types/guidance_1.ts
export interface Guidance { 
  GuidanceID: number; 
  study_plan: string; 
  faculty_in_charge: string; 
  professor_in_charge: string; 
  guidance_date: string; 
  Start_Time: string; 
  Start_Stop: string; 
  student_count: number; 
  school_id: number; 
  counselor_id: number; 
  status: string; 
  Category: string; 
} 

export interface GuidanceSummary { 
  summary: { 
    totalActivities: number; 
    totalStudents: number; 
    totalSchools: number; 
  }; 
  statusBreakdown: Array<{ status: string; count: number; }>; 
  }