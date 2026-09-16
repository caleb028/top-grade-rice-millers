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
import { Product, CompanyInfo } from '@/types';

export async function generateProductPdf(
  product: Product,
  company: CompanyInfo
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  pdfDoc.setTitle(`Top Grade Rice Millers — ${product.name} Product Specification`);
  pdfDoc.setAuthor('Top Grade Rice Millers');
  pdfDoc.setSubject(`Technical Specification and Wholesale Brochure for ${product.name}`);
  pdfDoc.setCreator('Top Grade Rice Millers Digital Platform');

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const page = pdfDoc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);

  const dateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Draw Standard Header
  let y = await drawPdfHeader(
    pdfDoc,
    page,
    boldFont,
    regularFont,
    company,
    'Product Specification Brochure',
    product.slug.toUpperCase(),
    dateFormatted
  );

  // Product Banner Title & Category
  const bannerY = y - 48;
  page.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: bannerY,
    width: PDF_CONTENT_WIDTH,
    height: 48,
    color: pdfColors.warmRice,
    borderColor: pdfColors.riceGold,
    borderWidth: 0.75,
  });

  page.drawText(product.name.toUpperCase(), {
    x: PDF_MARGIN_LEFT + 14,
    y: bannerY + 26,
    size: 13,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  page.drawText(`Category: ${product.category}   |   Classification: ${product.purity || 'Grade 1'}`, {
    x: PDF_MARGIN_LEFT + 14,
    y: bannerY + 11,
    size: 8.5,
    font: regularFont,
    color: pdfColors.charcoal,
  });

  y = bannerY - 18;

  // Product Description Section
  page.drawText('PRODUCT OVERVIEW & CHARACTERISTICS', {
    x: PDF_MARGIN_LEFT,
    y: y,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y -= 12;

  const descText = product.fullDescription || product.shortDescription;
  page.drawText(descText, {
    x: PDF_MARGIN_LEFT,
    y: y,
    size: 8.5,
    font: regularFont,
    color: pdfColors.charcoal,
    maxWidth: PDF_CONTENT_WIDTH,
    lineHeight: 12,
  });

  // Compute text height offset roughly
  const estimatedLines = Math.ceil(descText.length / 95);
  y -= Math.max(estimatedLines * 13, 26) + 12;

  // Technical Specifications Table
  page.drawText('VERIFIED TECHNICAL SPECIFICATIONS', {
    x: PDF_MARGIN_LEFT,
    y: y,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y -= 14;

  const specRows = [
    { spec: 'Grain Classification', value: product.grainType || 'Slender Long Grain' },
    { spec: 'Purity Level', value: product.purity || 'Grade 1 Pure Grain' },
    { spec: 'Moisture Content', value: product.moisture || '< 13.0% optimal for shelf stability' },
    { spec: 'Broken Grain Ratio', value: product.brokenRatio || 'Under 5% broken kernel' },
    { spec: 'Natural Aroma Profile', value: product.aroma || 'Natural High Pishori Aroma' },
    { spec: 'Agricultural Origin', value: product.origin || 'Mwea Irrigation Basin, Kirinyaga County, Kenya' },
    { spec: 'Recommended Culinary Use', value: (product.idealFor || ['Household & Commercial Dining']).join(', ') },
    { spec: 'Destoning & Cleaning', value: 'Vibratory scaled, aspirated and dual-gravity destoned (Zero field stones)' },
  ];

  const rowHeight = 21;
  const col1Width = 160;

  specRows.forEach((r, idx) => {
    const rowY = y - rowHeight;
    const isAlt = idx % 2 === 1;

    if (isAlt) {
      page.drawRectangle({
        x: PDF_MARGIN_LEFT,
        y: rowY,
        width: PDF_CONTENT_WIDTH,
        height: rowHeight,
        color: pdfColors.tableAltRowBg,
      });
    }

    page.drawRectangle({
      x: PDF_MARGIN_LEFT,
      y: rowY,
      width: PDF_CONTENT_WIDTH,
      height: rowHeight,
      borderColor: pdfColors.tableBorder,
      borderWidth: 0.5,
    });

    page.drawText(r.spec, {
      x: PDF_MARGIN_LEFT + 10,
      y: rowY + 6.5,
      size: 8,
      font: boldFont,
      color: pdfColors.charcoal,
    });

    page.drawText(r.value, {
      x: PDF_MARGIN_LEFT + col1Width + 10,
      y: rowY + 6.5,
      size: 8,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: PDF_CONTENT_WIDTH - col1Width - 15,
    });

    y -= rowHeight;
  });

  y -= 18;

  // Packaging Availability
  page.drawText('AVAILABLE PACKAGING SIZES FOR COMMERCIAL ORDER', {
    x: PDF_MARGIN_LEFT,
    y: y,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y -= 14;

  const packY = y - 30;
  page.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: packY,
    width: PDF_CONTENT_WIDTH,
    height: 30,
    color: pdfColors.white,
    borderColor: pdfColors.tableBorder,
    borderWidth: 0.5,
  });

  page.drawText(`Configured Sizes: ${(product.sizes || ['25 kg', '50 kg']).join('   •   ')}`, {
    x: PDF_MARGIN_LEFT + 12,
    y: packY + 11,
    size: 8.5,
    font: boldFont,
    color: pdfColors.charcoal,
  });

  page.drawText('Packed in food-grade, aroma-sealed bags and tear-resistant woven sacks.', {
    x: PDF_MARGIN_LEFT + 12,
    y: packY + 2,
    size: 7,
    font: regularFont,
    color: pdfColors.mutedText,
  });

  y = packY - 18;

  // Commercial Wholesale Procurement Call-to-Action Box
  const ctaBoxY = Math.max(y - 54, 85);
  page.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: ctaBoxY,
    width: PDF_CONTENT_WIDTH,
    height: 54,
    color: pdfColors.forestGreen,
    borderColor: pdfColors.riceGold,
    borderWidth: 1,
  });

  page.drawText('DIRECT WHOLESALE PROCUREMENT INQUIRIES', {
    x: PDF_MARGIN_LEFT + 14,
    y: ctaBoxY + 36,
    size: 8.5,
    font: boldFont,
    color: pdfColors.riceGold,
  });

  page.drawText(
    `For scheduled institutional tenders, pallet orders, or supermarket supply contracts, contact Top Grade Rice Millers direct commercial desk:`,
    {
      x: PDF_MARGIN_LEFT + 14,
      y: ctaBoxY + 22,
      size: 7.5,
      font: regularFont,
      color: pdfColors.white,
    }
  );

  page.drawText(
    `Phone: ${company.contact.phoneDisplay}   |   WhatsApp: +${company.contact.whatsappNumber}   |   Email: ${company.contact.salesEmail}`,
    {
      x: PDF_MARGIN_LEFT + 14,
      y: ctaBoxY + 9,
      size: 8,
      font: boldFont,
      color: pdfColors.white,
    }
  );

  // Draw Standard Footer
  drawPdfFooter(page, 0, 1, regularFont, company);

  return await pdfDoc.save();
}
