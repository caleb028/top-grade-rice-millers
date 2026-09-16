import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFPage, PDFFont } from 'pdf-lib';
import {
  PDF_MARGIN_LEFT,
  PDF_MARGIN_TOP,
  PDF_PAGE_WIDTH,
  PDF_PAGE_HEIGHT,
  PDF_CONTENT_WIDTH,
  pdfColors,
} from './pdfStyles';
import { CompanyInfo } from '@/types';

export async function drawPdfHeader(
  pdfDoc: PDFDocument,
  page: PDFPage,
  boldFont: PDFFont,
  regularFont: PDFFont,
  company: CompanyInfo,
  documentTitle: string,
  reference?: string,
  dateString?: string
): Promise<number> {
  const topY = PDF_PAGE_HEIGHT - PDF_MARGIN_TOP;

  // 1. Embed and draw official logo
  let logoDrawn = false;
  const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedJpg(logoBytes);
      const logoSize = 50; // 50x50pt
      page.drawImage(logoImage, {
        x: PDF_MARGIN_LEFT,
        y: topY - logoSize,
        width: logoSize,
        height: logoSize,
      });
      logoDrawn = true;
    } catch (e) {
      console.warn('Failed to embed logo in PDF:', e);
    }
  }

  const textStartX = logoDrawn ? PDF_MARGIN_LEFT + 58 : PDF_MARGIN_LEFT;

  // Company Name
  page.drawText('TOP GRADE RICE MILLERS', {
    x: textStartX,
    y: topY - 14,
    size: 13,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  // Slogan
  page.drawText('Home of Pure Pishori', {
    x: textStartX,
    y: topY - 26,
    size: 9.5,
    font: regularFont,
    color: pdfColors.riceGold,
  });

  // Corporate Subtitle
  page.drawText('Commercial Rice Milling & Wholesale Supply', {
    x: textStartX,
    y: topY - 37,
    size: 7.5,
    font: regularFont,
    color: pdfColors.mutedText,
  });

  // Right-aligned contact info
  const rightX = PDF_PAGE_WIDTH - 45;
  const addressLine = `${company.location.landmark || "Wang'uru Hub"}, ${company.location.town}, Kenya`;
  const contactLine = `${company.contact.phoneDisplay} • ${company.contact.email}`;
  const webLine = 'www.topgradericemillers.co.ke';

  const addressWidth = regularFont.widthOfTextAtSize(addressLine, 7.5);
  const contactWidth = regularFont.widthOfTextAtSize(contactLine, 7.5);
  const webWidth = boldFont.widthOfTextAtSize(webLine, 7.5);

  page.drawText(addressLine, {
    x: rightX - addressWidth,
    y: topY - 14,
    size: 7.5,
    font: regularFont,
    color: pdfColors.charcoal,
  });

  page.drawText(contactLine, {
    x: rightX - contactWidth,
    y: topY - 26,
    size: 7.5,
    font: regularFont,
    color: pdfColors.mutedText,
  });

  page.drawText(webLine, {
    x: rightX - webWidth,
    y: topY - 37,
    size: 7.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  // Thin gold divider line
  const dividerY = topY - 56;
  page.drawLine({
    start: { x: PDF_MARGIN_LEFT, y: dividerY },
    end: { x: PDF_PAGE_WIDTH - 45, y: dividerY },
    thickness: 1,
    color: pdfColors.riceGold,
  });

  // Document Title Bar
  const titleY = dividerY - 26;
  page.drawText(documentTitle.toUpperCase(), {
    x: PDF_MARGIN_LEFT,
    y: titleY,
    size: 14,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  // Document Metadata on right side of title bar
  if (reference || dateString) {
    const metaParts = [];
    if (reference) metaParts.push(`Ref: ${reference}`);
    if (dateString) metaParts.push(`Date: ${dateString}`);
    const metaText = metaParts.join('   |   ');
    const metaWidth = regularFont.widthOfTextAtSize(metaText, 8.5);

    page.drawText(metaText, {
      x: rightX - metaWidth,
      y: titleY + 1,
      size: 8.5,
      font: regularFont,
      color: pdfColors.mutedText,
    });
  }

  // Light horizontal separator below title
  const titleLineY = titleY - 10;
  page.drawLine({
    start: { x: PDF_MARGIN_LEFT, y: titleLineY },
    end: { x: PDF_PAGE_WIDTH - 45, y: titleLineY },
    thickness: 0.5,
    color: pdfColors.tableBorder,
  });

  return titleLineY - 16;
}
