import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { getCompanyData } from '@/lib/db';
import { generateSitePresentationPdf } from '@/lib/pdf/sitePresentationPdf';

async function main() {
  console.log('Loading company data...');
  const company = await getCompanyData();
  console.log('Company:', company.name, '| Town:', company.location?.town);

  console.log('Generating Site Presentation PDF...');
  const pdfBytes = await generateSitePresentationPdf(company);

  const doc = await PDFDocument.load(pdfBytes);
  console.log('PDF Generated successfully!');
  console.log('Page Count:', doc.getPageCount());
  console.log('Byte Size:', pdfBytes.length, 'bytes');

  // Output paths
  const publicPath = path.resolve(process.cwd(), 'public', 'Ahero-Top-Grade-Rice-Millers-Platform-Presentation.pdf');
  const brainDir = 'C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\ef6c00ac-e028-4981-9ee4-fbbc9c73e6dd';
  const brainPath = path.resolve(brainDir, 'Ahero-Top-Grade-Rice-Millers-Platform-Presentation.pdf');

  fs.writeFileSync(publicPath, Buffer.from(pdfBytes));
  console.log('Saved to public directory:', publicPath);

  if (fs.existsSync(brainDir)) {
    fs.writeFileSync(brainPath, Buffer.from(pdfBytes));
    console.log('Saved to brain directory:', brainPath);
  }
}

main().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
