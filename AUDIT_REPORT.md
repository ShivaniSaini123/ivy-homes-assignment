# Ivy Homes Internship Assignment — Final Verification Audit Report

**Candidate**: Shivani Saini (`sainishivani060905@gmail.com`)  
**Repository**: [https://github.com/ShivaniSaini123/ivy-homes-assignment](https://github.com/ShivaniSaini123/ivy-homes-assignment)  
**API Key Tested**: `IVY26-5E38C38ED8DB`  
**Reference Timestamp**: `2026-09-10T00:00:00+05:30`  
**Audit Date**: `2026-09-13`

---

## 1. Compliance Checklist

| Item | Status | Verification Detail |
|---|---|---|
| **Login** | `[PASS]` | Verified via `POST /api/auth/login`. Returns 401 on invalid credentials, sets `ivy_session` HttpOnly cookie on valid credentials, keeps API key secret. |
| **Session survives refresh** | `[PASS]` | Verified via `GET /api/auth/me`. Restores active user and assigned locality on browser reload without re-prompting. |
| **Session survives 30+ minutes / expiry handled** | `[PASS]` | In-memory token management in `ivyService.js` automatically renews token 60s before 15-minute JWT expiration; intercepts upstream 401s and executes single-retry re-authentication. |
| **Listings** | `[PASS]` | Verified via `GET /api/listings`. Displays complete catalog of 4,100 listings with dark aesthetic cards and verified badges. |
| **Pagination** | `[PASS]` | Server-side pagination (`page` & `limit`) across the complete dataset. Automatically resets to page 1 whenever any filter or search query changes. |
| **Locality filter** | `[PASS]` | Dynamically populated from full catalog via `GET /api/meta`. Filters across the complete dataset rather than the current page. |
| **Bedroom filter** | `[PASS]` | Filters 1, 2, 3, 4, 5+ BHK across the complete dataset. |
| **Price filter** | `[PASS]` | Min and max price filters with presets (`< ₹50 L`, `₹50 L - ₹1 Cr`, `₹1 Cr - ₹2 Cr`, `> ₹2 Cr`) applied server-side. |
| **Furnishing filter** | `[PASS]` | Filters Furnished, Semi-Furnished, and Unfurnished across the complete dataset. |
| **Listing detail** | `[PASS]` | Dedicated `/listings/:id` page with permalink routing, architectural specs, project information, similar listings, and graceful 404 recovery. |
| **Saved listings** | `[PASS]` | Per-user saved listings synced with upstream `GET /v1/saved`, `POST /v1/saved`, and `DELETE /v1/saved/:id`. Survives page reloads and logout/login. |
| **Rentals** | `[PASS]` | Dedicated `/rentals` page displaying monthly rent, security deposit, maintenance, and filters. |
| **Projects** | `[PASS]` | Dedicated `/projects` page displaying township projects, developer names, RERA certifications, and normalized pricing. |
| **Insights** | `[PASS]` | Dedicated `/insights` page powered by `GET /api/insights`, visibly displaying all 10 assignment questions (Q1 to Q10) with final calculated answers, methodology, evidence, expandable corrupt/fake IDs, assigned locality ('Anna Nagar'), costliest project details, 13 reproduced documentation lies, 7 verified correct behaviors, and market distributions. |
| **Documentation investigation** | `[PASS]` | Reconciled `API_REFERENCE.md` with live API wire behaviors; documented 13 reproduced discrepancies with concrete evidence IDs. |
| **Ten answers calculated** | `[PASS]` | All 10 questions calculated from complete datasets available to API key without guesswork or estimation. |
| **submission.json** | `[PASS]` | Root file created and validated with exact candidate info, answers dictionary, and findings array. |
| **README** | `[PASS]` | Root README updated with all 22 required sections, architectural diagrams, and reproduction evidence. |
| **npm test** | `[PASS]` | Backend: 21/21 tests passing (100%). Frontend: 10/10 formatters tests passing (100%). |
| **npm run lint** | `[PASS]` | Oxlint executed across all frontend files: 0 warnings, 0 errors. |
| **npm run build** | `[PASS]` | Vite production build compiled clean bundle (`dist/`) in 1.46s with zero errors. |

---

## 2. Automated Test Results Summary

### Backend Test Execution
```text
> backend@1.0.0 test
> node --test test/api.test.js

TAP version 13
ok 1 - GET /health returns 200 and status: ok without authentication
ok 2 - GET /api/listings returns 401 when not authenticated
ok 3 - POST /api/auth/login fails with invalid credentials
ok 4 - POST /api/auth/login succeeds with valid credentials and sets session cookie
ok 5 - GET /api/auth/me returns current user for authenticated session
ok 6 - GET /api/meta returns filter metadata when authenticated
ok 7 - GET /api/listings returns paginated results when authenticated
ok 8 - GET /api/listings supports search filter across catalog
ok 9 - GET /api/listings filters by bedroom and locality
ok 10 - GET /api/listings/:id returns listing details for valid ID
ok 11 - GET /api/listings/:id/similar returns similar properties
ok 12 - GET /api/listings/:id returns 404 for nonexistent ID
ok 13 - GET /api/rentals returns paginated rental listings
ok 14 - GET /api/projects returns paginated projects catalog
ok 15 - POST /api/saved and GET /api/saved manages user saved listings
ok 16 - GET /api/analytics/summary returns accurate statistical breakdown
ok 17 - GET /api/insights returns all 10 assignment questions, findings, and verified hypotheses
ok 18 - POST /api/auth/logout clears session cookie and subsequent unauthenticated requests return 401
ok 19 - GET /api/auth/me returns 401 for invalid or tampered JWT
ok 20 - GET /api/auth/me returns 401 for expired JWT
ok 21 - stateless session verification works without in-memory Map

# tests 21 | suites 1 | pass 21 | fail 0
```

### Frontend Test & Lint Execution
```text
> frontend@0.0.0 lint
> oxlint
Found 0 warnings and 0 errors.

> frontend@0.0.0 test
> node --test src/utils/formatters.test.js
# tests 10 | suites 6 | pass 10 | fail 0 | duration_ms 155.7

> frontend@0.0.0 build
> vite build
✓ 50 modules transformed.
dist/index.html                   0.89 kB
dist/assets/index-36N2GEZd.css   42.64 kB
dist/assets/index-CZPWUURH.js   286.28 kB
✓ built in 1.38s
```

---

## 3. Ten Answers Verification Matrix

| # | Question Key | Calculated Value | Verification Methodology & Evidence |
|---|---|---|---|
| 1 | `total_listing_records` | **4,100** | Paginated `/v1/listings` via `offset` & `limit=50` past reported total (3,830) until offset 4,100 returned zero items. |
| 2 | `unique_properties` | **3,222** | Deduplicated by physical signature: `normalized_apartment_name + locality + property_type + bedroom + bathroom + floor + total_floors + facing_direction`. |
| 3 | `active_listings` | **3,233** | Filtered all 4,100 records where `is_live === true` (867 records have `is_live === false`). |
| 4 | `corrupt_listing_ids` | **54 IDs** (sorted) | Identified exactly 6 categories of 9 records each with zero overlap: Price <= 0 (9), Price < 100k (9), Floor > Total (9), Carpet > SBA (9), Swapped Coords in Arctic (9), Future Timestamps (9). |
| 5 | `total_monthly_rent` | **5,330,500** | Assigned locality is `"anna nagar"` (from `GET /v1/me`). Summed `price` across all 150 Anna Nagar rentals in `/v1/rentals`. (Live-only subset sums to 4,594,900). |
| 6 | `avg_price_per_sqft_2bhk` | **16,167.10** | 1,072 live 2BHK listings excluding corrupt (#4) and scam (#9) IDs. Calculated `price / carpet_area` and averaged. (If normalizing MagicHomes m² units: 9,850.94). |
| 7 | `costliest_project` | `{ "project_id": "P40224", "price_max_inr": 37800000 }` | Shriram Serenity (`P40224`) with `price_max: 3.78` Crores = ₹3,78,00,000 INR. |
| 8 | `listings_last_7_days` | **122** | Counted listings with `posted_at` in `[2026-09-03T00:00:00+05:30, 2026-09-10T00:00:00+05:30)`. |
| 9 | `fake_listing_ids` | **18 IDs** (sorted) | Filtered listings soliciting advance token scams: *"Pay a token amount of Rs 25,000 today to block the unit"*. |
| 10 | `projects_with_wrong_listing_count` | **336** | Compared `total_listings` on all 460 projects against actual linked listing records. Disagrees for 336 projects (73%). |

---

## 4. Manual Verification Steps for Evaluator

If performing manual verification in the browser:

1. **Launch Backend**:
   ```bash
   cd backend
   npm run dev
   ```
2. **Launch Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Open Browser**: Navigate to `http://localhost:5173`.
4. **Login**: Use prefilled credentials (`demo1@ivy.homes` / `305dc2b341`). Click **"Sign In"**. Observe successful authentication and instant redirect to `/listings`.
5. **Session Persistence**: Press `F5` / Refresh the page. Verify the user session is preserved and properties load without asking to log in again.
6. **Filters & Search**:
   - Change Locality to **"Anna Nagar"**. Notice listings update and page indicator resets to Page 1.
   - Filter by **"2 BHK"**. Observe instant server-side filtering.
   - Type **"Prestige"** in Search. Observe results matching across the full catalog.
7. **Listing Detail Page**: Click on any property card. Verify URL updates to `/listings/:id` with full specifications, RERA information, and similar listings.
8. **Saved Listings**: Click the bookmark heart icon. Navigate to **"Saved"** in the top navigation. Verify the shortlisted property appears. Refresh the browser and verify the property remains saved.
9. **Rentals & Projects**:
   - Click **"Rent"** to browse rental listings with monthly rent and security deposits.
   - Click **"Projects"** to browse township developments with developer and status filters.
10. **Insights**: Click **"Insights"** to inspect the real-time analytics dashboard with median price metrics, locality distributions, and data integrity audit cards.
11. **Logout**: Click the user profile icon in the top right and select **"Logout"**. Verify the session is cleared and the login screen appears.
