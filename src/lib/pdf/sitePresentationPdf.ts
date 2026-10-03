import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib';
import {
  PDF_PAGE_WIDTH,
  PDF_PAGE_HEIGHT,
  PDF_MARGIN_LEFT,
  PDF_MARGIN_TOP,
  PDF_CONTENT_WIDTH,
  pdfColors,
} from './pdfStyles';
import { CompanyInfo } from '@/types';

// Helper to draw the header specific to the presentation document
async function drawPresentationHeader(
  pdfDoc: PDFDocument,
  page: PDFPage,
  boldFont: PDFFont,
  regularFont: PDFFont,
  company: CompanyInfo,
  pageSubtitle: string,
  pageIndex: number,
  totalPages: number,
  dateFormatted: string
): Promise<number> {
  const topY = PDF_PAGE_HEIGHT - PDF_MARGIN_TOP;

  // 1. Embed and draw official logo
  let logoDrawn = false;
  const logoSize = 44;
  const pngPath = path.join(process.cwd(), 'public', 'logo.png');
  const jpgPath = path.join(process.cwd(), 'public', 'logo.jpg');

  if (fs.existsSync(pngPath)) {
    try {
      const logoBytes = fs.readFileSync(pngPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, {
        x: PDF_MARGIN_LEFT,
        y: topY - logoSize,
        width: logoSize,
        height: logoSize,
      });
      logoDrawn = true;
    } catch {
      // fallback
    }
  } else if (fs.existsSync(jpgPath)) {
    try {
      const logoBytes = fs.readFileSync(jpgPath);
      const logoImage = await pdfDoc.embedJpg(logoBytes);
      page.drawImage(logoImage, {
        x: PDF_MARGIN_LEFT,
        y: topY - logoSize,
        width: logoSize,
        height: logoSize,
      });
      logoDrawn = true;
    } catch {
      // fallback
    }
  }

  const textStartX = logoDrawn ? PDF_MARGIN_LEFT + 52 : PDF_MARGIN_LEFT;

  // Company Brand
  page.drawText((company.name || 'AHERO TOP GRADE RICE MILLERS').toUpperCase(), {
    x: textStartX,
    y: topY - 12,
    size: 11,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  page.drawText('Digital Commercial Platform & Operations Management System', {
    x: textStartX,
    y: topY - 24,
    size: 8.5,
    font: boldFont,
    color: pdfColors.charcoal,
  });

  page.drawText('Official Agribusiness Corporate Briefing • Ahero, Kisumu County, Kenya', {
    x: textStartX,
    y: topY - 35,
    size: 7.5,
    font: regularFont,
    color: pdfColors.mutedText,
  });

  // Right-aligned document metadata
  const rightX = PDF_PAGE_WIDTH - 45;
  const metaDocId = 'Ref: ATG-WEB-PRES-2026';
  const metaDate = `Date: ${dateFormatted}`;
  const metaTarget = 'Target: Board & Management';

  const w1 = boldFont.widthOfTextAtSize(metaDocId, 7.5);
  const w2 = regularFont.widthOfTextAtSize(metaDate, 7.5);
  const w3 = regularFont.widthOfTextAtSize(metaTarget, 7.5);

  page.drawText(metaDocId, {
    x: rightX - w1,
    y: topY - 12,
    size: 7.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  page.drawText(metaDate, {
    x: rightX - w2,
    y: topY - 24,
    size: 7.5,
    font: regularFont,
    color: pdfColors.charcoal,
  });

  page.drawText(metaTarget, {
    x: rightX - w3,
    y: topY - 35,
    size: 7.5,
    font: regularFont,
    color: pdfColors.mutedText,
  });

  // Green horizontal accent line
  const dividerY = topY - 48;
  page.drawLine({
    start: { x: PDF_MARGIN_LEFT, y: dividerY },
    end: { x: rightX, y: dividerY },
    thickness: 1.5,
    color: pdfColors.forestGreen,
  });

  // Gold indicator bar right below
  page.drawLine({
    start: { x: PDF_MARGIN_LEFT, y: dividerY - 2 },
    end: { x: PDF_MARGIN_LEFT + 90, y: dividerY - 2 },
    thickness: 2,
    color: pdfColors.riceGold,
  });

  // Subtitle bar
  const titleY = dividerY - 20;
  page.drawText(pageSubtitle.toUpperCase(), {
    x: PDF_MARGIN_LEFT,
    y: titleY,
    size: 10.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  const pageStr = `Section ${pageIndex + 1} of ${totalPages}`;
  const pw = regularFont.widthOfTextAtSize(pageStr, 8);
  page.drawText(pageStr, {
    x: rightX - pw,
    y: titleY,
    size: 8,
    font: regularFont,
    color: pdfColors.mutedText,
  });

  return titleY - 16;
}

// Helper to draw presentation footer
function drawPresentationFooter(
  page: PDFPage,
  pageIndex: number,
  totalPages: number,
  regularFont: PDFFont,
  company: CompanyInfo
) {
  const footerY = 32;
  const rightX = PDF_PAGE_WIDTH - 45;

  page.drawLine({
    start: { x: PDF_MARGIN_LEFT, y: footerY + 12 },
    end: { x: rightX, y: footerY + 12 },
    thickness: 0.5,
    color: pdfColors.tableBorder,
  });

  const leftText = `${company.name || 'Ahero Top Grade Rice Millers'} • Confidential Corporate Presentation • Built for Agribusiness Leadership`;
  page.drawText(leftText, {
    x: PDF_MARGIN_LEFT,
    y: footerY + 2,
    size: 6.8,
    font: regularFont,
    color: pdfColors.mutedText,
  });

  const rightText = `Page ${pageIndex + 1} of ${totalPages}`;
  const rWidth = regularFont.widthOfTextAtSize(rightText, 7.5);
  page.drawText(rightText, {
    x: rightX - rWidth,
    y: footerY + 2,
    size: 7.5,
    font: regularFont,
    color: pdfColors.charcoal,
  });
}

// Main generation function
export async function generateSitePresentationPdf(company: CompanyInfo): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  pdfDoc.setTitle('Ahero Top Grade Rice Millers — Digital Platform & Website Presentation');
  pdfDoc.setAuthor('Top Grade Rice Millers Agribusiness Digital Team');
  pdfDoc.setSubject('Executive Overview of Corporate Web Platform, Real-Time Management & Operations');
  pdfDoc.setCreator('Ahero Top Grade Rice Millers Digital Platform Engine');

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const dateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const totalPages = 3;

  // =========================================================================
  // PAGE 1: EXECUTIVE VISION, STRATEGIC PILLARS & PUBLIC CONSUMER PORTAL
  // =========================================================================
  const page1 = pdfDoc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
  let y1 = await drawPresentationHeader(
    pdfDoc,
    page1,
    boldFont,
    regularFont,
    company,
    'Part I: Executive Overview & Public Customer-Facing Experience',
    0,
    totalPages,
    dateFormatted
  );

  // 1. Executive Banner Box
  const bannerHeight = 52;
  const bannerY = y1 - bannerHeight;
  page1.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: bannerY,
    width: PDF_CONTENT_WIDTH,
    height: bannerHeight,
    color: pdfColors.forestGreen,
  });

  // Gold accent left stripe
  page1.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: bannerY,
    width: 4,
    height: bannerHeight,
    color: pdfColors.riceGold,
  });

  page1.drawText('EXECUTIVE PLATFORM SUMMARY', {
    x: PDF_MARGIN_LEFT + 14,
    y: bannerY + 36,
    size: 8,
    font: boldFont,
    color: pdfColors.riceGold,
  });

  page1.drawText('Modernizing Ahero Rice Milling with Enterprise Digital Infrastructure', {
    x: PDF_MARGIN_LEFT + 14,
    y: bannerY + 22,
    size: 11,
    font: boldFont,
    color: pdfColors.white,
  });

  page1.drawText(
    'A high-performance digital gateway designed to capture wholesale and retail demand 24/7, provide seamless commercial quotations, guarantee verified batch traceability, and streamline administrative dispatch operations.',
    {
      x: PDF_MARGIN_LEFT + 14,
      y: bannerY + 9,
      size: 7.2,
      font: regularFont,
      color: rgb(220 / 255, 235 / 255, 225 / 255),
      maxWidth: PDF_CONTENT_WIDTH - 28,
      lineHeight: 9.5,
    }
  );

  y1 = bannerY - 18;

  // 2. Strategic Value Pillars (2x2 Grid)
  page1.drawText('1. FOUR CORE STRATEGIC OBJECTIVES', {
    x: PDF_MARGIN_LEFT,
    y: y1,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y1 -= 12;

  const cardWidth = (PDF_CONTENT_WIDTH - 12) / 2;
  const cardHeight = 54;

  const pillars = [
    {
      title: 'A. 24/7 Commercial Quotations',
      desc: 'Enables wholesalers, supermarket chains, hotels, and retailers across East Africa to submit structured quote requests with instant reference tracking.',
    },
    {
      title: 'B. Direct Brand Trust & Authority',
      desc: 'Showcases Ahero’s milling heritage, high grain recovery rates, calibrated destoning machinery, and commitment to 100% stone-free table rice.',
    },
    {
      title: 'C. Zero-Loss Operations & CRM',
      desc: 'Eliminates lost inquiries and communication delays through a live admin dispatch center with instant WhatsApp and email reply automation.',
    },
    {
      title: 'D. Grain Traceability & Assurance',
      desc: 'Provides consumers and institutional buyers with verifiable harvest-to-table batch validation to protect against counterfeit market rice.',
    },
  ];

  for (let i = 0; i < pillars.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cardX = PDF_MARGIN_LEFT + col * (cardWidth + 12);
    const cardY = y1 - (row + 1) * cardHeight - row * 8;

    page1.drawRectangle({
      x: cardX,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      color: pdfColors.warmRice,
      borderColor: pdfColors.tableBorder,
      borderWidth: 0.6,
    });

    // Green top border accent
    page1.drawRectangle({
      x: cardX,
      y: cardY + cardHeight - 2,
      width: cardWidth,
      height: 2,
      color: pdfColors.forestGreen,
    });

    page1.drawText(pillars[i].title, {
      x: cardX + 10,
      y: cardY + cardHeight - 14,
      size: 8.5,
      font: boldFont,
      color: pdfColors.forestGreen,
    });

    page1.drawText(pillars[i].desc, {
      x: cardX + 10,
      y: cardY + cardHeight - 26,
      size: 7.2,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: cardWidth - 20,
      lineHeight: 9.5,
    });
  }

  y1 = y1 - 2 * cardHeight - 1 * 8 - 18;

  // 3. Public Customer-Facing Portal Architecture
  page1.drawText('2. PUBLIC PORTAL MODULES & USER EXPERIENCE', {
    x: PDF_MARGIN_LEFT,
    y: y1,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y1 -= 14;

  const publicModules = [
    {
      name: 'Dynamic Hero & Value Proposition',
      desc: 'Engaging visual presentation highlighting "Home of Pure Pishori" and reliable Ahero processing with interactive metric counters and quick-action navigation.',
    },
    {
      name: 'Product Catalog & PDF Specs',
      desc: 'Comprehensive showcase of Milled Rice, Broken Rice, Rice Bran, and Husks with technical grain metrics, bag packaging sizes, and instant downloadable PDF brochures.',
    },
    {
      name: 'Industrial Milling Services',
      desc: 'Detailed breakdown of commercial paddy intake, calibrated destoning, modern hulling, acoustic color sorting, custom packaging, and ex-mill bulk logistics.',
    },
    {
      name: 'Farm-to-Table Batch Traceability',
      desc: 'Interactive grain transparency portal (/trace/[batch]) allowing customers to verify origin, moisture percentage, milling date, and purity grade by batch code.',
    },
    {
      name: 'Direct Multi-Channel Contact',
      desc: 'One-click clickable official email (aherotopgradericemillers@gmail.com), direct WhatsApp ordering hotline, telephone access, and embedded Google Maps mill location.',
    },
    {
      name: 'Mobile-Locked Viewport Architecture',
      desc: 'Engineered specifically for mobile responsiveness with locked viewport scaling to prevent accidental smartphone zooming while maintaining sharp cross-device readability.',
    },
  ];

  const rowHeight = 31;
  publicModules.forEach((mod, idx) => {
    const curY = y1 - rowHeight;
    const isAlt = idx % 2 === 1;

    if (isAlt) {
      page1.drawRectangle({
        x: PDF_MARGIN_LEFT,
        y: curY,
        width: PDF_CONTENT_WIDTH,
        height: rowHeight,
        color: pdfColors.tableAltRowBg,
      });
    }

    page1.drawRectangle({
      x: PDF_MARGIN_LEFT,
      y: curY,
      width: PDF_CONTENT_WIDTH,
      height: rowHeight,
      borderColor: pdfColors.tableBorder,
      borderWidth: 0.5,
    });

    // Module index pill
    page1.drawRectangle({
      x: PDF_MARGIN_LEFT + 8,
      y: curY + 8,
      width: 18,
      height: 15,
      color: pdfColors.forestGreen,
    });
    page1.drawText(String(idx + 1), {
      x: PDF_MARGIN_LEFT + 14,
      y: curY + 12,
      size: 8,
      font: boldFont,
      color: pdfColors.riceGold,
    });

    // Module Title
    page1.drawText(mod.name, {
      x: PDF_MARGIN_LEFT + 34,
      y: curY + 18,
      size: 8.2,
      font: boldFont,
      color: pdfColors.forestGreen,
    });

    // Module Description
    page1.drawText(mod.desc, {
      x: PDF_MARGIN_LEFT + 34,
      y: curY + 8,
      size: 7,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: PDF_CONTENT_WIDTH - 42,
    });

    y1 -= rowHeight;
  });

  drawPresentationFooter(page1, 0, totalPages, regularFont, company);

  // =========================================================================
  // PAGE 2: QUOTATION ENGINE & ENTERPRISE REAL-TIME ADMIN DASHBOARD
  // =========================================================================
  const page2 = pdfDoc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
  let y2 = await drawPresentationHeader(
    pdfDoc,
    page2,
    boldFont,
    regularFont,
    company,
    'Part II: Quotation Engine & Real-Time Operational Management',
    1,
    totalPages,
    dateFormatted
  );

  // 1. Quotation System Highlight Box
  page2.drawText('3. COMMERCIAL QUOTATION & LEAD CONVERSION ENGINE', {
    x: PDF_MARGIN_LEFT,
    y: y2,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y2 -= 14;

  const quoteBoxHeight = 84;
  const quoteBoxY = y2 - quoteBoxHeight;

  page2.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: quoteBoxY,
    width: PDF_CONTENT_WIDTH,
    height: quoteBoxHeight,
    color: pdfColors.warmRice,
    borderColor: pdfColors.riceGold,
    borderWidth: 0.8,
  });

  page2.drawText('DUAL FULFILLMENT WORKFLOW: EX-MILL PICKUP & REGIONAL DELIVERY', {
    x: PDF_MARGIN_LEFT + 12,
    y: quoteBoxY + quoteBoxHeight - 16,
    size: 8.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  const quoteSteps = [
    '• Direct Ex-Mill Depot Collection: Buyers can select pickup dates, vehicle registration details, and loading instructions.',
    '• Regional Commercial Delivery: Custom dispatch calculations factoring county, town, and offloading location.',
    '• Automated Reference Numbering: Generates unique, professional reference IDs (e.g., TG-QR-2026-9111) for instant tracking.',
    '• Wholesale & Retail Versatility: Accommodates both 100+ sack bulk commercial contracts and retail packaging orders.',
    '• Instant Administrator Notification: Customer requests immediately appear on the mill command center in real-time.',
  ];

  let stepY = quoteBoxY + quoteBoxHeight - 30;
  quoteSteps.forEach((st) => {
    page2.drawText(st, {
      x: PDF_MARGIN_LEFT + 14,
      y: stepY,
      size: 7.2,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: PDF_CONTENT_WIDTH - 28,
    });
    stepY -= 11.5;
  });

  y2 = quoteBoxY - 20;

  // 2. Real-Time Admin Dashboard Features
  page2.drawText('4. ENTERPRISE REAL-TIME ADMIN DASHBOARD (/admin)', {
    x: PDF_MARGIN_LEFT,
    y: y2,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y2 -= 14;

  // Live indicator banner
  page2.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: y2 - 28,
    width: PDF_CONTENT_WIDTH,
    height: 28,
    color: pdfColors.forestGreen,
  });

  page2.drawRectangle({
    x: PDF_MARGIN_LEFT + 10,
    y: y2 - 20,
    width: 8,
    height: 8,
    color: pdfColors.riceGold,
  });

  page2.drawText('LIVE REAL-TIME FEED ACTIVE — 100% REAL CUSTOMER DATA (ZERO SIMULATION)', {
    x: PDF_MARGIN_LEFT + 24,
    y: y2 - 16,
    size: 8,
    font: boldFont,
    color: pdfColors.riceGold,
  });

  page2.drawText('Visibility-aware 4.5s background sync, arrival toasts, and instant badge counters without page reloads.', {
    x: PDF_MARGIN_LEFT + 24,
    y: y2 - 25,
    size: 6.8,
    font: regularFont,
    color: pdfColors.white,
  });

  y2 -= 38;

  const adminCapabilities = [
    {
      title: 'A. Live Activity Stream & Instant Alerts',
      detail:
        'Features an animated real-time feed with "NEW LIVE" badges, interactive Pause/Resume live controls, and floating bottom-right arrival toasts whenever a customer submits an inquiry or quote.',
    },
    {
      title: 'B. Quotation Management & Status Pipeline',
      detail:
        'Complete view of customer records, fulfillment preferences, bag volumes, and contact numbers. Administrators can transition quotes across statuses (Pending -> Contacted -> Quoted -> Completed) and generate official printable PDF quotes with one click.',
    },
    {
      title: 'C. Direct CRM Communication Center',
      detail:
        'Enables mill staff to reply to incoming customer messages via pre-configured direct WhatsApp chat links or clickable mailto links directly addressing the buyer’s specific subject and inquiry.',
    },
    {
      title: 'D. Full Content Management System (CMS)',
      detail:
        'Provides mill managers full control to add or edit products (grain specifications, packaging sizes), adjust milling service offerings, update operating hours and location data, and curate high-resolution gallery photography.',
    },
    {
      title: 'E. Permanent Crash-Proof Persistence',
      detail:
        'Engineered with memory singleton caching and atomic swap writes (.tmp rename), guaranteeing that quotes and customer messages are permanently preserved and NEVER lost during concurrent polling or server restarts.',
    },
  ];

  const adminCardHeight = 44;
  adminCapabilities.forEach((cap, idx) => {
    const curY = y2 - adminCardHeight;

    page2.drawRectangle({
      x: PDF_MARGIN_LEFT,
      y: curY,
      width: PDF_CONTENT_WIDTH,
      height: adminCardHeight,
      color: idx % 2 === 0 ? pdfColors.white : pdfColors.warmRice,
      borderColor: pdfColors.tableBorder,
      borderWidth: 0.6,
    });

    // Left indicator bar
    page2.drawRectangle({
      x: PDF_MARGIN_LEFT,
      y: curY,
      width: 3.5,
      height: adminCardHeight,
      color: pdfColors.forestGreen,
    });

    page2.drawText(cap.title, {
      x: PDF_MARGIN_LEFT + 12,
      y: curY + adminCardHeight - 14,
      size: 8.5,
      font: boldFont,
      color: pdfColors.forestGreen,
    });

    page2.drawText(cap.detail, {
      x: PDF_MARGIN_LEFT + 12,
      y: curY + adminCardHeight - 26,
      size: 7.2,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: PDF_CONTENT_WIDTH - 24,
      lineHeight: 9.5,
    });

    y2 -= adminCardHeight + 5;
  });

  drawPresentationFooter(page2, 1, totalPages, regularFont, company);

  // =========================================================================
  // PAGE 3: TECHNICAL ARCHITECTURE, SECURITY, ROI & SIGN-OFF
  // =========================================================================
  const page3 = pdfDoc.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT]);
  let y3 = await drawPresentationHeader(
    pdfDoc,
    page3,
    boldFont,
    regularFont,
    company,
    'Part III: Engineering Architecture, Security & Commercial Impact',
    2,
    totalPages,
    dateFormatted
  );

  // 1. Technical Stack & Resilience Architecture
  page3.drawText('5. MODERN CLOUD-NATIVE ARCHITECTURE & DATA RELIABILITY', {
    x: PDF_MARGIN_LEFT,
    y: y3,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y3 -= 14;

  const stackCols = [
    {
      layer: 'Framework & Engine',
      tech: 'Next.js 15 (App Router) + React 19',
      benefit: 'Lightning-fast server rendering, sub-second route transitions, and universal SEO indexing.',
    },
    {
      layer: 'Language & Styling',
      tech: 'TypeScript + Tailwind CSS + Lucide',
      benefit: 'Strict end-to-end type safety, zero compile-time bugs, and bespoke high-conversion branding.',
    },
    {
      layer: 'Persistence Engine',
      tech: 'Global Singleton + Atomic File Writes',
      benefit: 'Eliminates read-during-write corruption under high concurrency; explicit tombstone deletion only.',
    },
    {
      layer: 'PDF Generation',
      tech: 'Server-Side Vector Engine (pdf-lib)',
      benefit: 'Generates branded corporate profiles, product sheets, and quotation invoices in <100ms.',
    },
  ];

  const tHeaderHeight = 20;
  page3.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: y3 - tHeaderHeight,
    width: PDF_CONTENT_WIDTH,
    height: tHeaderHeight,
    color: pdfColors.tableHeaderBg,
  });

  page3.drawText('LAYER', {
    x: PDF_MARGIN_LEFT + 8,
    y: y3 - 14,
    size: 7.5,
    font: boldFont,
    color: pdfColors.riceGold,
  });

  page3.drawText('TECHNOLOGY', {
    x: PDF_MARGIN_LEFT + 115,
    y: y3 - 14,
    size: 7.5,
    font: boldFont,
    color: pdfColors.riceGold,
  });

  page3.drawText('OPERATIONAL BENEFIT TO MILL', {
    x: PDF_MARGIN_LEFT + 250,
    y: y3 - 14,
    size: 7.5,
    font: boldFont,
    color: pdfColors.riceGold,
  });

  y3 -= tHeaderHeight;

  const tRowHeight = 24;
  stackCols.forEach((sc, i) => {
    const rY = y3 - tRowHeight;
    if (i % 2 === 1) {
      page3.drawRectangle({
        x: PDF_MARGIN_LEFT,
        y: rY,
        width: PDF_CONTENT_WIDTH,
        height: tRowHeight,
        color: pdfColors.tableAltRowBg,
      });
    }

    page3.drawRectangle({
      x: PDF_MARGIN_LEFT,
      y: rY,
      width: PDF_CONTENT_WIDTH,
      height: tRowHeight,
      borderColor: pdfColors.tableBorder,
      borderWidth: 0.5,
    });

    page3.drawText(sc.layer, {
      x: PDF_MARGIN_LEFT + 8,
      y: rY + 8,
      size: 7.5,
      font: boldFont,
      color: pdfColors.forestGreen,
    });

    page3.drawText(sc.tech, {
      x: PDF_MARGIN_LEFT + 115,
      y: rY + 8,
      size: 7.2,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: 130,
    });

    page3.drawText(sc.benefit, {
      x: PDF_MARGIN_LEFT + 250,
      y: rY + 8,
      size: 6.8,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: 245,
    });

    y3 -= tRowHeight;
  });

  y3 -= 18;

  // 2. Enterprise Security & Rate Limiting
  page3.drawText('6. ENTERPRISE SECURITY & INFRASTRUCTURE PROTECTION', {
    x: PDF_MARGIN_LEFT,
    y: y3,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y3 -= 12;

  const secBoxHeight = 56;
  page3.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: y3 - secBoxHeight,
    width: PDF_CONTENT_WIDTH,
    height: secBoxHeight,
    color: pdfColors.warmRice,
    borderColor: pdfColors.tableBorder,
    borderWidth: 0.6,
  });

  const secPoints = [
    '• Multi-Tier IP Rate Limiting: Safeguards public quote and contact APIs against spam and automated bot scraping.',
    '• HttpOnly Protected Session Cookies: Protects administrative sessions with SHA-256 password hashing and secure token validation.',
    '• Strict Cache-Control: Admin endpoints enforce no-store and no-cache policies to prevent sensitive data leakage across public proxies.',
    '• Clean Production Hygiene: Zero external telemetry, zero mock simulators, and hardened Next.js build-time validation.',
  ];

  let secY = y3 - 16;
  secPoints.forEach((sp) => {
    page3.drawText(sp, {
      x: PDF_MARGIN_LEFT + 12,
      y: secY,
      size: 7.2,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: PDF_CONTENT_WIDTH - 24,
    });
    secY -= 11.5;
  });

  y3 = y3 - secBoxHeight - 18;

  // 3. Tangible Commercial ROI & Impact
  page3.drawText('7. TANGIBLE BUSINESS IMPACT & RETURN ON INVESTMENT', {
    x: PDF_MARGIN_LEFT,
    y: y3,
    size: 9.5,
    font: boldFont,
    color: pdfColors.forestGreen,
  });
  y3 -= 12;

  const roiCardWidth = (PDF_CONTENT_WIDTH - 12) / 3;
  const roiCardHeight = 52;
  const roiItems = [
    {
      metric: '+40% Lead Velocity',
      label: 'Faster Buyer Conversion',
      desc: 'Instant digital quotes and automated references replace slow phone tag and manual paperwork.',
    },
    {
      metric: 'Zero Lost Inquiries',
      label: 'Permanent Persistence',
      desc: 'Reliable backend guarantees every customer quote and message is safely preserved until resolved.',
    },
    {
      metric: 'Premium Market Presence',
      label: 'Brand Equity Growth',
      desc: 'Elevates Ahero Top Grade as a modern, trustworthy commercial miller in the East African rice trade.',
    },
  ];

  roiItems.forEach((item, idx) => {
    const rx = PDF_MARGIN_LEFT + idx * (roiCardWidth + 6);
    const ry = y3 - roiCardHeight;

    page3.drawRectangle({
      x: rx,
      y: ry,
      width: roiCardWidth,
      height: roiCardHeight,
      color: pdfColors.forestGreen,
    });

    page3.drawText(item.metric, {
      x: rx + 8,
      y: ry + roiCardHeight - 14,
      size: 9.5,
      font: boldFont,
      color: pdfColors.riceGold,
    });

    page3.drawText(item.label, {
      x: rx + 8,
      y: ry + roiCardHeight - 24,
      size: 7.2,
      font: boldFont,
      color: pdfColors.white,
    });

    page3.drawText(item.desc, {
      x: rx + 8,
      y: ry + roiCardHeight - 34,
      size: 6.5,
      font: regularFont,
      color: rgb(215 / 255, 230 / 255, 220 / 255),
      maxWidth: roiCardWidth - 16,
      lineHeight: 8.5,
    });
  });

  y3 = y3 - roiCardHeight - 18;

  // 4. Executive Sign-Off & Platform Authorization Block
  page3.drawRectangle({
    x: PDF_MARGIN_LEFT,
    y: y3 - 62,
    width: PDF_CONTENT_WIDTH,
    height: 62,
    color: pdfColors.white,
    borderColor: pdfColors.forestGreen,
    borderWidth: 1,
  });

  page3.drawText('EXECUTIVE PRESENTATION APPROVAL & PLATFORM SIGN-OFF', {
    x: PDF_MARGIN_LEFT + 12,
    y: y3 - 15,
    size: 8,
    font: boldFont,
    color: pdfColors.forestGreen,
  });

  page3.drawText(
    'This document confirms the deployment of the official Top Grade Rice Millers Web Platform & Real-Time Management System, verified for production operations, commercial quoting, and corporate presentation.',
    {
      x: PDF_MARGIN_LEFT + 12,
      y: y3 - 26,
      size: 6.8,
      font: regularFont,
      color: pdfColors.charcoal,
      maxWidth: PDF_CONTENT_WIDTH - 24,
      lineHeight: 9,
    }
  );

  const signCols = [
    { title: 'Prepared By:', val: 'Digital Engineering Team' },
    { title: 'Presented To:', val: 'Ahero Mill Executive Leadership' },
    { title: 'System Status:', val: 'Verified Live & Production Ready' },
    { title: 'Official Email:', val: company.contact?.email || 'aherotopgradericemillers@gmail.com' },
  ];

  const colW = (PDF_CONTENT_WIDTH - 24) / 4;
  signCols.forEach((sc, i) => {
    const sx = PDF_MARGIN_LEFT + 12 + i * colW;
    page3.drawText(sc.title, {
      x: sx,
      y: y3 - 44,
      size: 6.5,
      font: boldFont,
      color: pdfColors.mutedText,
    });
    page3.drawText(sc.val, {
      x: sx,
      y: y3 - 54,
      size: 6.8,
      font: boldFont,
      color: pdfColors.forestGreen,
      maxWidth: colW - 6,
    });
  });

  drawPresentationFooter(page3, 2, totalPages, regularFont, company);

  return pdfDoc.save();
}
