# Farm to Home (ఫార్మ్ టు హోమ్ / फार्म टू होम)
> **Brand Slogan:** *"Fresh from the Farm. Naturally to Your Home."*

An AI-Powered Agricultural E-Commerce and Organic Farming Community Platform connecting verified Indian farmers directly with families, terrace gardeners, and conscious food buyers.

---

## 🌾 Platform Highlights & Unique Features

1. **Direct Farm Gate Commerce:**
   - 100% direct-from-grower fresh produce, native heirloom seeds, enriched vermicomposts, cow dung manures, cocopeat, and sustainably harvested wood products.
   - Prices in Indian Rupees (₹) with metric units (kg, g, packs, bundles, quintals).
   - Morning Harvest Dispatch: Harvested at daybreak upon order confirmation and delivered in breathable eco-crates.

2. **Digital Farm Passport (Agricultural Traceability):**
   - Every eligible harvest is linked to a digital, verifiable Farm Passport with unique batch ID (`F2H-2026-XX-XXXX`).
   - Discloses exact grower name, farm district & state, soil classification, water source, years completely chemical-free, and accredited laboratory testing notes.
   - Interactive QR code simulator for physical delivery crate scanning.

3. **Indian Seasonal Harvest Calendar:**
   - Interactive seasonal guide across **Kharif** (monsoon), **Rabi** (winter), **Zaid** (summer), and Year-round crops.
   - Filter by Indian agricultural states (Andhra Pradesh, Punjab, Gujarat, Tamil Nadu, Karnataka, Telangana).
   - Direct harvest pre-ordering from verified farmers before crops sell out.

4. **Farmer Direct Marketplace ("Meet Our Farmers"):**
   - Dedicated farmer profiles featuring experience (years), acreage, Subhash Palekar Natural Farming (SPNF) / ZBNF methods, PGS-India & NPOP certifications.
   - Direct contact channel protecting personal phone numbers and privacy.

5. **Farm to Home Knowledge Hub (Blogging Platform):**
   - Practical agronomy guides authored by experienced farmers and researchers.
   - Multi-language filtering: English, Telugu (తెలుగు), and Hindi (हिंदी).
   - Covers vermicomposting, neemastra/agniastra bio-shields, kitchen gardening, and soil regeneration.
   - Interactive likes, bookmarks, and moderated community discussions.

6. **Smart Farming Assistant (Agri AI):**
   - Bilingual conversational agricultural assistant supporting **English and Telugu**.
   - Recommends natural pest remedies, compost ratios, and potting mixes.
   - Recommends direct store products and Knowledge Hub articles.
   - Location-aware advice based on Indian agro-climatic zones.

7. **Farm Waste Exchange (Circular Rural Economy):**
   - Marketplace preventing crop burning by listing reusable agricultural materials: paddy stubble bales, coconut husks, well-aged cattle manure, and wood logs.
   - Supports Sale, Free Donation, and Barter Exchange.

8. **Secure Checkout & Order Tracking:**
   - Indian PIN-code deliverability verification across 10,000+ postal zones.
   - Flexible payment methods: UPI (GPay, PhonePe, Paytm, BHIM), Cash on Delivery (COD), Cards, and Netbanking.
   - Downloadable, printable Tax Invoices with GSTIN compliance and itemized price histories.

9. **Farmer & Admin Control Panels:**
   - **Seller Dashboard:** Real-time revenue metrics, product inventory management, stock controls, upcoming harvest scheduler, and blog authoring.
   - **Admin Dashboard:** Platform GMV oversight, farmer verification approvals, catalog compliance moderation, coupon manager, and delivery logistics rules.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router, Server & Client Components)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS with Nature-inspired Organic Palette (Forest Green, Warm Cream, Earth Brown, Harvest Gold)
- **Database:** Prisma ORM with SQLite (`dev.db`) for zero-friction local persistence (compatible with PostgreSQL via `DATABASE_URL`)
- **Icons:** Lucide React
- **Authentication:** Role-Based Access Control (Customer, Farmer, Admin, Author) with 1-click interactive demo presets

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18.17 or higher)
- npm (v9 or higher)

### 2. Installation
```bash
git clone https://github.com/your-username/farm-to-home.git
cd farm-to-home
npm install
```

### 3. Database Setup & Seeding
```bash
# Push schema and create SQLite database
npx prisma db push

# Seed rich authentic Indian agricultural catalog
node prisma/seed.js
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Accounts (1-Click Demo Login)

Farm to Home includes pre-configured demo credentials available directly on the `/auth/login` page:

| Role | Name | Email | Password | Pre-loaded Data |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Priya Sharma | `priya@example.com` | `Farm@123` | Pre-saved Bengaluru address, wishlist items, confirmed orders |
| **Farmer** | Ramesh Patel | `ramesh.patel@farmtohome.in` | `Farm@123` | Patel Natural Organics (Anand, Gujarat), 12.5 acres, PGS-India certified |
| **Admin** | Dr. Anand Swaminathan | `admin@farmtohome.in` | `Farm@123` | Full control center, seller approvals, catalog moderation |

---

## 🧪 Automated Test Suite

Run the built-in test suite to verify database integrity, pricing in ₹, Farm Passport batch codes, coupon calculations, and delivery rules:

```bash
npm test
```

Expected output:
```
========================================
🌾 FARM TO HOME PLATFORM TEST SUITE 🌾
========================================
📦 1. Database & Product Catalog Tests:
  ✅ PASS: Categories created (5 found)
  ✅ PASS: Product catalog loaded (9 products found)
  ✅ PASS: All products have positive prices in Indian Rupees (₹)
  ...
========================================
SUMMARY: 20 PASSED, 0 FAILED
========================================
```

---

## 📁 Key Project Directory Structure

```
farm-to-home/
├── prisma/
│   ├── schema.prisma          # Database schema (Products, Passports, Orders, Harvests, Blog)
│   └── seed.js                # Realistic seed dataset for Indian agriculture
├── scripts/
│   └── run-tests.js           # Automated validation suite (20 test cases)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Homepage (14 distinct sections)
│   │   ├── shop/              # Product catalog with filters & sorting
│   │   ├── categories/[slug]/ # Category landing pages
│   │   ├── products/[slug]/   # Product details, gallery, pin code checker, reviews
│   │   ├── farm-passport/     # Traceability explorer & batch verification
│   │   ├── harvest-calendar/  # Interactive Indian cropping seasons & pre-orders
│   │   ├── waste-exchange/    # Farm Waste Exchange marketplace
│   │   ├── blog/              # Knowledge Hub blog with English & Telugu guides
│   │   ├── assistant/         # Full-page Smart AI Farming Assistant
│   │   ├── cart/              # Cart page with coupon discounts & shipping progress
│   │   ├── checkout/          # Indian checkout with delivery slots & UPI simulator
│   │   ├── orders/            # Order history and downloadable GST invoice
│   │   ├── seller/dashboard/  # Farmer seller inventory & harvest management
│   │   ├── admin/dashboard/   # Administrator moderation control center
│   │   └── api/               # Next.js REST API routes
│   ├── components/            # Reusable UI components (Navbar, Footer, CartDrawer, etc.)
│   └── lib/                   # Utilities, contexts, and AI knowledge engine
```

---

## 📜 License
Developed with pride for Indian farmers and sustainable organic communities worldwide.
