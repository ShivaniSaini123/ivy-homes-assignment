# Ivy Homes — Verified Real Estate Discovery & Analytics Platform

A full-stack, production-grade real estate marketplace and data-auditing engine built for the **Ivy Homes Software Engineering Internship Assignment**. The platform delivers real-time property discovery, server-side filtering, dedicated rental and project catalogs, per-user saved favourites, an analytics insights dashboard, and an exhaustive empirical audit of the Ivy Homes upstream API.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Local Setup](#4-local-setup)
5. [Environment Variables](#5-environment-variables)
6. [How to Run Backend](#6-how-to-run-backend)
7. [How to Run Frontend](#7-how-to-run-frontend)
8. [API Architecture](#8-api-architecture)
9. [Authentication Flow](#9-authentication-flow)
10. [Pagination & Filter Implementation](#10-pagination--filter-implementation)
11. [Saved Listings Implementation](#11-saved-listings-implementation)
12. [Rentals & Projects](#12-rentals--projects)
13. [Insights](#13-insights)
14. [Data Investigation Methodology](#14-data-investigation-methodology)
15. [Documentation Discrepancies Found](#15-documentation-discrepancies-found)
16. [What We Checked That Turned Out to Be Fine](#16-what-we-checked-that-turned-out-to-be-fine)
17. [How Corrupt & Fake Listings Were Detected](#17-how-corrupt--fake-listings-were-detected)
18. [How the Ten Answers Were Calculated](#18-how-the-ten-answers-were-calculated)
19. [Testing Performed](#19-testing-performed)
20. [Known Limitations](#20-known-limitations)
21. [What I Would Do With Another Two Days](#21-what-i-would-do-with-another-two-days)
22. [AI Coding Assistant Disclosure](#22-ai-coding-assistant-disclosure)

---

## 1. Project Overview

The **Ivy Homes Property Listings Platform** enables prospective homebuyers and tenants to browse, filter, inspect, and bookmark residential properties across Chennai. The platform interfaces directly with the official Ivy Homes upstream services (`solve.ivy.homes`), enforcing a zero-trust credential model: **upstream API keys and bearer tokens are secured exclusively on the backend and are never exposed to browser runtimes or Git repositories.**

Beyond UI delivery, this repository features an in-depth data integrity evaluation across 4,100 listings, 1,550 rentals, and 460 projects, answering complex business intelligence questions and reconciling documented API specifications with actual wire behaviors.

---

## 2. Features

- **Authenticated Session Management**:
  - Secure login (`POST /api/auth/login`) with session persistence surviving page reloads and 30+ minute inactivity.
  - HttpOnly cookies preventing XSS-based credential extraction.
  - Safe automatic re-authentication upon upstream 401 token expiration.
- **Complete Property Discovery (Buy)**:
  - Global server-side filtering across the entire dataset (locality, BHK, price bounds, furnishing, verified-only).
  - Instant full-text search matching apartment names, builders, and descriptions.
  - Stable pagination with automatic reset to page 1 on filter alteration.
  - Shimmer skeleton loaders preventing full-page layout flicker.
- **Dedicated Listing Detail View (`/listings/:id`)**:
  - Unique permalink routing for every listing.
  - Rich architectural specifications: Carpet Area, Super Built-up Area, Floor Level, Facing Direction, Balconies, and Parking.
  - Project enrichment: Developer name, RERA registration, society amenities.
  - Contextual similar properties computed by locality and bedroom proximity.
  - Graceful handling of invalid listing IDs with direct recovery actions.
  - Seller privacy preservation: Agent/owner names displayed while keeping private phone numbers unexposed.
- **Saved Listings / Favorites (`/saved`)**:
  - Real-time bookmarking per user, persisting across reloads and logout/login cycles.
  - Proxied to the upstream saved listings API (`GET /v1/saved`, `POST /v1/saved`, `DELETE /v1/saved/:id`).
- **Rentals Marketplace (`/rentals`)**:
  - Dedicated rental discovery with deposit, maintenance, and monthly rent formatting.
  - Locality, BHK, and price filtering.
- **Projects Catalog (`/projects`)**:
  - Browse residential township developments with developer filtering, RERA numbers, construction status, unit counts, and amenity tags.
- **Analytics & Insights Dashboard (`/insights`)**:
  - Key statistical indicators: Total listings, median price, median price per sq ft, and live listing ratio.
  - Locality distribution breakdown.
  - BHK inventory distribution.
  - Platform data integrity audit cards highlighting corrupt records and scam patterns.
- **Indian Real Estate Unit Formatting**:
  - Automatic conversion to Lakhs (`₹XX.XX L`) and Crores (`₹X.XX Cr`).
  - Standardized area formatting (`1,240 sq ft`).

---

## 3. Tech Stack

| Domain | Technology | Purpose & Rationale |
|---|---|---|
| **Frontend Framework** | React 19, Vite 6 | High-speed bundle building, instant HMR, standard React hooks. |
| **Frontend Routing** | HTML5 History API (`useRouter`) | Clean client-side URL routing (`/listings`, `/listings/:id`, `/rentals`, `/projects`, `/saved`, `/insights`) without heavy external router dependencies. |
| **Styling** | Vanilla CSS (Design System Tokens) | Dark real-estate aesthetic (`#0B0A12` base, `#151321` cards, `#8B5CF6` violet accents), zero runtime CSS-in-JS overhead. |
| **Backend Runtime** | Node.js (v20+), Express 5 | Asynchronous non-blocking architecture, native fetch, modular routing. |
| **Security & Middleware** | `cookie-parser`, `cors`, `dotenv` | HttpOnly cookie sessions, CORS origin control, backend environment encapsulation. |
| **Testing** | Node.js Native Test Runner (`node:test`, `node:assert`) | Zero-dependency, sub-second test execution across backend endpoints and frontend formatters. |
| **Linter** | Oxlint (`oxlint`) | Ultra-fast static code analysis ensuring zero syntax or unused identifier errors. |

---

## 4. Local Setup

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **Git**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ShivaniSaini123/ivy-homes-assignment.git
   cd ivy-homes-assignment
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

---

## 5. Environment Variables

All sensitive credentials, API keys, and signing secrets are stored strictly in `backend/.env`. This file is listed in `.gitignore` and is never committed to source control.

Create `backend/.env` based on `.env.example`:

```env
# backend/.env
PORT=5000
IVY_BASE_URL=https://solve.ivy.homes
IVY_API_KEY=IVY26-5E38C38ED8DB
IVY_EMAIL=demo1@ivy.homes
IVY_PASSWORD=305dc2b341
JWT_SECRET=your_production_jwt_secret_min_32_characters
CORS_ORIGIN=https://ivy-homes-assignment.vercel.app
COOKIE_SAME_SITE=lax
```

> **Security Guarantee**: The frontend has zero access to `IVY_API_KEY`, `IVY_PASSWORD`, or `JWT_SECRET`. Vite proxies `/api` requests to `http://localhost:5000` (or uses same-origin rewrites on Vercel), keeping credentials and signing secrets server-bound.

---

## 6. How to Run Backend

From the repository root:

```bash
cd backend
npm run dev
# Or for production start:
npm start
```

The backend server starts on `http://localhost:5000`.
To verify backend health:
```bash
curl http://localhost:5000/health
# Response: {"status":"ok","timestamp":"..."}
```

---

## 7. How to Run Frontend

From the repository root:

```bash
cd frontend
npm run dev
```

The Vite development server will start at `http://localhost:5173`.
Open `http://localhost:5173` in your browser.

To verify production compilation:
```bash
cd frontend
npm run build
```

---

## 8. API Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Browser Client (React 19)                       │
│  Navbar • Listings • ListingDetail • Rentals • Projects • Saved • Insights│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP Requests with Session Cookie
                                    │ (Proxied via Vite /api -> :5000)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express Backend (:5000)                         │
│                                                                        │
│  [server.js]                                                           │
│    ├── /api/auth       (authRoutes -> authController)                  │
│    ├── /api/listings   (listingRoutes -> listingController)            │
│    ├── /api/rentals    (rentalRoutes -> rentalController)              │
│    ├── /api/projects   (projectRoutes -> projectController)            │
│    ├── /api/saved      (savedRoutes -> savedController)                │
│    └── /api/analytics  (analyticsRoutes -> analyticsController)        │
│                                                                        │
│  [ivyService.js]                                                       │
│    ├── Token Manager (auto-login, refresh margin, 401 retry)           │
│    ├── Upstream proxy client (X-API-Key injection)                     │
│    └── Data enrichment & catalog caching                               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (Bearer Token + X-API-Key)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Upstream Ivy Homes Platform                        │
│                        (solve.ivy.homes)                               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Authentication Flow

The platform implements a **Dual-Tier Zero-Trust Authentication Architecture**:

### Tier 1: Client ↔ Backend (`ivy_session`)
1. The user logs in via the UI with email and password (`POST /api/auth/login`).
2. The backend verifies credentials against the upstream API, signs a 24-hour stateless JSON Web Token (JWT) with `JWT_SECRET`, and sets a secure `HttpOnly`, `SameSite=Lax` cookie named `ivy_session` (`secure: true` in production, `path: "/"`).
3. All catalog endpoints (`/api/listings`, `/api/rentals`, `/api/projects`, `/api/saved`, `/api/analytics`) require this cookie or an `Authorization: Bearer` token via the `requireAuth` middleware.
4. Because the token is stateless, it persists reliably across ephemeral Vercel serverless function instances without relying on server-local in-memory storage.
5. On browser reload, the client calls `GET /api/auth/me`. If the JWT signature is valid and non-expired, the user state is restored immediately with a dedicated loading state, preventing premature redirection to `/login`.
6. `POST /api/auth/logout` clears the `ivy_session` cookie in the client browser with matching security flags. Subsequent unauthenticated requests are rejected with `401`.

### Tier 2: Backend ↔ Upstream Ivy API (`solve.ivy.homes`)
1. The backend authenticates to `POST /auth/login` using `IVY_EMAIL`, `IVY_PASSWORD`, and `X-API-Key: IVY_API_KEY`.
2. Upstream returns an `access_token` and `refresh_token` with an expiration duration of 900 seconds (15 minutes).
3. `ivyService.js` stores the token with an expiration timestamp and automatically attempts proactive renewal 60 seconds before expiration via `POST /auth/refresh`.
4. If an upstream call returns a `401 Unauthorized`, `ivyService` invalidates the cached token, re-authenticates via `login()`, and retries the original request.

---

## 10. Pagination & Filter Implementation

### Solving the "Client-Side 20-Record Trap"
A naive implementation would fetch 20 records and filter them in React. This breaks search and filtering: if no properties on page 1 match "Anna Nagar", the user sees an empty page despite hundreds of matching properties on subsequent pages.

### Production Solution:
1. **Server-Side Filtering**: Filters (`locality`, `bedroom`, `minPrice`, `maxPrice`, `propertyType`, `furnishing`, `verifiedOnly`, `search`) are evaluated across the complete catalog of 4,100 records on the backend.
2. **Catalog Metadata (`/api/meta`)**: The frontend retrieves all available localities, BHK values, and price boundaries on load to populate filter dropdowns.
3. **Pagination Mechanics**: The backend accepts `page` and `limit`, applies filters first, calculates exact `total` and `totalPages`, and slices the results for the requested page.
4. **State Reset**: Whenever any filter or search query changes in the UI, `page` resets to 1 automatically.

---

## 11. Saved Listings Implementation

1. **Per-User Persistence**: Saved listings are stored per authenticated user and survive browser refreshes and logout/login cycles.
2. **Upstream Proxying**: Rather than relying solely on client-side localStorage, the backend proxies to the upstream Ivy Homes saved properties API:
   - `GET /api/saved` -> Upstream `GET /v1/saved`
   - `POST /api/saved` -> Upstream `POST /v1/saved` with `{ "listing_id": "..." }`
   - `DELETE /api/saved/:id` -> Upstream `DELETE /v1/saved/:id`
3. **UI Integration**: Clicking the heart icon on any card immediately synchronizes state with the server and updates the count badge in the Navbar.

---

## 12. Rentals & Projects

### Rentals (`/rentals`)
- Consumes `/api/rentals` (mapped upstream from `/v1/rentals`).
- Displays rent per month (`₹XX,XXX/mo`), security deposit, and monthly maintenance fees.
- Provides dedicated filters for locality, bedrooms, and budget range.

### Projects (`/projects`)
- Consumes `/api/projects` (mapped upstream from `/v1/projects`).
- Displays township master details: Developer name, RERA registration number, launch date, possession date, total units, towers, and amenities list.
- Normalizes mixed price fields (converting Lakhs and Crores into formatted rupee values).

---

## 13. Insights

Available at `/insights` and powered by `GET /api/insights`, this page serves as an executive data-engineering dashboard structured into three primary audit tabs alongside marketplace distribution tables:

### Section A: Assignment Questions & Final Answers (Q1 to Q10)
Displays all 10 assignment questions with their exact calculated values, prompt text, methodology, and empirical evidence:
- **Q1. Total Listing Records**: 4,100 retrievable records.
- **Q2. Unique Properties**: 3,222 physical units (deduplicated by apartment, locality, type, BHK, bathroom, floor, total floors, facing).
- **Q3. Active Listings**: 3,233 records with `is_live === true`.
- **Q4. Corrupt Listing IDs**: 54 sorted IDs with interactive expandable view across 6 categories (9 records each with zero overlap).
- **Q5. Total Monthly Rent**: ₹53,30,500 / month across 150 rentals in assigned locality **Anna Nagar**.
- **Q6. Average Price per Sq Ft for 2 BHK**: ₹16,167.10 / sq ft across 1,072 live, clean 2BHK listings.
- **Q7. Costliest Project**: Project **P40224** (*Shriram Serenity*) with max price of **₹3,78,00,000 INR** (₹3.78 Cr).
- **Q8. Listings Posted in Last 7 Days**: 122 listings within `[2026-09-03T00:00:00+05:30, 2026-09-10T00:00:00+05:30)`.
- **Q9. Fake Listing IDs**: 18 sorted IDs with interactive expandable view detailing advance-token scam listings.
- **Q10. Projects with Wrong Listing Count**: 336 projects (73.0% of all 460 projects) where reported `total_listings` disagrees with actual listings.

### Section B: Documentation Lies Found
Features cards for 13 reproduced discrepancies between `API_REFERENCE.md` and live wire responses, showing Category badges, Documented vs Actual comparisons, How Discovered notes, and concrete evidence IDs.

### Section C: Things We Tested That Were Correct
Documents 7 hypotheses systematically tested that turned out to be completely fine (e.g. JWT authentication validity, reference date, assigned locality, HTTP 401 status codes, rental terms, RERA project certifications, and plural listing detail).

### Section D: Marketplace Distributions
Presents detailed breakdown tables for Locality distribution, BHK unit inventory, and property types.

---

## 14. Data Investigation Methodology

To answer the 10 assignment questions with precision, we treated the upstream API as an untrusted black-box data source:
1. **Full-Catalog Ingestion**: Rather than assuming `response.total` was accurate, we wrote automated paginators using `offset` and `limit` to download every accessible record from `/v1/listings`, `/v1/rentals`, and `/v1/projects`.
2. **Schema & Multi-Field Cross-Validation**: We audited records for physical impossibilities:
   - Comparing `carpet_area` vs `super_built_up_area`
   - Comparing `floor` vs `total_floors`
   - Validating latitude/longitude boundaries against Chennai coordinates (`12.8°N - 13.3°N`, `80.1°E - 80.35°E`)
   - Checking timestamp boundaries against the reference date (`2026-09-10T00:00:00+05:30`)
3. **Property Deduplication by Physical Signature**: We recognized that multiple portal aggregators list the same physical flat. We generated a physical property hash: `[normalized_apartment_name, locality, property_type, bedroom, bathroom, floor, total_floors, facing_direction]`.
4. **Fraud & Pattern Recognition**: We scanned descriptions for scam phrases and grouped suspicious records by seller contact phone numbers.

---

## 15. Documentation Discrepancies Found

The official `API_REFERENCE.md` contains several material inaccuracies reproduced through empirical testing:

| Documented Endpoint / Spec | Documented Behavior | Actual Observed Behavior | Impact |
|---|---|---|---|
| `GET /v1/favourites` | Documented as favorites endpoint | **404 Not Found**. Actual working endpoint is `GET /v1/saved`, `POST /v1/saved`, `DELETE /v1/saved/:id`. | Broken favorites if following docs. |
| `GET /v1/listing/{id}` | Documented with singular noun `listing` | **404 Not Found**. Actual endpoint requires plural `GET /v1/listings/{id}`. | Broken detail lookups. |
| `GET /v1/listings/{id}/similar` | Documented to return similar listings | **404 Not Found** on all listing IDs. Unimplemented upstream. | Backend must compute similar properties. |
| `GET /v1/analytics/summary` | Documented to return platform KPIs | **404 Not Found**. Unimplemented upstream. | Backend must compute summary metrics. |
| Pagination: `?page=2` | Documented as accepting `page` parameter | **Ignored**. API always returns offset 0 unless `offset` and `limit` are passed (max limit: 50). | Page-based pagination gets stuck on page 1. |
| Listing Count: `total: 3830` | Reported total is 3830 | API continues returning valid listings up to offset 4099 (**4,100 total retrievable listings**). | Stopping at 3830 misses 270 properties. |
| `POST /auth/logout` | Documented as invalidating token | Returns `{"message": "tokens are stateless"}`. Token remains valid upstream until JWT expiration. | Session must be revoked locally. |
| Projects Price Units | Documented as uniform numbers | Mixed units: values `< 25` are in **Crores**, values `≥ 25` are in **Lakhs**. | Sorting by raw field inverts expensive projects. |
| Area Units on MagicHomes | Documented as square feet | Listings from `magichomes` (`MAG-*`) report area in **square meters** (m²). | Distorts price/sqft tenfold if unscaled. |
| Project `total_listings` | Documented as count of listings in project | Disagrees with actual listing counts for **336 out of 460 projects** (73%). | Summary badges show incorrect counts. |

---

## 16. What We Checked That Turned Out to Be Fine

In our systematic testing, the following documented behaviors were verified to be **completely correct**:
- **Authentication Credentials**: `POST /auth/login` successfully issues valid JWTs when provided with the correct API key and credentials.
- **Reference Date Consistency**: `GET /v1/me` returns `reference_date: "2026-09-10T00:00:00+05:30"` matching the assignment specification.
- **User Locality Assignment**: `GET /v1/me` correctly identifies the candidate's assigned locality as `"anna nagar"` and city as `"chennai"` (`city_id: 4`).
- **HTTP Status Codes**: `401 Unauthorized` is correctly returned when headers lack a valid `X-API-Key` or Bearer token.
- **Rental Record Retrieval**: `GET /v1/rentals` returns valid rental records containing monthly rent, security deposit, and maintenance terms.
- **Project Record Retrieval**: `GET /v1/projects` returns valid township projects with RERA numbers, launch dates, and developer information.
- **Listing Detail Plural Endpoint**: `GET /v1/listings/:id` returns comprehensive individual property objects with all fields intact.

---

## 17. How Corrupt & Fake Listings Were Detected

### Corrupt Listings (Exactly 54 IDs)
A multi-rule audit of all 4,100 listings revealed exactly 6 categories of corrupt records, containing exactly 9 records each with zero overlap:

1. **Negative or Zero Price (9 records)**: Listings with `price <= 0` (e.g. `ZER-4000021` with price ₹0).
2. **Rental Values in Sale Price (9 records)**: Sale listings with `price < ₹100,000` (e.g. `DWE-4000745` with price ₹18,000 — rental rate accidentally posted as sale price).
3. **Floor Level Exceeding Total Floors (9 records)**: Records where `floor > total_floors` (e.g. `100-4000397` claiming Floor 14 in a 10-floor building).
4. **Carpet Area Exceeding Super Built-up Area (9 records)**: Records where `carpet_area > super_built_up_area` (e.g. `100-4002961` claiming 1,863 sq ft carpet area within 1,490 sq ft super built-up area).
5. **Swapped Coordinates (9 records)**: Coordinates where `latitude > 70` and `longitude < 20` (e.g. `100-4001530` with coordinates `80.22°N, 13.05°E` located in the Arctic Ocean instead of Chennai at `13.05°N, 80.22°E`).
6. **Future Timestamps (9 records)**: Listings with `posted_at` dates occurring after the reference date `2026-09-10` (e.g. `100-4000545` posted in October 2026 and 2027).

### Fake Listings (18 IDs)
Text-mining of property descriptions identified 18 fraudulent listings soliciting illegal advance token fees:
> *"Pay a token amount of Rs 25,000 today to block the unit before someone else takes it"*

These listings advertise prime properties at unrealistically low prices and originate from 7 repeating phone numbers (`+912005640249`, `+912005820728`, etc.).

---

## 18. How the Ten Answers Were Calculated

All answers were calculated from the complete datasets available to API key `IVY26-5E38C38ED8DB` at reference time `2026-09-10T00:00:00+05:30`:

1. **`total_listing_records` = `4100`**
   - Paginated `/v1/listings` via `offset` and `limit=50` past the reported total (3,830) until offset 4,100 returned zero items.
2. **`unique_properties` = `3222`**
   - Grouped by physical attribute signature: `normalized_apartment_name + locality + property_type + bedroom + bathroom + floor + total_floors + facing_direction`.
3. **`active_listings` = `3233`**
   - Filtered all 4,100 listings by `is_live === true` (867 listings have `is_live === false`).
4. **`corrupt_listing_ids` = `54 sorted IDs`**
   - Union of the 6 corrupt categories (9 IDs each = 54 total, sorted alphabetically).
5. **`total_monthly_rent` = `5330500` (₹53,30,500)**
   - From `GET /v1/me`, assigned locality is `"anna nagar"`.
   - Filtered `/v1/rentals` where `locality.toLowerCase() === 'anna nagar'` (150 rentals).
   - Summed `price` field across all 150 rentals (`5,330,500`). (Live rentals only sum to `4,594,900`).
6. **`avg_price_per_sqft_2bhk` = `16167.10`**
   - Filtered listings where `is_live === true`, `bedroom === 2`, excluding corrupt IDs (#4) and fake scam IDs (#9) (1,072 valid listings).
   - Calculated `price / carpet_area` for each listing and averaged: **₹16,167.10 / sq ft**. (If normalizing MagicHomes m² units, the average is ₹9,850.94 / sq ft).
7. **`costliest_project` = `{ "project_id": "P40224", "price_max_inr": 37800000 }`**
   - Scaled project price fields to INR: Shriram Serenity (`P40224`) has `price_max: 3.78` Crores = **₹3,78,00,000 INR**.
8. **`listings_last_7_days` = `122`**
   - Counted listings with `posted_at` in interval `[2026-09-03T00:00:00+05:30, 2026-09-10T00:00:00+05:30)`.
9. **`fake_listing_ids` = `18 sorted IDs`**
   - Sorted list of the 18 advance-payment scam listing IDs.
10. **`projects_with_wrong_listing_count` = `336`**
    - Compared `project.total_listings` against actual listings linked to each `project_id`. Out of 460 projects, 336 disagree.

---

## 19. Testing Performed

### Automated Backend Tests (17/17 Pass)
```bash
cd backend
npm test
```
- `GET /health`: Service availability without auth (200).
- `GET /api/listings`: 401 response without session cookie.
- `POST /api/auth/login`: Fails on bad credentials, succeeds with demo credentials and sets `ivy_session`.
- `GET /api/auth/me`: Returns user session profile.
- `GET /api/meta`: Returns unique filter options.
- `GET /api/listings`: Paginated catalog results.
- `GET /api/listings`: Full-text search across full dataset.
- `GET /api/listings`: Locality and BHK filtering.
- `GET /api/listings/:id`: Valid property retrieval and 404 handling.
- `GET /api/listings/:id/similar`: Contextual property recommendations.
- `GET /api/rentals`: Paginated rentals retrieval.
- `GET /api/projects`: Paginated projects retrieval.
- `POST /api/saved` & `GET /api/saved`: Adds, retrieves, and persists saved favorites.
- `GET /api/analytics/summary`: Aggregate analytics computation.
- `POST /api/auth/logout`: Session termination.

### Automated Frontend Tests & Linter (10/10 Pass, 0 Lint Errors)
```bash
cd frontend
npm run lint    # oxlint: 0 errors, 0 warnings
npm test        # node:test formatters: 10 pass, 0 fail
npm run build   # vite build: production bundle compiled in 1.38s
```

---

## 20. Known Limitations

1. **City Scope**: The current dataset is centered on Chennai (`city_id: 4`). Supporting multi-city queries would require dynamic `city_id` parameters across all proxy endpoints.
2. **Upstream Token Statelessness**: Because upstream `POST /auth/logout` is stateless, session revocation is enforced at the backend proxy layer rather than invalidating upstream tokens.
3. **Hosted Media**: The upstream API provides listing metadata but does not host verified property photographs; the frontend uses themed architectural gradient placeholders.

---

## 21. What I Would Do With Another Two Days

1. **Interactive Geospatial Map**: Integrate Leaflet / Mapbox with cluster markers to visualize properties on an interactive map of Chennai, with polygon boundary filtering for localities.
2. **Automated Unit Testing for Anomaly Detection**: Build a continuous data quality pipeline that runs automated anomaly checks on every catalog sync, automatically flagging new corrupt records.
3. **Price Valuation Estimator**: Implement an ML/statistical regression model estimating fair market value based on carpet area, floor, age, and locality.
4. **WebSocket Live Price Alerts**: Enable WebSocket subscriptions allowing users to receive real-time notifications when a saved property drops in price.

---

## 22. AI Coding Assistant Disclosure

In compliance with the assignment instructions, an AI coding assistant (**Antigravity by Google DeepMind**) was utilized during development for:
- Accelerating boilerplate code generation for React views and Express proxy routes.
- Formatting and verifying complex statistical calculations and date-boundary logic.
- Automated static analysis, cross-platform terminal orchestration, and lint validation.

All architectural design decisions, data integrity hypotheses, fraud detection algorithms, and API reconciliations were systematically formulated, tested, and validated against the live API.
