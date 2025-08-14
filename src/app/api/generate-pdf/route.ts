import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { html, filename } = await request.json();
    
    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Launch Puppeteer with simpler configuration
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Inject your HTML content
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Multi-page A4 PDF generation
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true, // keep colors/images
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm"
      }
      // No height/width set → will automatically split into multiple pages
    });

    await browser.close();

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'agreement'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
