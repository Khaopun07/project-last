// src/lib/pdf-generator.ts
import jsPDF from 'jspdf';
import { PDFReportData, GuidanceReport } from '@/src/types/guidance';
import '@/src/lib/fonts/THSarabunNew Bold-normal';
import '@/src/lib/fonts/THSarabunNew-normal';

// PDF Configuration
const PDF_CONFIG = {
  orientation: 'portrait' as const,
  unit: 'mm' as const,
  format: 'a4' as const,
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  fonts: {
    title: 18,
    header: 16,
    section: 14,
    body: 11,
    small: 10
  },
  colors: {
    primary: [41, 128, 185] as [number, number, number],
    secondary: [52, 73, 94] as [number, number, number],
    text: [44, 62, 80] as [number, number, number],
    light: [236, 240, 241] as [number, number, number]
  }
};

export class SimplePDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private currentY: number;
  private readonly margin = PDF_CONFIG.margins.left;

  constructor() {
    this.doc = new jsPDF(PDF_CONFIG);
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = PDF_CONFIG.margins.top;

    // Set default font
    this.doc.setFont('helvetica');
  }

  // Utility methods
  private checkPageBreak(requiredHeight: number = 20): void {
    if (this.currentY + requiredHeight > this.pageHeight - PDF_CONFIG.margins.bottom) {
      this.doc.addPage();
      this.currentY = PDF_CONFIG.margins.top;
      return;
    }
  }

  private setFont(size: number, style: 'normal' | 'bold' = 'normal'): void {
  this.doc.setFont('THSarabunNew', style); // ✅ จะหาเจอทั้ง normal/bold
  this.doc.setFontSize(size);
}


  private addLine(text: string, x?: number, indent: number = 0): void {
    const xPos = x || (this.margin + indent);
    this.doc.text(text, xPos, this.currentY);
    this.currentY += 7;
  }

  private addSectionDivider(): void {
    this.currentY += 3;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  // Draw simple table manually
  private drawTable(
    headers: string[], 
    rows: string[][], 
    columnWidths?: number[]
  ): void {
    this.checkPageBreak(50);

    const tableWidth = this.pageWidth - (2 * this.margin);
    const defaultColumnWidth = tableWidth / headers.length;
    const colWidths = columnWidths || headers.map(() => defaultColumnWidth);
    
    let xPos = this.margin;
    const rowHeight = 7;
    const headerHeight = 8;

    // Draw header
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY - 5, tableWidth, headerHeight, 'F');
    
    this.setFont(PDF_CONFIG.fonts.small, 'normal');
    this.doc.setTextColor(60, 60, 60);
    
    headers.forEach((header, i) => {
      this.doc.text(header, xPos + 2, this.currentY);
      xPos += colWidths[i];
    });
    this.currentY += headerHeight;

    // Draw rows
    this.setFont(PDF_CONFIG.fonts.small, 'normal');
    this.doc.setTextColor(80, 80, 80);
    
    rows.forEach((row, rowIndex) => {
      this.checkPageBreak(rowHeight + 5);
      
      // Alternate row colors
      if (rowIndex % 2 === 1) {
        this.doc.setFillColor(248, 248, 248);
        this.doc.rect(this.margin, this.currentY - 4, tableWidth, rowHeight, 'F');
      }
      
      xPos = this.margin;
      row.forEach((cell, cellIndex) => {
        // Truncate text if too long
        const maxWidth = colWidths[cellIndex] - 4;
        let displayText = cell || '';
        
        // Simple text truncation
        const textWidth = this.doc.getTextWidth(displayText);
        if (textWidth > maxWidth) {
          while (this.doc.getTextWidth(displayText + '...') > maxWidth && displayText.length > 3) {
            displayText = displayText.substring(0, displayText.length - 1);
          }
          displayText += '...';
        }
        
        this.doc.text(displayText, xPos + 2, this.currentY);
        xPos += colWidths[cellIndex];
      });
      this.currentY += rowHeight;
    });

    this.currentY += 5; // Space after table
  }

  // Convert GuidanceReport to PDFReportData
  private convertToPDFData(report: GuidanceReport): PDFReportData {
    // Create a unique list of teachers from the bookings.
    // Each booking from the report already contains the joined teacher details.
    const teacherMap = new Map<string, any>();
    (report.bookings || []).forEach(booking => {
      if (booking.TeacherID && !teacherMap.has(booking.TeacherID.toString())) {
        // The `booking` object itself contains all necessary teacher info
        // from the LEFT JOIN in the database query.
        teacherMap.set(booking.TeacherID.toString(), booking);
      }
    });
    const uniqueBookingsWithTeacher = Array.from(teacherMap.values());

    const formatDate = (dateString: string) => {
      if (!dateString) return 'ไม่ระบุ';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'วันที่ไม่ถูกต้อง';
      }
      return date.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
      if (!timeString) return 'ไม่ระบุ';
      const date = new Date(`1970-01-01T${timeString}`);
      if (isNaN(date.getTime())) {
        return 'เวลาไม่ถูกต้อง';
      }
      return date.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        });
    };

    return {
      guidanceInfo: {
        id: report.guidance.GuidanceID,
        date: formatDate(report.guidance.guidance_date),
        startTime: formatTime(report.guidance.Start_Time),
        endTime: formatTime(report.guidance.Start_Stop),
        category: report.guidance.Category || 'ไม่ระบุ',
        status: report.guidance.status || 'ไม่ระบุ',
        studyPlan: report.guidance.study_plan || 'ไม่ระบุ',
        facultyInCharge: report.guidance.faculty_in_charge || 'ไม่ระบุ',
        professorInCharge: report.guidance.professor_in_charge || 'ไม่ระบุ',
        car_registration: report.guidance.car_registration || 'ไม่ระบุ',
        number_seats: report.guidance.number_seats ? String(report.guidance.number_seats) : 'ไม่ระบุ',
        car_type: report.guidance.car_type || 'ไม่ระบุ',
        car_phone: report.guidance.car_phone || 'ไม่ระบุ',
      },
      schoolInfo: {
        name: report.school.Sc_name || 'ไม่ระบุชื่อโรงเรียน',
        address: report.school.Sc_address || 'ไม่ระบุที่อยู่',
        district: report.school.Sc_district || '',
        province: report.school.Sc_province || '',
        postal: report.school.Sc_postal || '',
        phone: report.school.Sc_phone || 'ไม่ระบุ',
        email: report.school.Sc_email || 'ไม่ระบุ',
        contactName: report.school.Contact_name || 'ไม่ระบุ',
        contactNo: report.school.Contact_no || 'ไม่ระบุ'
      },
      participants: {
        teachers: uniqueBookingsWithTeacher.map(booking => ({
          name: `${booking.Prefix || ''}${booking.F_name || ''} ${booking.L_name || ''}`.trim() || 'ไม่ระบุ',
          phone: booking.T_Phone || booking.Phone || 'ไม่ระบุ',
          pickupPoint: booking.T_PickupPoint || 'ไม่ระบุ',
        })) || [],
        students: report.participants?.students || [],
        vehicles: (report.guidance.car_type || report.guidance.car_registration)
          ? [{
              type: report.guidance.car_type || 'ไม่ระบุ',
              license: report.guidance.car_registration || 'ไม่ระบุ',
              seats: report.guidance.number_seats || 'ไม่ระบุ',
              phone: report.guidance.car_phone || 'ไม่ระบุ',
            }]
          : []
      },
      summary: {
        totalStudents: report.participants?.totalStudents || 0,
        totalTeachers: uniqueBookingsWithTeacher.length,
        totalParticipants: (report.participants?.totalStudents || 0) + uniqueBookingsWithTeacher.length
      }
    };
  }

  // Header section
  private addHeader(data: PDFReportData): void {
    // University header
    this.setFont(PDF_CONFIG.fonts.title, 'normal');
    this.doc.setTextColor(...PDF_CONFIG.colors.primary);
    this.doc.text('มหาวิทยาลัยทักษิณ', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 10;
    this.setFont(PDF_CONFIG.fonts.header);
    this.doc.text('รายงานกิจกรรมแนะแนวการศึกษา', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 15;
    
    // Activity summary box
    this.doc.setFillColor(...PDF_CONFIG.colors.light);
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - (2 * this.margin), 25, 'F');
    
    this.currentY += 5;
    this.setFont(PDF_CONFIG.fonts.body);
    this.doc.setTextColor(...PDF_CONFIG.colors.text);
    
    this.addLine(`รหัสกิจกรรม: ${data.guidanceInfo.id}`, this.margin + 5);
    this.currentY -= 7; // Reset for next column
    this.addLine(`วันที่: ${data.guidanceInfo.date}`, this.pageWidth / 2 + 5);
    
    this.addLine(`เวลา: ${data.guidanceInfo.startTime} - ${data.guidanceInfo.endTime}`, this.margin + 5);
    this.currentY -= 7; // Reset for next column
    this.addLine(`สถานะ: ${data.guidanceInfo.status}`, this.pageWidth / 2 + 5);

    this.currentY += 10;
  }

  // School information section
  private addSchoolInfo(data: PDFReportData): void {
    this.checkPageBreak(40);
    
    this.setFont(PDF_CONFIG.fonts.section, 'normal');
    this.doc.setTextColor(...PDF_CONFIG.colors.primary);
    this.addLine('ข้อมูลโรงเรียน');
    
    this.setFont(PDF_CONFIG.fonts.body);
    this.doc.setTextColor(...PDF_CONFIG.colors.text);
    
    const fullAddress = [
      data.schoolInfo.address,
      data.schoolInfo.district,
      data.schoolInfo.province,
      data.schoolInfo.postal
    ].filter(Boolean).join(' ');

    this.addLine(`ชื่อโรงเรียน: ${data.schoolInfo.name}`, undefined, 5);
    this.addLine(`ที่อยู่: ${fullAddress}`, undefined, 5);
    this.addLine(`เบอร์โทร: ${data.schoolInfo.phone}`, undefined, 5);
    this.addLine(`อีเมล: ${data.schoolInfo.email}`, undefined, 5);
    this.addLine(`ผู้ติดต่อ: ${data.schoolInfo.contactName} (${data.schoolInfo.contactNo})`, undefined, 5);

    this.addSectionDivider();
  }

  // Guidance details section
  private addGuidanceDetails(data: PDFReportData): void {
    this.checkPageBreak(30);
    
    this.setFont(PDF_CONFIG.fonts.section, 'normal');
    this.doc.setTextColor(...PDF_CONFIG.colors.primary);
    this.addLine('รายละเอียดกิจกรรม');
    
    this.setFont(PDF_CONFIG.fonts.body);
    this.doc.setTextColor(...PDF_CONFIG.colors.text);
    
    this.addLine(`แผนการเรียน: ${data.guidanceInfo.studyPlan}`, undefined, 5);
    this.addLine(`คณะที่รับผิดชอบ: ${data.guidanceInfo.facultyInCharge}`, undefined, 5);
    this.addLine(`อาจารย์ผู้รับผิดชอบ: ${data.guidanceInfo.professorInCharge}`, undefined, 5);
    this.addLine(`ประเภทกิจกรรม: ${data.guidanceInfo.category}`, undefined, 5);

    this.addSectionDivider();
  }

  private addVehicleDetails(data: PDFReportData): void {
    // Only add this section if there is vehicle information
    if (data.guidanceInfo.car_type !== 'ไม่ระบุ' || data.guidanceInfo.car_registration !== 'ไม่ระบุ') {
      this.checkPageBreak(30);
      this.setFont(PDF_CONFIG.fonts.section, 'normal');
      this.doc.setTextColor(...PDF_CONFIG.colors.primary);
      this.addLine('รายละเอียดรถโดยสาร');
      this.setFont(PDF_CONFIG.fonts.body);
      this.doc.setTextColor(...PDF_CONFIG.colors.text);
      this.addLine(`ทะเบียน: ${data.guidanceInfo.car_registration}`, undefined, 5);
      this.addLine(`จำนวนที่นั่ง: ${data.guidanceInfo.number_seats}`, undefined, 5);
      this.addLine(`ประเภทรถ: ${data.guidanceInfo.car_type}`, undefined, 5);
      this.addLine(`เบอร์โทรคนขับ: ${data.guidanceInfo.car_phone}`, undefined, 5);
      this.addSectionDivider();
    }
  }
  // Participants tables
  private addParticipantsTable(data: PDFReportData): void {
    // Teachers section
    if (data.participants.teachers.length > 0) {
      this.checkPageBreak(50);
      
      this.setFont(PDF_CONFIG.fonts.section, 'normal');
      this.doc.setTextColor(...PDF_CONFIG.colors.primary);
      this.addLine('รายชื่ออาจารย์ผู้นำ');

      const teacherRows = data.participants.teachers.map((teacher, index) => [
        (index + 1).toString(),
        teacher.name,
        teacher.phone,
        teacher.pickupPoint
      ]);

      this.drawTable(
        ['ลำดับ', 'ชื่อ-นามสกุล', 'เบอร์โทร', 'จุดรับ-ส่ง'],
        teacherRows,
        [20, 60, 40, 50]
      );

      this.currentY += 5;
    }

    // Students section
    if (data.participants.students.length > 0) {
      this.checkPageBreak(50);
      
      this.setFont(PDF_CONFIG.fonts.section, 'normal');
      this.doc.setTextColor(...PDF_CONFIG.colors.primary);
      this.addLine('รายชื่อนักเรียน');

      const studentRows = data.participants.students.map((student, index) => [
        (index + 1).toString(),
        student.id || 'ไม่ระบุ',
        student.name || 'ไม่ระบุ'
      ]);

      // Split into chunks if too many students
      const chunkSize = 25; // Max students per page
      for (let i = 0; i < studentRows.length; i += chunkSize) {
        if (i > 0) {
          this.checkPageBreak(50);
          this.setFont(PDF_CONFIG.fonts.section, 'normal');
          this.doc.setTextColor(...PDF_CONFIG.colors.primary);
          this.addLine('รายชื่อนักเรียน (ต่อ)');
        }

        const chunk = studentRows.slice(i, i + chunkSize);
        this.drawTable(
          ['ลำดับ', 'รหัสนักเรียน', 'ชื่อ-นามสกุล'],
          chunk,
          [30, 50, 90]
        );
      }

      this.currentY += 5;
    }
  }

  // Summary section
  private addSummary(data: PDFReportData): void {
    this.checkPageBreak(40);
    
    this.setFont(PDF_CONFIG.fonts.section, 'normal');
    this.doc.setTextColor(...PDF_CONFIG.colors.primary);
    this.addLine('สรุปผลการดำเนินกิจกรรม');
    
    // Summary box
    this.doc.setFillColor(...PDF_CONFIG.colors.light);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (2 * this.margin), 20, 'F');
    
    this.currentY += 8;
    this.setFont(PDF_CONFIG.fonts.body);
    this.doc.setTextColor(...PDF_CONFIG.colors.text);
    
    this.addLine(`จำนวนอาจารย์ผู้นำ: ${data.summary.totalTeachers} คน`, this.margin + 5);
    this.addLine(`จำนวนนักเรียน: ${data.summary.totalStudents} คน`, this.margin + 5);
    this.addLine(`จำนวนผู้เข้าร่วมทั้งหมด: ${data.summary.totalParticipants} คน`, this.margin + 5);

    this.currentY += 10;
  }

  // Footer with signature area
  private addFooter(): void {
    const footerY = this.pageHeight - 35;
    
    this.setFont(PDF_CONFIG.fonts.body);
    this.doc.setTextColor(...PDF_CONFIG.colors.text);
    
    const currentDate = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Signature area
    this.doc.text('      ลงชื่อ ........................................ ผู้รับผิดชอบ', this.pageWidth - 80, footerY);
    this.doc.text('             (........................................)', this.pageWidth - 80, footerY + 6);
    this.doc.text('        ตำแหน่ง ........................................ ', this.pageWidth - 80, footerY + 12);
    this.doc.text(`           วันที่ ${currentDate}`, this.pageWidth - 80, footerY + 18);

    // Page number
    const pageCount = this.doc.internal.pages.length - 1;
    if (pageCount > 1) {
      this.setFont(PDF_CONFIG.fonts.small);
      this.doc.text(`หน้า ${pageCount}`, this.margin, footerY + 18);
    }
  }

  // Main PDF generation method
  public generatePDF(report: GuidanceReport): Buffer {
    try {
      console.log('Generating PDF for guidance ID:', report.guidance.GuidanceID);
      
      const data = this.convertToPDFData(report);
      
      // Add all sections
      this.addHeader(data);
      this.addSchoolInfo(data);
      this.addGuidanceDetails(data);
      this.addVehicleDetails(data);
      this.addParticipantsTable(data);
      this.addSummary(data);
      this.addFooter();
      
      // Convert to buffer
      const arrayBuffer = this.doc.output('arraybuffer');
      const buffer = Buffer.from(arrayBuffer);
      
      console.log('PDF generated successfully, size:', buffer.length);
      return buffer;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`ไม่สามารถสร้าง PDF ได้: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Main export function
export async function generateGuidanceReportPDF(report: GuidanceReport): Promise<Buffer> {
  try {
    console.log('Starting PDF generation for guidance:', report.guidance.GuidanceID);
    
    const generator = new SimplePDFGenerator();
    const pdfBuffer = generator.generatePDF(report);
    
    console.log('PDF generation completed successfully');
    return pdfBuffer;
    
  } catch (error) {
    console.error('Error in generateGuidanceReportPDF:', error);
    throw new Error(`PDF Generation Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Legacy function for backward compatibility
export function downloadGuidanceReportPDF(report: GuidanceReport, filename?: string): void {
  try {
    const generator = new SimplePDFGenerator();
    const data = generator['convertToPDFData'](report);
    
    // Generate PDF content
    generator['addHeader'](data);
    generator['addSchoolInfo'](data);
    generator['addGuidanceDetails'](data);
    generator['addParticipantsTable'](data);
    generator['addSummary'](data);
    generator['addFooter']();
    
    // Download PDF
    const fileName = filename || `รายงานกิจกรรม_${data.guidanceInfo.id}_${Date.now()}.pdf`;
    generator['doc'].save(fileName);
    
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}