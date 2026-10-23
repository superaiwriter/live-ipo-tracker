# MASTER PROMPT: LiveIPOTracker.com — React Global IPO Platform

## 1. Project Overview

Build a complete, modern, responsive, SEO-friendly global IPO tracking platform named **LiveIPOTracker.com** using React.

The platform should help users worldwide discover upcoming IPOs, open IPO subscriptions, recently listed IPOs, historical IPOs, IPO performance, IPO calendars, and IPO-related news.

This must be a functional, production-oriented web application, not just a landing page or UI prototype.

**Suggested tagline:** Track IPOs Worldwide. Follow Every Market.

### Primary objectives

- Global IPO discovery and tracking
- Comprehensive data retrieval within provider limits
- Automated API integration
- Accurate IPO calendars and listing information
- Fast search, filters, sorting, and pagination
- International SEO and indexable content
- Responsive, professional financial-market UI
- Minimal backend dependency, with an optional serverless API proxy for production security

---

## 2. Technology Stack

Use the following technologies:

- React with Vite
- JavaScript or TypeScript, preferably TypeScript
- React Router for routing
- Bootstrap 5 for responsive layouts and UI components
- Custom CSS for branding and visual refinement
- Fetch API or Axios for API requests
- React hooks for state management
- Context API where shared application state is needed
- LocalStorage for lightweight preferences and watchlists
- A reusable API service layer for all external requests
- A charting library only when reliable historical data is available

Keep the project modular, readable, maintainable, and easy to extend.

Do not introduce unnecessary complexity or require a traditional custom backend for the initial frontend implementation.

For production, support an optional serverless API proxy to protect private API credentials.

---

## 3. Global IPO Coverage

Build the platform for international users rather than focusing exclusively on India or the United States.

Cover all countries and exchanges supported by the connected data sources, including where available:

- United States
- India
- United Kingdom
- Hong Kong
- China
- Japan
- South Korea
- Singapore
- Australia
- Canada
- Germany
- France
- Saudi Arabia
- United Arab Emirates
- Other supported international markets

Every IPO record should include available information such as:

- Company name
- Ticker symbol
- Country
- Stock exchange
- IPO date
- Offer price or price range
- Currency
- IPO status
- Listing price and performance, where available
- Data source
- Last updated timestamp

Do not claim complete worldwide coverage unless the connected providers genuinely support it. Clearly disclose unsupported countries, unavailable fields, and data limitations.

---

## 4. IPO API Integration

Integrate Financial Modeling Prep (FMP) as the initial IPO calendar provider.

Use the current official API documentation to verify endpoint names, query parameters, response fields, access requirements, and subscription limitations.

Initial IPO calendar endpoint:

`https://financialmodelingprep.com/stable/ipos-calendar?from=YYYY-MM-DD&to=YYYY-MM-DD&apikey=YOUR_API_KEY`

Create a dedicated API service module such as:

`src/services/ipoApi.ts`

Responsibilities:

- Build API requests
- Validate date ranges
- Fetch IPO data
- Handle errors and timeouts
- Normalise responses
- Retry eligible failures
- Respect rate limits
- Cache successful responses
- Report partial failures
- Return consistent data structures to React components

Never hardcode fake IPO data and present it as real market data.

If the API key is missing, show an informative setup message or a clearly labelled demo mode. Do not silently substitute fake IPOs.

---

## 5. Critical Requirement: Fetch More IPO Data

The website must not display only 5, 8, 10, or 20 IPO records when additional records are available.

Implement a reusable multi-window date-range fetcher.

### Required behaviour

1. Allow configurable historical and future date ranges.
2. Support a rolling range such as the previous 12 months through the next 12 months.
3. Split longer date ranges into consecutive requests that comply with the provider's maximum permitted window.
4. For the FMP IPO calendar endpoint, keep each request within the documented maximum of 90 days.
5. Handle month boundaries, year boundaries, leap years, and inclusive dates correctly.
6. Fetch date windows sequentially or with controlled concurrency to avoid API rate-limit problems.
7. Combine successful responses into one dataset.
8. Deduplicate records using a stable provider identifier where available. Otherwise use a normalised combination of ticker, company name, exchange, country, and IPO date.
9. Preserve valid records even when optional fields are missing.
10. Do not arbitrarily truncate the underlying dataset using expressions such as `.slice(0, 8)`.
11. Display the total number of fetched records and the number matching the current filters.
12. Display the selected date range, last successful update, and partial failures.
13. Provide a manual refresh control.
14. Cache successful responses with a configurable expiry.
15. Reuse valid cached data rather than repeatedly calling the same endpoint.
16. Provide retry controls for failed date windows.
17. Respect API quotas, subscription limits, and provider terms.

### Important limitations

A 90-day API query limit means a longer period requires multiple requests. It does not mean the provider guarantees complete historical records or worldwide IPO coverage.

If the API subscription restricts historical access, the app must report the limitation instead of claiming that all historical IPOs were retrieved.

---

## 6. Data Normalisation and Deduplication

Create a normalised IPO data model.

Suggested TypeScript interface:

```ts
export interface IPO {
  id: string;
  companyName: string;
  ticker?: string;
  country?: string;
  exchange?: string;
  ipoDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  offerPrice?: number;
  priceRangeLow?: number;
  priceRangeHigh?: number;
  listingPrice?: number;
  currentPrice?: number;
  currency?: string;
  status:
    | "upcoming"
    | "open"
    | "listed"
    | "closed"
    | "cancelled"
    | "unknown";
  source: string;
  sourceUrl?: string;
  lastUpdated?: string;
}
```

Adjust the interface to match actual provider capabilities. Do not invent fields or infer reliable statuses from incomplete information.

### Normalisation rules

- Parse dates consistently.
- Preserve the original currency.
- Treat missing values as unavailable, not zero.
- Distinguish unknown values from confirmed values.
- Deduplicate overlapping date-window responses.
- Preserve the original provider identifier when available.
- Record data provenance.
- Flag conflicting information from different providers.
- Never mark an IPO as open, closed, listed, or cancelled without reliable evidence.

Use a documented priority rule when combining information from multiple sources.

---

## 7. Additional Data Sources

Design the data architecture so more providers can be integrated later.

Potential sources include:

- Financial Modeling Prep
- Official stock exchange IPO calendars
- Securities regulator announcements
- Official listing notices and prospectuses
- Other licensed financial data providers

Use only sources with appropriate API access, permissions, and usage rights.

Implement a provider adapter pattern so the application can normalise different providers into the same IPO data model.

Do not assume all endpoints are available under every subscription plan.

Do not scrape websites in violation of their terms or assume browser-based requests can access every external API.

Clearly identify the source of each IPO record.

---

## 8. API Key Security

Support two configuration modes.

### Development mode

- Allow an API key to be configured locally for testing.
- Use an environment variable such as `VITE_FMP_API_KEY` only for local development.
- Explain that Vite environment variables prefixed with `VITE_` are bundled into frontend code and are not secret.
- Do not commit API keys to source control.

### Production mode

- Support an optional serverless proxy or API gateway.
- Store the actual provider key in server-side environment variables.
- Make React call the proxy rather than the provider directly with a private key.
- Include deployment instructions for the proxy.
- If the proxy is not configured, display a clear configuration message.

Never claim that LocalStorage, frontend environment variables, or minified JavaScript can securely hide a private API key.

---

## 9. Application Routes

Use React Router and create the following routes.

### `/` — Homepage

Include:

- Global IPO market overview
- Upcoming IPOs
- Open IPOs, where reliable status data exists
- Recently listed IPOs
- Latest IPO news
- IPO calendar preview
- Country-wise IPO overview
- Search by company name or ticker
- Links to countries and exchanges
- Last updated timestamp
- Data-source disclosure

Use real API data only.

Do not classify every future IPO as confirmed or every past IPO as successfully listed.

### `/upcoming-ipos` — Upcoming IPOs

Display available upcoming IPOs within the selected date range.

Include:

- Company name
- Ticker
- Country
- Exchange
- Expected IPO date
- Price range
- Currency
- Status
- Source

### `/open-ipos` — Open IPOs

Display IPOs with a genuinely open subscription period, based on reliable subscription dates or explicit provider status.

Do not infer subscription status from the listing date alone.

### `/listed-ipos` — Listed IPOs

Display recently listed and historical IPO records.

Include:

- Company name
- IPO date
- Offer price
- Listing price
- Current price, where available
- Listing gain or loss, where calculable
- Country and exchange
- Source and update timestamp

Calculate returns only when the required price data is available. Clearly explain the reference price and calculation basis.

### `/ipo-calendar` — IPO Calendar

Include:

- Calendar and list views
- Month navigation
- Previous and next month controls
- Date-range selection
- Country and exchange filters
- Search
- Status filter
- IPO detail links

### `/ipo-news` — IPO News

Display news from authorised news APIs or approved sources.

Include:

- Headline
- Publisher
- Publication date and time
- Short summary where permitted
- Link to the original article

Do not fabricate news or reproduce full copyrighted articles.

### `/ipo/:id` — IPO Details

Build a reusable IPO detail page with:

- Company details
- IPO date and relevant subscription dates
- Offer price and price range
- Country and exchange
- Offer size, where available
- Listing performance, where available
- Official prospectus or announcement links
- Related news
- Data-source attribution
- Last updated timestamp

Use stable identifiers and validate route parameters. Do not generate misleading details for incomplete records.

### `/country/:countrySlug` — Country IPO Pages

Support country pages such as:

- `/country/india`
- `/country/usa`
- `/country/uk`
- `/country/hong-kong`

Create indexable pages only when meaningful data is available. Avoid thin, duplicate, or empty pages.

### `/watchlist` — Watchlist

Show IPOs saved by the user in the current browser.

---

## 10. Reusable React Components

Build reusable components rather than duplicating markup.

Suggested structure:

```text
src/
├── app/
│   ├── App.tsx
│   └── router.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── IPOCard.tsx
│   ├── IPOTable.tsx
│   ├── IPOFilters.tsx
│   ├── IPOSearch.tsx
│   ├── Pagination.tsx
│   ├── DateRangePicker.tsx
│   ├── CountryFilter.tsx
│   ├── ExchangeFilter.tsx
│   ├── StatusBadge.tsx
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   ├── EmptyState.tsx
│   ├── DataSourceLabel.tsx
│   └── ThemeToggle.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── UpcomingIPOsPage.tsx
│   ├── OpenIPOsPage.tsx
│   ├── ListedIPOsPage.tsx
│   ├── IPOCalendarPage.tsx
│   ├── IPONewsPage.tsx
│   ├── IPODetailsPage.tsx
│   ├── CountryPage.tsx
│   ├── WatchlistPage.tsx
│   └── NotFoundPage.tsx
├── services/
│   ├── ipoApi.ts
│   ├── newsApi.ts
│   └── cacheService.ts
├── hooks/
│   ├── useIPOs.ts
│   ├── useFilters.ts
│   ├── usePagination.ts
│   └── useWatchlist.ts
├── utils/
│   ├── dateUtils.ts
│   ├── ipoNormaliser.ts
│   ├── deduplicateIPOs.ts
│   ├── formatters.ts
│   └── seoUtils.ts
├── types/
│   └── ipo.ts
├── styles/
│   └── global.css
└── main.tsx
```

You may adjust the structure if a better implementation is justified, but keep responsibilities clearly separated.

---

## 11. Search, Filtering, Sorting, and Pagination

Implement a fully functional IPO data table.

### Search

- Company name
- Ticker symbol
- Exchange
- Country

### Filters

- Country
- Stock exchange
- IPO date range
- Status, when reliable status information exists

### Sorting

- Company name
- IPO date
- Country
- Exchange
- Available offer price

### Pagination

- 25 records per page
- 50 records per page
- 100 records per page
- Previous and next buttons
- Current page indicator
- Total matching record count
- Reset filters
- Responsive mobile layout

Pagination must operate on the complete fetched dataset, not on a small preview array.

When filters change, update the record count and pagination. Reset to page one when necessary.

For larger datasets, use efficient filtering and rendering. If the data grows beyond suitable browser storage or memory limits, introduce a persistent data service rather than silently truncating results.

---

## 12. React State and Data Fetching

Use React hooks responsibly.

Requirements:

- Create reusable custom hooks.
- Avoid unnecessary API calls on every render.
- Prevent duplicate requests caused by component re-renders.
- Handle component unmounting and stale requests.
- Use `AbortController` where appropriate.
- Handle loading, success, empty, and error states.
- Avoid infinite `useEffect` loops.
- Keep API fetching separate from UI components.
- Avoid storing large datasets repeatedly in multiple places.
- Ensure manual refresh works correctly.

Use a shared state approach only where necessary. Do not introduce Redux unless the application genuinely requires it.

---

## 13. Watchlist and Local Preferences

Use LocalStorage for:

- Saved IPO watchlist
- Theme preference
- Selected table page size
- Lightweight user preferences
- Validated cached responses where appropriate

Users should be able to add and remove IPOs from their watchlist and retain the list between visits on the same browser.

Clearly explain that the watchlist does not synchronise across devices and is not a cloud account.

Validate data loaded from LocalStorage and handle malformed or outdated cached data safely.

---

## 14. UI and Visual Design

Create a professional financial-market interface.

### Design direction

- Clean layout inspired by modern financial intelligence platforms
- White or light-neutral backgrounds
- Dark navy primary colour
- Green for positive performance
- Red for negative performance
- Restrained use of accent colours
- Readable typography
- Clear tables and data cards
- Consistent spacing
- Accessible contrast
- Responsive Bootstrap grid
- Subtle borders and shadows
- Minimal unnecessary animation

Include:

- Responsive navigation
- Search bar
- IPO summary cards
- Reusable status labels
- Data tables
- Calendar controls
- Loading skeletons or spinners
- Empty and error states
- Dark mode
- Footer with navigation and data disclaimers

The brand name **LiveIPOTracker.com** must appear in the header and footer.

Do not use fake stock prices, fabricated market statistics, or decorative numbers that look like live financial data.

---

## 15. SEO for React

SEO is a core requirement.

Implement:

- Unique titles for indexable pages
- Unique meta descriptions
- Canonical URLs
- Open Graph metadata
- Social sharing metadata
- Semantic HTML
- Proper heading hierarchy
- Descriptive internal links
- Breadcrumb navigation
- Descriptive image alt text
- Clean URLs
- `robots.txt`
- `sitemap.xml`
- A custom 404 page
- Mobile-first design
- Core Web Vitals best practices

Use relevant natural search phrases naturally, including:

- Upcoming IPOs
- Global IPO Calendar
- IPO Listing Dates
- Recently Listed IPOs
- IPO Market News
- IPO Performance
- IPOs by Country
- Stock Exchange IPO Calendar

Avoid keyword stuffing and mass-generated thin pages.

### Critical React SEO requirement

A standard client-rendered Vite React application may not provide the best crawlable experience for every dynamically generated IPO page.

For production SEO, choose one of these approaches:

1. Use a React framework with server-side rendering or static generation, such as Next.js.
2. Use a suitable pre-rendering solution for important routes.
3. Use a build-time generation process for stable IPO and country pages where practical.

If Vite with client-side React is retained, document the limitations and implement the best feasible SEO solution for that architecture.

Do not claim that adding meta tags in a client-side effect guarantees complete search-engine indexing.

Use appropriate structured data only when supported by the actual page content and relevant schema requirements. Never invent ratings, reviews, or financial values for structured data.

---

## 16. Sitemap and Google Search Console

Generate a valid sitemap containing canonical, publicly accessible, indexable URLs.

Include:

- Homepage
- Main IPO pages
- Meaningful country pages
- IPO detail pages that genuinely exist and are intended for indexing

Exclude:

- Nonexistent routes
- Duplicate URLs
- Private watchlists
- Error pages
- Unnecessary filter combinations
- URLs with irrelevant query parameters

Keep the sitemap updated as indexable pages change.

Create a valid `robots.txt` and provide instructions for submitting the sitemap through Google Search Console.

Do not claim that sitemap submission guarantees indexing.

---

## 17. IPO News Integration

Create a separate news service module.

Requirements:

- Use a legitimate news API or approved source.
- Display the headline, publisher, date, and original article link.
- Handle missing images and summaries.
- Respect copyright and provider terms.
- Clearly indicate publication time.
- Avoid fabricated news.
- Do not display stale content as newly published.
- Provide a meaningful empty state when no news is available.

If no news API is configured, show a setup message rather than fake articles.

---

## 18. Performance and Reliability

Implement:

- Request timeouts
- Controlled retries with backoff
- API rate-limit handling
- Request deduplication
- Caching with expiry
- Safe error handling
- Partial-failure recovery
- Lazy loading where appropriate
- Efficient React rendering
- Safe DOM rendering
- Responsive images
- Code splitting for routes where beneficial
- Minimal unnecessary dependencies

When some date windows fail, retain successful records and show which parts of the selected date range could not be loaded.

Never imply that the dataset is complete when some requests have failed.

---

## 19. Deployment

The project must be deployable on:

- Vercel
- Netlify
- Other suitable static hosting providers

For the initial version, use React and Vite. An optional serverless proxy may be deployed alongside it.

Provide:

- Complete source code
- `package.json`
- Vite configuration
- Environment-variable example file without secrets
- `.gitignore`
- API configuration instructions
- Serverless proxy example if required
- Build and deployment instructions
- README documentation
- Troubleshooting guide
- Instructions for adding more data providers

Ensure the production build succeeds.

Test direct navigation to nested routes and configure hosting rewrites where necessary.

Do not include a real API key in the delivered source code.

---

## 20. Testing and Acceptance Criteria

Verify the application against the following requirements:

1. The homepage loads successfully.
2. All navigation routes work.
3. The IPO calendar retrieves data from the configured provider.
4. Date ranges longer than 90 days are split into valid requests.
5. Results from successful windows are merged and deduplicated.
6. The application does not arbitrarily truncate the fetched dataset.
7. Pagination supports 25, 50, and 100 records per page.
8. Search, sorting, and filters work together.
9. Country and exchange filters use available real data.
10. IPO statuses are not fabricated.
11. Data sources and update timestamps are displayed.
12. Partial API failures are visible and recoverable.
13. Caching reduces unnecessary API calls.
14. API keys are not exposed as production secrets.
15. Watchlist and theme preferences persist as intended.
16. Responsive layouts work on desktop, tablet, and mobile.
17. The application handles empty responses and missing fields.
18. The production build completes without errors.
19. SEO metadata and sitemap contain valid URLs.
20. The limitations of the selected data provider are documented.

Create tests for date-window generation, deduplication, filtering, pagination, and API error handling.

Do not claim tests have passed unless they have actually been run.

---

## 21. Final Deliverables

Deliver the following:

- Complete React project
- All required page components
- Reusable UI components
- IPO API service
- Multi-window date-range fetcher
- Normalisation and deduplication utilities
- Search, filters, sorting, and pagination
- LocalStorage watchlist
- IPO calendar
- IPO news integration
- SEO implementation
- Sitemap and robots configuration
- Error and loading states
- README
- Deployment instructions
- Environment-variable documentation
- Tests for critical functionality
- Optional serverless API proxy

### Final instruction

Build the complete LiveIPOTracker.com React application now.

Prioritise accurate data, comprehensive retrieval within provider limits, global coverage, a fast user experience, SEO, secure API integration, and maintainable code.

Do not stop after generating the homepage or a basic prototype. Implement all essential pages and functionality.

Where a provider, API subscription, hosting configuration, or data limitation prevents a feature from working, clearly document the limitation and implement the best honest fallback.

Do not invent live IPO records, API capabilities, test results, or claims of complete global coverage.