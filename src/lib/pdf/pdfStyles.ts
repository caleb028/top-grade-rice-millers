import { rgb } from 'pdf-lib';

export const PDF_PAGE_WIDTH = 595.28; // A4 portrait width in points
export const PDF_PAGE_HEIGHT = 841.89; // A4 portrait height in points

export const PDF_MARGIN_LEFT = 45;
export const PDF_MARGIN_RIGHT = 45;
export const PDF_MARGIN_TOP = 40;
export const PDF_MARGIN_BOTTOM = 45;
export const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN_LEFT - PDF_MARGIN_RIGHT; // 505.28

export const pdfColors = {
  forestGreen: rgb(18 / 255, 61 / 255, 42 / 255), // #123D2A
  forestGreenDark: rgb(11 / 255, 37 / 255, 25 / 255), // #0B2519
  riceGold: rgb(212 / 255, 167 / 255, 44 / 255), // #D4A72C
  warmRice: rgb(248 / 255, 246 / 255, 239 / 255), // #F8F6EF
  charcoal: rgb(23 / 255, 33 / 255, 28 / 255), // #17211C
  mutedText: rgb(100 / 255, 115 / 255, 105 / 255),
  tableBorder: rgb(215 / 255, 225 / 255, 218 / 255),
  tableHeaderBg: rgb(18 / 255, 61 / 255, 42 / 255),
  tableAltRowBg: rgb(248 / 255, 246 / 255, 239 / 255),
  white: rgb(1, 1, 1),
  dividerGold: rgb(212 / 255, 167 / 255, 44 / 255),
};
