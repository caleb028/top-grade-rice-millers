import { PDFPage, PDFFont } from 'pdf-lib';
import {
  PDF_MARGIN_LEFT,
  PDF_PAGE_WIDTH,
  pdfColors,
} from './pdfStyles';
import { CompanyInfo } from '@/types';

export function drawPdfFooter(
  page: PDFPage,
  pageIndex: number,
  pageCount: number,
  regularFont: PDFFont,
  company: CompanyInfo
) {
  const footerY = 40;
  const rightX = PDF_PAGE_WIDTH - 45;

  // Top border of footer
  page.drawLine({
    start: { x: PDF_MARGIN_LEFT, y: footerY + 16 },
    end: { x: rightX, y: footerY + 16 },
    thickness: 0.5,
    color: pdfColors.tableBorder,
  });

  // Left text: Company identity
  const leftText = `${company.name} • ${company.slogan || 'Home of Pure Pishori'} • Mwea, Kirinyaga`;
  page.drawText(leftText, {
    x: PDF_MARGIN_LEFT,
    y: footerY + 4,
    size: 7,
    font: regularFont,
    color: pdfColors.mutedText,
  });

  // Center / date generated
  const genDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const subText = `Official Document • Verified Wang'uru Mwea Facility • Generated ${genDate}`;
  page.drawText(subText, {
    x: PDF_MARGIN_LEFT,
    y: footerY - 5,
    size: 6.5,
    font: regularFont,
    color: pdfColors.mutedText,
  });

  // Right text: Page X of Y
  const pageStr = `Page ${pageIndex + 1} of ${pageCount}`;
  const pageWidth = regularFont.widthOfTextAtSize(pageStr, 7.5);
  page.drawText(pageStr, {
    x: rightX - pageWidth,
    y: footerY + 4,
    size: 7.5,
    font: regularFont,
    color: pdfColors.charcoal,
  });
}
