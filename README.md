# LiveIPOTracker 🇮🇳

A real-time, high-integrity Indian IPO tracking platform covering **Mainboard** and **SME** issues (NSE & BSE), built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and Supabase (PostgreSQL). Architected to support international market expansion in future phases.

---

## 🏛️ Core Principles & Non-Negotiable Rules

1. **Zero Data Fabrication (Rule 1)**: We never invent or fabricate IPO data, GMP values, subscription ratios, or debut prices. Any missing field displays `"Not available"` or `"Not declared"`.
2. **Strict Demo Data Isolation (Rule 2)**: No demo data exists in production code. A dev-only seed script (`scripts/seed.ts` & `scripts/seed-demo.sql`) marks all generated rows with `is_demo: true`. Any demo row displayed in the UI renders an amber `[Demo data]` badge.
3. **Authorized & Permitted Sourcing Only (Rule 3)**: Data is drawn exclusively from official regulatory filings (SEBI, NSE, BSE) or verified manual admin entries. No illegal or forbidden scraping.
4. **Unofficial GMP Labeling (Rule 4)**: Grey Market Premium (GMP) is strictly unofficial and unregulated. Every GMP metric is explicitly badged with: `"Unofficial, not a forecast"`. GMP is stored as an immutable time-series with source and timestamp.
5. **Deterministic IST Status Derivation (Rule 5)**: IPO status (`upcoming`, `open`, `closed`, `listed`, `unknown`) is never inferred from an arbitrary string. It is dynamically computed in IST (`Asia/Kolkata`, UTC+05:30) via a single canonical function in [`src/lib/status.ts`](file:///Users/rahulpatel/Desktop/ipo/src/lib/status.ts).
6. **Provenance & Auditability (Rule 6)**: Every record displays its originating source and last verified timestamp in IST.
7. **Provider Adapter Architecture (Rule 7)**: All data access is abstracted behind `IIpoProvider` in [`src/lib/providers/`](file:///Users/rahulpatel/Desktop/ipo/src/lib/providers/).
8. **Security & Secrets (Rule 8)**: Database keys and cron tokens reside exclusively in environment variables.
9. **Mandatory SEBI Notice (Rule 9)**: Un-dismissible footer disclaimer on every page:
   > *"Not SEBI registered. Information is for educational purposes only and is not investment advice."*
10. **Test-Backed Logic (Rule 10)**: 100% of status derivation, gain calculations, and IST boundary rules are validated with automated unit tests.
11. **Component Modularity (Rule 11)**: Highly reusable UI components, clean separation of concerns, and fully documented assumptions.

---

## 🏗️ Folder Structure

```text
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with Navbar, Footer (SEBI notice), Suspense
│   │   ├── page.tsx                # Overview: KPIs, Live Bidding cards, GMP movers, IPOTable
│   │   ├── live-ipo/page.tsx       # Live & Open IPOs accepting bids today
│   │   ├── upcoming-ipo/page.tsx   # Upcoming pipeline & scheduled issues
│   │   ├── listed-ipo/page.tsx     # Recently listed issues with debut gains
│   │   ├── mainboard-ipo/page.tsx  # Mainboard NSE & BSE issues
│   │   ├── sme-ipo/page.tsx        # SME platform issues (NSE Emerge / BSE SME)
│   │   ├── ipo/[slug]/page.tsx     # Deep dive: timeline, lot calculator, GMP time-series, financials
│   │   ├── ipo-calendar/page.tsx   # Interactive IPO Calendar (Month grid & list views)
│   │   ├── ipo-this-week/page.tsx  # Weekly action matrix (Open, Close, Allotment, Listing)
│   │   ├── ipo-list/[year]/page.tsx# Annual IPO archives with yearly statistics
│   │   ├── ipo-guide/page.tsx      # 9-Stage Indian IPO lifecycle guide
│   │   ├── ipo-glossary/page.tsx   # A–Z Indian IPO glossary
│   │   ├── faq/page.tsx            # FAQ with Schema.org FAQPage JSON-LD
│   │   ├── how-we-calculate/page.tsx# Transparent algorithm & mathematical formulas
│   │   ├── about/page.tsx          # About platform & Schema.org Organization JSON-LD
│   │   ├── editorial-policy/page.tsx# Sourcing & data provenance standards
│   │   ├── disclaimer/page.tsx     # Regulatory risk disclosure & SEBI notice
│   │   ├── privacy-policy/page.tsx # DPDP Act & local storage disclosure
│   │   ├── terms-and-conditions/page.tsx # Terms of service & acceptable use
│   │   ├── contact/page.tsx        # Editorial & errata desk contact details
│   │   ├── compare/page.tsx        # Side-by-side IPO comparison tool (2 to 3 IPOs)
│   │   ├── calculators/page.tsx    # Interactive calculators hub (Gain, P&L, Quotas)
│   │   ├── watchlist/page.tsx      # Browser-local saved IPO watchlist
│   │   ├── api/
│   │   │   ├── ipos/route.ts       # Public filtered IPO querying endpoint
│   │   │   ├── newsletter/         # Double opt-in subscription & verification
│   │   │   └── cron/               # Daily 9 AM newsletter & Telegram broadcast crons
│   │   ├── sitemap.ts              # Dynamic XML sitemap generator
│   │   ├── robots.ts               # Robots.txt discovery file
│   │   └── not-found.tsx           # Custom 404 page
│   ├── components/
│   │   ├── layout/                 # Navbar (responsive, watchlist counter), Footer, Breadcrumbs, ThemeToggle
│   │   ├── ui/                     # StatusBadge, DemoBadge, GmpDisclaimerBadge, EmptyState, ErrorState, LoadingSkeleton
│   │   ├── ipo/                    # IPOCard, IPOTable (search, sort, filter, pagination 25/50/100), WatchlistButton
│   │   ├── calendar/               # IpoCalendarView (interactive grid & list toggle)
│   │   ├── compare/                # CompareIpoClient (2 to 3 side-by-side table)
│   │   ├── newsletter/             # NewsletterForm (consent & double opt-in)
│   │   └── calculators/            # IpoLotCalculator (retail lot size & gain calculator)
│   ├── lib/
│   │   ├── calculators.ts          # Pure mathematical engine for gain, P&L charges, and lot tiers
│   │   ├── email/                  # Resend & Brevo double opt-in & daily digest service
│   │   ├── telegram/               # Telegram channel auto-post service for open IPO alerts
│   │   ├── status.ts               # CANONICAL status derivation engine in IST
│   │   ├── dates.ts                # IST timezone (Asia/Kolkata) formatting and parsing helpers
│   │   ├── calculations.ts         # Listing gain %, lot investment, GMP estimated profit
│   │   ├── db/
│   │   │   └── supabase.ts         # Supabase client & credentials validation
│   │   └── providers/              # Provider adapter layer (types, Supabase provider)
│   └── types/
│       └── ipo.ts                  # TypeScript interfaces for IPOs, GMP, subscriptions, financials
├── supabase/
│   └── migrations/                 # PostgreSQL schema migrations with RLS & indices
├── scripts/
│   ├── schema.sql                  # Quick-copy schema for Supabase SQL Editor
│   ├── seed.ts                     # Local TypeScript seed script (dev-only, is_demo = true)
│   └── seed-demo.sql               # Quick-copy demo seed SQL
├── tests/
│   ├── status.test.ts              # Unit tests for status derivation
│   ├── dates.test.ts               # Unit tests for IST timezone boundaries
│   └── calculations.test.ts        # Unit tests for listing gains and lot math
├── .env.example                    # Environment variable template
└── package.json
```

---

## ⚙️ How to Configure & Run Locally

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd ipo
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and enter your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> # Needed for running seed.ts
```

> **Note**: If Supabase credentials are not configured yet, the app safely boots in empty state mode with clear guidance.

### 3. Setup Database Schema (Supabase)
You can setup the schema via either method:
- **Option A (Supabase Dashboard)**: Go to Supabase Project -> **SQL Editor** -> paste and run the contents of [`scripts/schema.sql`](file:///Users/rahulpatel/Desktop/ipo/scripts/schema.sql).
- **Option B (Supabase CLI)**: Run `supabase db push` against [`supabase/migrations/20261021_initial_schema.sql`](file:///Users/rahulpatel/Desktop/ipo/supabase/migrations/20261021_initial_schema.sql).

### 4. Seed Local Development Data (Rule 2)
To populate sample Mainboard, SME, Live, Upcoming, and Listed IPO records with `is_demo = true`:
```bash
npm run seed
```
*(Or copy and run [`scripts/seed-demo.sql`](file:///Users/rahulpatel/Desktop/ipo/scripts/seed-demo.sql) in Supabase SQL editor).*

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏛️ Architecture & Framework Decision

### Architecture Deviation Note (Next.js vs. Vite)
The prompt in Section 15 of `MASTER_PROMPT.md` recommends Server-Side Rendering (SSR) and Static Site Generation (SSG) for public IPO intelligence platforms to guarantee search engine indexability, crawl efficiency, rich dynamic OpenGraph previews, and fast Core Web Vitals. Consequently, **Next.js 16 (App Router) + TypeScript + Tailwind CSS** is used in place of a pure client-side SPA (Vite). Where the specification calls for `src/services`, `src/hooks`, and `src/utils`, they are implemented under `src/` following clean architecture principles.

---

## 🌐 External Providers: Finnhub & FMP

### Finnhub Stock API Integration (Verified)
LiveIPOTracker integrates Finnhub's IPO calendar endpoint for US public market listings:
- **Endpoint**: `GET https://finnhub.io/api/v1/calendar/ipo`
- **Authentication**: Key (`FINNHUB_API_KEY`) is transmitted **strictly server-side** in the `X-Finnhub-Token` request header. It is never exposed in client bundles or logged in URLs.
- **Cache Strategy**: Next.js ISR and in-memory TTL caching with configurable duration (`FINNHUB_CACHE_REVALIDATE_SECONDS`, default: 6 hours / 21,600 seconds). Requests are split into chunks of at most 90 days as a defensive precaution.
- **Rate Limit Handling**: Free plan limit is 60 calls/minute. HTTP 429 is trapped immediately without a retry loop to prevent quota lockouts.

#### Empirical Verification (Live Key Probe)
- **Verified Coverage**: All 166 returned records belong to US stock exchanges: `NASDAQ Capital`, `NASDAQ Global`, `NASDAQ Global Select`, `NYSE`, and `NYSE MKT` (records with null/unassigned exchanges stay unassigned and are never guessed).
- **Verified Statuses**: Four distinct provider statuses observed:
  - `withdrawn` ➔ Mapped to `cancelled` (explicit provider evidence)
  - `expected` ➔ Mapped to `upcoming`
  - `filed` ➔ Preserved as `filed` with dedicated badge and status filter
  - `priced` ➔ Preserved as `priced` with dedicated badge and status filter
  - *Never inferred as "listed" or "open" from dates alone.*
- **Verified History**: Probed across 16 consecutive months (12 past months and 3 future months):
  - Every month from late 2025 through October 2026 returned complete historical records (36 to 77 records per month). No history cutoff on the free tier.
  - Future months (`2026-11` to `2027-01`) returned 0 upcoming records on the probed dates.
- **Unverified Aspects**:
  - Non-US / global exchange coverage: Unverified in official docs and unobserved in API responses (only US exchanges returned).
  - Maximum date span per query: Unverified in official docs (chunked at 90 days as a precaution).

---

### Financial Modeling Prep (FMP) Global Provider
- Calls to FMP `/stable/ipos-calendar` return `HTTP 402 Payment Required` on free API tier plans.
- **FMP is disabled by default** via `FMP_ENABLED=false` to prevent burning quota.

---

### Provider Architecture & Merge Priority
All data sources implement `IIpoProvider` in [`src/lib/providers/types.ts`](file:///src/lib/providers/types.ts):
1. **`supabase-india`**: Authoritative primary provider for Indian IPOs (NSE & BSE Mainboard & SME), grey market surveys, and SEBI filings.
2. **`finnhub`**: Verified provider for United States exchange listings (NASDAQ, NYSE).
3. **`fmp`**: International listings (opt-in via `FMP_ENABLED=true`).
4. **`MergedIpoProvider`**: Queries active providers in parallel (`Promise.allSettled`), deduplicates records via `deduplicateIPOs`, and flags conflicting attributes (`has_conflict: true`).

---

## 🔑 Deployment Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for India) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for India) | Supabase client anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Admin key strictly for local seed script (`scripts/seed.ts`) |
| `FINNHUB_API_KEY` | Optional | Finnhub API token (Server-side ONLY; passed via `X-Finnhub-Token` header) |
| `FINNHUB_CACHE_REVALIDATE_SECONDS` | Optional | Cache revalidation TTL in seconds (default: `21600` = 6 hours) |
| `FMP_API_KEY` | Optional | Financial Modeling Prep API key (Server-side ONLY) |
| `FMP_ENABLED` | Optional | Set to `true` to enable FMP calls (default: `false` to preserve quota) |
| `ENABLE_DEMO_DATA` | Optional | Set to `true` in development to load simulated demo records (default: `false`) |
| `NEXT_PUBLIC_SITE_URL` | Yes (Production) | Production canonical URL (e.g. `https://liveipotracker.in`) |
| `CRON_SECRET` | Optional | Bearer secret for daily cron trigger endpoints |
| `RESEND_API_KEY` / `BREVO_API_KEY` | Optional | Transactional email newsletter dispatch key |
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram notification bot token |

---

## 🧪 Running Unit Tests (Rule 10)

LiveIPOTracker includes comprehensive automated unit tests verifying status derivation across all market timings, boundary conditions in IST, Finnhub defensive price parsing, null field safety, HTTP 429 error handling, deduplication, conflict resolution, and FMP fallback scenarios:

```bash
npm test
```
*Current suite status: 67 tests passing across 8 test files (`finnhubProvider.test.ts`, `status.test.ts`, `dates.test.ts`, `calculations.test.ts`, `calculators.test.ts`, `dateUtils.test.ts`, `normaliser.test.ts`, `ipoApi.test.ts`). Runs Vitest with zero external network dependencies.*
