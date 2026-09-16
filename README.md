# TOP GRADE RICE MILLERS — Official Web Platform & Admin System

> **"Home of Pure Pishori"**  
> *Premium Rice. Proudly Milled in Mwea, Kirinyaga County, Kenya.*

---

## Overview

The official web platform and administrative management system for **Top Grade Rice Millers** located in the heart of Mwea, Kenya. The platform provides customer discovery, an interactive quotation workflow, contract milling inquiries, batch traceability, and a unified administration dashboard.

### Key Capabilities

1. **Universal Quote Request System**
   - Multi-tiered request flows for:
     - **Retail / Personal Purchases**
     - **Wholesale / Bulk Orders**
     - **Businesses and Institutions** (Hotels, Schools, Hospitals)
     - **Rice Milling Services** (Paddy hulling, color sorting, grading)
     - **General Inquiries**
   - Dynamic validation, Kenyan county/town targeting, automated reference generation (`TG-QR-2026-XXXX`), and instant WhatsApp dispatch.

2. **Top Grade Admin Workspace (`/admin`)**
   - Lightweight, unified administration system.
   - **Dashboard**: High-level metrics, real-time inquiry volume, quick actions.
   - **Products**: Grain catalog, specifications, pack sizes, active states.
   - **Quote Requests**: Type-filtered review pipeline (All, Retail, Wholesale, Business, Milling, Other), badge indicators, detailed views, status management, and CSV export.
   - **Contact Messages**: Customer inquiries with reply tracking and status tags.
   - **Services**: Commercial milling capability manager.
   - **Gallery**: Photo showcase management with verified uploads.
   - **Company Information**: Verified addresses, coordinates, phone numbers, and operational hours.
   - **Settings**: Salted PBKDF2 password updates, security controls, notification toggles.

3. **Branded PDF Generation System**
   - High-fidelity, print-ready A4 business documents generated via `pdf-lib`.
   - Embeds official company logo, authentic typography, and consistent brand palettes.
   - Generates official quotation documents, product specification sheets, and company profiles.

4. **Production Security Architecture**
   - HMAC-SHA256 signed admin session cookies with tamper resistance.
   - Salted PBKDF2 credential hashing.
   - Edge middleware protection for administrative routes.
   - Rate-limiting protection across public quote and contact APIs.
   - Strict Content Security Policy (CSP), HSTS, `X-Frame-Options: SAMEORIGIN`, and `nosniff` headers.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.7
- **UI and Styling**: React 19, Tailwind CSS 3.4, Framer Motion
- **Icons**: Lucide React
- **Document Generation**: pdf-lib
- **Storage**: Seeded JSON document database with resilient `/tmp` serverless fallback

---

## Getting Started Locally

### Prerequisites
- Node.js 18.18+ or 20+
- npm 9+

### 1. Installation
```bash
git clone https://github.com/<your-username>/top-grade-rice-millers.git
cd top-grade-rice-millers
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Set your environment variables:
```env
SESSION_SECRET=your_32_character_cryptographic_secret_here
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the website.

### 4. Production Build & Start
```bash
npm run build
npm run start
```

---

## Admin Dashboard Access

- **Route**: `/admin` (or `/admin/login`)
- **Default Email**: `admin@topgradericemillers.co.ke`
- **Default Password**: `topgrade2026`

*(Admin password can be updated anytime under `/admin/settings`)*

---

## Deploying to Vercel

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: Top Grade Rice Millers production platform and admin dashboard"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. In your Vercel Dashboard (https://vercel.com/new):
   - Click **Add New Project** and select your GitHub repository.
   - Framework Preset will automatically detect **Next.js**.
   - Under **Environment Variables**, add:
     - `SESSION_SECRET`: A secure random 32+ character string.
     - `NEXT_PUBLIC_SITE_URL`: Your production Vercel URL or custom domain (e.g., `https://topgradericemillers.co.ke`).
   - Click **Deploy**.

---

## License & Copyright

© 2026 Top Grade Rice Millers. All rights reserved. Mwea, Kirinyaga County, Kenya.
