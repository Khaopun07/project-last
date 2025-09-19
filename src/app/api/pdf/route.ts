import { NextRequest, NextResponse } from 'next/server';
import { getGuidanceReport } from '@/src/lib/database';
import { generateGuidanceReportPDF } from '@/src/lib/pdf-generator';

// GET /api/pdf?id={guidanceId}&download={true/false}
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guidanceId = searchParams.get('id');
    const test = searchParams.get('test');
    const forceDownload = searchParams.get('download') === 'true';

    console.log('GET PDF Request:', { guidanceId, test, forceDownload });

    // Test mode - ส่ง PDF ทดสอบ
    if (test === 'true') {
      const testPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n178\n%%EOF');
      
      return new NextResponse(testPdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': forceDownload ? 'attachment; filename="test.pdf"' : 'inline; filename="test.pdf"',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          // Headers เพิ่มเติมเพื่อแก้ปัญหา blocking
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'Referrer-Policy': 'no-referrer-when-downgrade'
        },
      });
    }

    if (!guidanceId) {
      return NextResponse.json({ error: 'Guidance ID is required' }, { status: 400 });
    }

    const report = await getGuidanceReport(parseInt(guidanceId));
    console.log('Report found:', !!report);
    
    if (!report) {
      return NextResponse.json({ error: 'Guidance activity not found' }, { status: 404 });
    }

    const pdfBuffer = await generateGuidanceReportPDF(report);
    console.log('PDF Buffer created, size:', pdfBuffer?.length);

    if (!Buffer.isBuffer(pdfBuffer)) {
      console.error('generateGuidanceReportPDF did not return a Buffer');
      return NextResponse.json({ error: 'Failed to generate PDF - invalid buffer' }, { status: 500 });
    }

    const filename = `รายงานกิจกรรม_${report.guidance.GuidanceID}_${Date.now()}.pdf`;
    console.log('Sending PDF file:', filename, 'Download mode:', forceDownload);

    // แปลง Buffer เป็น Uint8Array สำหรับ NextResponse
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    // กำหนด Content-Disposition ตาม parameter
    const contentDisposition = forceDownload 
      ? `attachment; filename="${encodeURIComponent(filename)}"`
      : `inline; filename="${encodeURIComponent(filename)}"`;

    return new NextResponse(pdfUint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
        'Content-Length': pdfBuffer.length.toString(),
        
        // Cache headers
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Last-Modified': new Date().toUTCString(),
        
        // Security headers เพื่อแก้ปัญหา blocking
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        
        // Content security
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'no-referrer-when-downgrade',
        
        // PDF specific headers
        'Accept-Ranges': 'bytes',
        'Content-Security-Policy': "default-src 'self'; object-src 'self'; plugin-types application/pdf;",
        
        // เพิ่ม custom header เพื่อ bypass บาง blockers
        'X-PDF-Source': 'internal-api',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to generate PDF report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// เพิ่ม OPTIONS method สำหรับ CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// เพิ่ม HEAD method สำหรับการทดสอบ
export async function HEAD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guidanceId = searchParams.get('id');

    if (!guidanceId) {
      return new NextResponse(null, { status: 400 });
    }

    const report = await getGuidanceReport(parseInt(guidanceId));
    
    if (!report) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('HEAD request error:', error);
    return new NextResponse(null, { status: 500 });
  }
}