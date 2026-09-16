import { PDFDocument, StandardFonts } from 'pdf-lib';
import {
  PDF_PAGE_WIDTH,
  PDF_PAGE_HEIGHT,
  PDF_MARGIN_LEFT,
  PDF_CONTENT_WIDTH,
  pdfColors,
} from './pdfStyles';
import { drawPdfHeader } from './pdfHeader';
import { drawPdfFooter } from './pdfFooter';
import { CompanyInfo, Product, MillingService } from '@/types';

export async function generateCompanyProfilePdf(
  company: CompanyInfo,
  products: Product[],
  services: MillingService[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  pdfDoc.setTitle('Top Grade Rice Millers — Official Corporate Profile');
  pdfDoc.setAuthor('Top Grade Rice Millers');
  pdfDoc.setSubject('Official Corporate Profile & Commercial Capabilities');
  pdfDoc.setCreator('Top Grade Rice Millers Digital Management Platform');

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const dateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // =========================================================================
  // PAGE 1: Corporate Overview, Heritage, Quality Pillars & Milling Services
  // =========================================================================
  const page1 = pdfDoc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);

  let y = await drawPdfHeader(
    pdfDoc,
    page1,
    boldFont,
    regularFont,
    company,
    'Official Corporate Profile',
    'TGM-CORP-2026',
    dateFormatted
  );

  // Executive Summary Banner
  const bannerY = y - 40;
  page1.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: bannerY,
    width: PDF_CONTENT_WIDTH,
    height: 40,
    color: pdfColors.forestGreen,
  });

  page1.drawText(company.slogan || 'Home of Pure Pishori', {
    x: PDF_MARGIN_LEFT + 14,
    y: bannerY + 22,
    size: 11,
    font: boldFont,
    color: pdfColors.riceGold,
  });

  page1.drawText(company.tagline || 'Premium Rice Proudly Milled in Mwea, Kirinyaga County, Kenya', {
    x: PDF_MARGIN_LEFT + 14,
    y: bannerY + 9,
    size: 8,
    font: regularFont,
    color: pdfColors.white,
  });

  y = bannerY - 20;

  // Section 1: Agricultural Origin & Heritage
  page1.drawText('1. WHERE GREAT RICE BEGINS — THE MWEA HERITAGE', {
    x: PDF_MARGIN_LEFT,
    y: y,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y -= 12;

  const aboutSummary = company.aboutText?.summary ||
    'Rooted in Mwea, Top Grade Rice Millers delivers carefully processed rice for customers who value quality, consistency and reliability.';
  const aboutDetail = company.aboutText?.detail ||
    'The Mwea basin is renowned across East Africa for its mineral-rich black cotton soils, fed year-round by clear mountain streams cascading from Mount Kenya. Top Grade Rice Millers operates at the heart of this ecosystem, pairing traditional grain heritage with modern mechanical milling precision.';

  page1.drawText(aboutSummary, {
    x: PDF_MARGIN_LEFT,
    y: y,
    size: 8.5,
    font: boldFont,
    color: pdfColors.charcoal,
    maxWidth: PDF_CONTENT_WIDTH,
    lineHeight: 12,
  });
  y -= 22;

  page1.drawText(aboutDetail, {
    x: PDF_MARGIN_LEFT,
    y: y,
    size: 8,
    font: regularFont,
    color: pdfColors.charcoal,
    maxWidth: PDF_CONTENT_WIDTH,
    lineHeight: 11.5,
  });
  y -= 38;

  // Section 2: Mission & Corporate Commitment
  page1.drawText('2. OUR MISSION & COMMITMENT', {
    x: PDF_MARGIN_LEFT,
    y: y,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y -= 12;

  const mission = company.aboutText?.mission ||
    'To provide households, retailers, and commercial institutions with dependably pure, cleanly milled Kenyan rice while upholding operational excellence and transparent business practices.';

  page1.drawText(mission, {
    x: PDF_MARGIN_LEFT,
    y: y,
    size: 8,
    font: regularFont,
    color: pdfColors.charcoal,
    maxWidth: PDF_CONTENT_WIDTH,
    lineHeight: 11.5,
  });
  y -= 30;

  // Section 3: Commercial Milling Lines & Capabilities
  page1.drawText('3. INDUSTRIAL MILLING PROCESS & CAPABILITIES', {
    x: PDF_MARGIN_LEFT,
    y: y,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y -= 14;

  const activeServices = services.filter((s) => s.active !== false).slice(0, 5);
  const srvRowHeight = 36;

  activeServices.forEach((srv, idx) => {
    const rowY = y - srvRowHeight;
    const isAlt = idx % 2 === 1;

    if (isAlt) {
      page1.drawRectangle({
        x: PDF_MARGIN_LEFT,
        y: rowY,
        width: PDF_CONTENT_WIDTH,
        height: srvRowHeight,
        color: pdfColors.tableAltRowBg,
      });
    }

    page1.drawRectangle({
      x: PDF_MARGIN_LEFT,
      y: rowY,
      width: PDF_CONTENT_WIDTH,
      height: srvRowHeight,
      borderColor: pdfColors.tableBorder,
      borderWidth: 0.5,
    });

    page1.drawText(srv.number || `0${idx + 1}`, {
      x: PDF_MARGIN_LEFT + 8,
      y: rowY + 18,
      size: 11,
      font: boldFont,
      color: pdfColors.riceGold,
    });

    page1.drawText(srv.name, {
      x: PDF_MARGIN_LEFT + 36,
      y: rowY + 20,
      size: 8.5,
      font: boldFont,
      color: pdfColors.forestGreen,
    });

    page1.drawText(srv.tagline || srv.description, {
      x: PDF_MARGIN_LEFT + 36,
      y: rowY + 8,
      size: 7.5,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: PDF_CONTENT_WIDTH - 48,
    });

    y -= srvRowHeight;
  });

  // Footer for page 1
  drawPdfFooter(page1, 0, 2, regularFont, company);

  // =========================================================================
  // PAGE 2: Product Selections, Quality Standards, Location & Procurement
  // =========================================================================
  const page2 = pdfDoc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);

  let y2 = await drawPdfHeader(
    pdfDoc,
    page2,
    boldFont,
    regularFont,
    company,
    'Official Corporate Profile (Cont.)',
    'TGM-CORP-2026',
    dateFormatted
  );

  // Section 4: Rice Varieties & Wholesale Catalogue
  page2.drawText('4. CURATED MILLED RICE SELECTIONS', {
    x: PDF_MARGIN_LEFT,
    y: y2,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y2 -= 14;

  const activeProducts = products.filter((p) => p.active !== false).slice(0, 3);
  const prodCardHeight = 60;

  activeProducts.forEach((prod) => {
    const cardY = y2 - prodCardHeight;

    page2.drawRectangle({
      x: PDF_MARGIN_LEFT,
      y: cardY,
      width: PDF_CONTENT_WIDTH,
      height: prodCardHeight,
      color: pdfColors.white,
      borderColor: pdfColors.tableBorder,
      borderWidth: 0.5,
    });

    page2.drawText(prod.name.toUpperCase(), {
      x: PDF_MARGIN_LEFT + 12,
      y: cardY + 44,
      size: 9,
      font: boldFont,
      color: pdfColors.forestGreen,
    });

    page2.drawText(`Category: ${prod.category}   |   Purity: ${prod.purity}   |   Moisture: ${prod.moisture}`, {
      x: PDF_MARGIN_LEFT + 12,
      y: cardY + 31,
      size: 7.5,
      font: regularFont,
      color: pdfColors.riceGold,
    });

    page2.drawText(prod.shortDescription, {
      x: PDF_MARGIN_LEFT + 12,
      y: cardY + 18,
      size: 7.5,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: PDF_CONTENT_WIDTH - 24,
    });

    page2.drawText(`Available Sizes: ${(prod.sizes || []).join(', ')}`, {
      x: PDF_MARGIN_LEFT + 12,
      y: cardY + 6,
      size: 7,
      font: boldFont,
      color: pdfColors.mutedText,
    });

    y2 -= prodCardHeight + 10;
  });

  y2 -= 8;

  // Section 5: Facility Operations & Location Verification
  page2.drawText('5. PHYSICAL HUB & OPERATIONAL PRESENCE', {
    x: PDF_MARGIN_LEFT,
    y: y2,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y2 -= 14;

  const locRows = [
    { label: 'Physical Facility', value: `${company.location.landmark}, ${company.location.town}, ${company.location.county}` },
    { label: 'GPS Coordinates', value: `Lat ${company.location.coordinates.lat}, Long ${company.location.coordinates.lng} (Wang'uru Mwea)` },
    { label: 'Turn-by-Turn Navigation', value: company.location.googleMapsLiveUrl || 'Available on Google Maps' },
    { label: 'Operating Schedule', value: company.contact.businessHours.map((b) => `${b.days} (${b.hours})`).join(' | ') },
  ];

  const locRowHeight = 22;
  locRows.forEach((r, idx) => {
    const rowY = y2 - locRowHeight;
    const isAlt = idx % 2 === 1;

    if (isAlt) {
      page2.drawRectangle({
        x: PDF_MARGIN_LEFT,
        y: rowY,
        width: PDF_CONTENT_WIDTH,
        height: locRowHeight,
        color: pdfColors.tableAltRowBg,
      });
    }

    page2.drawRectangle({
      x: PDF_MARGIN_LEFT,
      y: rowY,
      width: PDF_CONTENT_WIDTH,
      height: locRowHeight,
      borderColor: pdfColors.tableBorder,
      borderWidth: 0.5,
    });

    page2.drawText(r.label, {
      x: PDF_MARGIN_LEFT + 10,
      y: rowY + 7,
      size: 8,
      font: boldFont,
      color: pdfColors.charcoal,
    });

    page2.drawText(r.value, {
      x: PDF_MARGIN_LEFT + 130,
      y: rowY + 7,
      size: 7.5,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: PDF_CONTENT_WIDTH - 140,
    });

    y2 -= locRowHeight;
  });

  y2 -= 20;

  // Wholesale Procurement Desk Box
  const deskBoxY = Math.max(y2 - 62, 85);
  page2.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: deskBoxY,
    width: PDF_CONTENT_WIDTH,
    height: 62,
    color: pdfColors.forestGreen,
    borderColor: pdfColors.riceGold,
    borderWidth: 1,
  });

  page2.drawText('COMMERCIAL PARTNERSHIPS & WHOLESALE CONTRACTS', {
    x: PDF_MARGIN_LEFT + 14,
    y: deskBoxY + 44,
    size: 8.5,
    font: boldFont,
    color: pdfColors.riceGold,
  });

  page2.drawText(
    'Top Grade Rice Millers serves supermarkets, educational institutions, hospitality groups, and bulk wholesalers across Kenya. Direct ex-mill collections and scheduled distribution contracts available.',
    {
      x: PDF_MARGIN_LEFT + 14,
      y: deskBoxY + 30,
      size: 7.5,
      font: regularFont,
      color: pdfColors.white,
      maxWidth: PDF_CONTENT_WIDTH - 28,
      lineHeight: 10,
    }
  );

  page2.drawText(
    `Telephone: ${company.contact.phoneDisplay}   |   WhatsApp: +${company.contact.whatsappNumber}   |   Email: ${company.contact.salesEmail}`,
    {
      x: PDF_MARGIN_LEFT + 14,
      y: deskBoxY + 10,
      size: 8,
      font: boldFont,
      color: pdfColors.white,
    }
  );

  // Footer for page 2
  drawPdfFooter(page2, 1, 2, regularFont, company);

  return await pdfDoc.save();
}
