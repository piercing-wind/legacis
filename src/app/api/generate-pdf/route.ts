import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';

export async function POST(request: NextRequest) {
  try {
    const { html, filename } = await request.json();
    
    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Launch Puppeteer-core with system Chromium
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      headless: true,
    });
    
    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1080, height: 1024 });

    // Inject your HTML content
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Multi-page A4 PDF generation
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm"
      }
    });

    await browser.close();

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'agreement'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import puppeteer from 'puppeteer-core';

// export async function POST(request: NextRequest) {
//   try {
//     const { html, filename } = await request.json();
    
//     if (!html) {
//       return NextResponse.json(
//         { error: 'HTML content is required' },
//         { status: 400 }
//       );
//     }

//     // Launch Puppeteer with simpler configuration
//    const browser = await puppeteer.launch({
//       executablePath: '/usr/bin/chromium-browser',
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     });
//     const page = await browser.newPage();

//     // Inject your HTML content
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     // Multi-page A4 PDF generation
//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       printBackground: true, // keep colors/images
//       margin: {
//         top: "20mm",
//         bottom: "20mm",
//         left: "15mm",
//         right: "15mm"
//       }
//       // No height/width set → will automatically split into multiple pages
//     });

//     await browser.close();

//     // Return PDF as response
//     return new NextResponse(Buffer.from(pdfBuffer), {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `attachment; filename="${filename || 'agreement'}.pdf"`,
//       },
//     });

//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     return NextResponse.json(
//       { error: 'Failed to generate PDF' },
//       { status: 500 }
//     );
//   }
// }
