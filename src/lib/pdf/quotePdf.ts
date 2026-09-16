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
import { QuoteRequest, CompanyInfo } from '@/types';

export async function generateQuotePdf(
  quote: QuoteRequest,
  company: CompanyInfo
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  const reqType = quote.requestType || 'wholesale';
  let docTitle = 'Quote Request';
  let reqTypeLabel = 'Retail / Personal Purchase';

  if (reqType === 'wholesale') {
    docTitle = 'Wholesale Quote Request';
    reqTypeLabel = 'Wholesale / Bulk Purchase';
  } else if (reqType === 'business') {
    docTitle = 'Institutional Quote Request';
    reqTypeLabel = 'Business / Institution Supply';
  } else if (reqType === 'milling') {
    docTitle = 'Milling Service Request';
    reqTypeLabel = 'Rice Milling & Grain Processing';
  } else if (reqType === 'other') {
    docTitle = 'Customer Enquiry';
    reqTypeLabel = 'General Customer Enquiry';
  }

  // Document metadata
  pdfDoc.setTitle(`Top Grade Rice Millers — ${docTitle} ${quote.referenceNumber}`);
  pdfDoc.setAuthor('Top Grade Rice Millers');
  pdfDoc.setSubject(`${docTitle} for ${quote.name}`);
  pdfDoc.setCreator('Top Grade Rice Millers Digital Management Portal');
  pdfDoc.setProducer('Top Grade Rice Millers PDF Engine');

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const page = pdfDoc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);

  const dateFormatted = new Date(quote.createdAt).toLocaleDateString('en-GB', {
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
    docTitle,
    quote.referenceNumber,
    dateFormatted
  );

  // Status Banner
  const bannerY = y - 24;
  page.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: bannerY,
    width: PDF_CONTENT_WIDTH,
    height: 24,
    color: pdfColors.warmRice,
    borderColor: pdfColors.tableBorder,
    borderWidth: 0.5,
  });

  page.drawText('CURRENT INQUIRY STATUS:', {
    x: PDF_MARGIN_LEFT + 12,
    y: bannerY + 7,
    size: 8,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  page.drawText(quote.status.toUpperCase(), {
    x: PDF_MARGIN_LEFT + 150,
    y: bannerY + 7,
    size: 8.5,
    font: boldFont,
    color: quote.status === 'Completed' ? pdfColors.forestGreen : pdfColors.riceGold,
  });

  page.drawText(`Customer Ref: ${quote.referenceNumber}`, {
    x: PDF_PAGE_WIDTH - 45 - regularFont.widthOfTextAtSize(`Customer Ref: ${quote.referenceNumber}`, 8) - 12,
    y: bannerY + 7,
    size: 8,
    font: regularFont,
    color: pdfColors.mutedText,
  });

  y = bannerY - 20;

  // Function to draw a clean structured table
  const drawSectionTable = (
    title: string,
    rows: Array<{ label: string; value: string; highlight?: boolean }>
  ) => {
    // Section Title
    page.drawText(title.toUpperCase(), {
      x: PDF_MARGIN_LEFT,
      y: y,
      size: 10,
      font: boldFont,
      color: pdfColors.forestGreen,
    });
    y -= 14;

    const rowHeight = 22;
    const labelColWidth = 140;
    const valueColWidth = PDF_CONTENT_WIDTH - labelColWidth;

    rows.forEach((r, idx) => {
      const rowY = y - rowHeight;
      const isAlt = idx % 2 === 1;

      // Row background
      if (isAlt) {
        page.drawRectangle({
          x: PDF_MARGIN_LEFT,
          y: rowY,
          width: PDF_CONTENT_WIDTH,
          height: rowHeight,
          color: pdfColors.tableAltRowBg,
        });
      }

      // Border outline
      page.drawRectangle({
        x: PDF_MARGIN_LEFT,
        y: rowY,
        width: PDF_CONTENT_WIDTH,
        height: rowHeight,
        borderColor: pdfColors.tableBorder,
        borderWidth: 0.5,
      });

      // Label
      page.drawText(r.label, {
        x: PDF_MARGIN_LEFT + 10,
        y: rowY + 7,
        size: 8.5,
        font: boldFont,
        color: pdfColors.charcoal,
      });

      // Value
      page.drawText(r.value, {
        x: PDF_MARGIN_LEFT + labelColWidth + 10,
        y: rowY + 7,
        size: 8.5,
        font: r.highlight ? boldFont : regularFont,
        color: r.highlight ? pdfColors.forestGreen : pdfColors.charcoal,
      });

      y -= rowHeight;
    });

    y -= 16; // spacing after section
  };

  // Section 1: Customer Information
  const customerRows: Array<{ label: string; value: string; highlight?: boolean }> = [
    { label: 'Customer / Contact', value: quote.name },
  ];

  if (quote.organization || quote.company) {
    customerRows.push({
      label: 'Organization / Business',
      value: quote.organization || quote.company || '',
    });
  }

  customerRows.push({ label: 'Telephone Contact', value: quote.phone });
  customerRows.push({ label: 'Email Address', value: quote.email || 'Not Provided (Optional)' });
  customerRows.push({ label: 'Request Category', value: reqTypeLabel, highlight: true });

  drawSectionTable('1. Customer Information', customerRows);

  // Section 2: Request Specifications
  if (reqType === 'milling') {
    drawSectionTable('2. Grain Processing Specifications', [
      {
        label: 'Paddy / Grain Variety',
        value: quote.millingDetails?.riceType || quote.productName || 'Paddy Rice',
        highlight: true,
      },
      {
        label: 'Estimated Volume',
        value: `${quote.quantity || quote.quantityBags || '—'} ${quote.unit || 'Bags'}`,
        highlight: true,
      },
      {
        label: 'Processing Requirements',
        value: quote.millingDetails?.requirements || 'Standard sorting & grading',
      },
      {
        label: 'Paddy Source Depot',
        value: quote.deliveryLocation,
      },
      {
        label: 'Preferred Date',
        value: quote.millingDetails?.preferredDate || 'To be scheduled upon receipt',
      },
    ]);
  } else if (reqType === 'other') {
    drawSectionTable('2. Enquiry Specifications', [
      {
        label: 'Enquiry Subject',
        value: quote.subject || quote.productName || 'General Enquiry',
        highlight: true,
      },
      {
        label: 'Customer Segment',
        value: quote.customerType || 'General Customer',
      },
      {
        label: 'Location / Town',
        value: quote.deliveryLocation,
      },
    ]);
  } else {
    // Retail, Wholesale, Business
    const qtyVal = quote.quantity || quote.quantityBags || 1;
    const unitVal = quote.unit || 'Bags';
    const specRows: Array<{ label: string; value: string; highlight?: boolean }> = [
      {
        label: 'Product Requested',
        value: quote.productName || 'Top Grade Mwea Pishori Rice',
        highlight: true,
      },
      {
        label: 'Order Volume',
        value: `${qtyVal} ${unitVal}${quote.bagSize ? ` (${quote.bagSize})` : ''}`,
        highlight: true,
      },
    ];

    if (quote.bagSize) {
      specRows.push({
        label: 'Packaging Specification',
        value: quote.bagSize,
      });
    }

    if (quote.fulfillmentType === 'pickup') {
      specRows.push({
        label: 'Fulfillment Method',
        value: "Direct Client Self Pick-up at Mill (Wang'uru, Mwea)",
        highlight: true,
      });
      if (quote.pickupDate) {
        specRows.push({
          label: 'Planned Collection Date',
          value: quote.pickupDate,
        });
      }
      if (quote.pickupNotes) {
        specRows.push({
          label: 'Vehicle / Transport',
          value: quote.pickupNotes,
        });
      }
      specRows.push({
        label: 'Supply Terms',
        value: "Ex-Mill Wang'uru Facility · Direct Handover upon Loading",
      });
    } else {
      specRows.push({
        label: 'Fulfillment Method',
        value: 'Road Dispatch / Delivery to Destination',
      });
      specRows.push({
        label: 'Delivery Destination',
        value: quote.deliveryLocation,
      });
      specRows.push({
        label: 'Supply Terms',
        value: "Ex-Mill Wang'uru Hub or Scheduled Transit Dispatch",
      });
    }

    drawSectionTable('2. Procurement Specifications', specRows);
  }

  // Section 3: Customer Requirements / Notes
  if (quote.message) {
    page.drawText('3. CUSTOMER REQUIREMENTS & NOTES', {
      x: PDF_MARGIN_LEFT,
      y: y,
      size: 10,
      font: boldFont,
      color: pdfColors.forestGreen,
    });
    y -= 14;

    const boxHeight = 50;
    page.drawRectangle({
      x: PDF_MARGIN_LEFT,
      y: y - boxHeight,
      width: PDF_CONTENT_WIDTH,
      height: boxHeight,
      color: pdfColors.warmRice,
      borderColor: pdfColors.tableBorder,
      borderWidth: 0.5,
    });

    // Wrapped message text
    page.drawText(`"${quote.message}"`, {
      x: PDF_MARGIN_LEFT + 10,
      y: y - 18,
      size: 8.5,
      font: italicFont,
      color: pdfColors.charcoal,
      maxWidth: PDF_CONTENT_WIDTH - 20,
    });

    y -= boxHeight + 20;
  }

  // Official Assurance Stamp Box
  const assuranceBoxY = Math.max(y - 45, 90);
  page.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: assuranceBoxY,
    width: PDF_CONTENT_WIDTH,
    height: 45,
    color: pdfColors.white,
    borderColor: pdfColors.riceGold,
    borderWidth: 0.75,
  });

  page.drawText('OFFICIAL GRAIN QUALITY GUARANTEE', {
    x: PDF_MARGIN_LEFT + 12,
    y: assuranceBoxY + 30,
    size: 7.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  page.drawText(
    'Milled from authenticated Mwea paddy harvest. Precision gravity destoned, multi-deck graded, and guaranteed under 13.5% moisture at packaging. Official commercial invoices issued upon dispatch verification.',
    {
      x: PDF_MARGIN_LEFT + 12,
      y: assuranceBoxY + 16,
      size: 6.5,
      font: regularFont,
      color: pdfColors.mutedText,
      maxWidth: PDF_CONTENT_WIDTH - 24,
      lineHeight: 9,
    }
  );

  // Draw Standard Footer
  drawPdfFooter(page, 0, 1, regularFont, company);

  return await pdfDoc.save();
}
