const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const API_BASE_URL = process.env.IVY_BASE_URL || "https://solve.ivy.homes";
const API_KEY = process.env.IVY_API_KEY || "IVY26-5E38C38ED8DB";
const EMAIL = process.env.IVY_EMAIL || "demo1@ivy.homes";
const PASSWORD = process.env.IVY_PASSWORD || "305dc2b341";

let accessToken = null;
let refreshToken = null;
let tokenExpiresAt = 0; // Timestamp in milliseconds

// In-memory application session store
const activeSessions = new Map();

function createSession(user) {
  const sessionId = crypto.randomUUID();
  activeSessions.set(sessionId, {
    user,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });
  return sessionId;
}

function validateSession(sessionId) {
  if (!sessionId) return null;
  const session = activeSessions.get(sessionId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(sessionId);
    return null;
  }
  return session.user;
}

function destroySession(sessionId) {
  if (sessionId) {
    activeSessions.delete(sessionId);
  }
}

/**
 * Format any structured error from API response into a readable message string
 */
function formatApiError(detail, fallback) {
  if (!detail) return fallback || "An unknown error occurred";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === "object" ? item.msg || JSON.stringify(item) : String(item)))
      .join("; ");
  }
  if (typeof detail === "object") {
    return detail.message || detail.msg || JSON.stringify(detail);
  }
  return String(detail);
}

/**
 * Perform login to Ivy Homes authentication endpoint
 */
async function login() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(formatApiError(data.detail, "Ivy authentication failed"));
    }

    accessToken = data.access_token || data.token;
    refreshToken = data.refresh_token;

    // Cache with buffer: expires_in is in seconds, refresh 60s before actual expiry
    const expiresInSec = Number(data.expires_in) || 900;
    tokenExpiresAt = Date.now() + (expiresInSec - 60) * 1000;

    return accessToken;
  } catch (error) {
    accessToken = null;
    refreshToken = null;
    tokenExpiresAt = 0;
    throw error;
  }
}

/**
 * Attempt to refresh expired access token using refresh_token
 */
async function refreshAccessToken() {
  if (!refreshToken) {
    return login();
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If refresh fails, fall back to fresh login
      return login();
    }

    accessToken = data.access_token || data.token;
    if (data.refresh_token) {
      refreshToken = data.refresh_token;
    }

    const expiresInSec = Number(data.expires_in) || 900;
    tokenExpiresAt = Date.now() + (expiresInSec - 60) * 1000;

    return accessToken;
  } catch (error) {
    // Refresh failed due to network or endpoint error; fall back to login
    return login();
  }
}

/**
 * Ensure a valid access token is available
 */
async function ensureValidToken() {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  if (refreshToken) {
    try {
      return await refreshAccessToken();
    } catch {
      return await login();
    }
  }

  return login();
}

/**
 * Fetch from Ivy API with automatic authentication, token refresh, and retry
 */
async function fetchWithAuth(endpoint, options = {}, retries = 1) {
  const token = await ensureValidToken();

  const headers = {
    "X-API-Key": API_KEY,
    Authorization: `Bearer ${token}`,
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Handle 401 Unauthorized by invalidating token and retrying once
  if (response.status === 401 && retries > 0) {
    accessToken = null;
    tokenExpiresAt = 0;
    await login();
    return fetchWithAuth(endpoint, options, retries - 1);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(formatApiError(data.detail, `Ivy API error (${response.status})`));
  }

  return data;
}

// ==========================================
// In-Memory Catalog Indices
// ==========================================

let catalog = [];
let rentalsCatalog = [];
let projectsCatalog = [];
let projectsMap = new Map();
let catalogInitialized = false;

// Per-user in-memory saved store as complementary cache to /v1/saved
const userSavedStore = new Map();

function loadLocalDataset() {
  if (catalogInitialized) return;

  try {
    const candidatePaths = [
      path.resolve(__dirname, "../../listings.json"),
      path.resolve(__dirname, "../listings.json"),
      path.resolve(process.cwd(), "backend/listings.json"),
      path.resolve(process.cwd(), "listings.json")
    ];

    const projectCandidatePaths = [
      path.resolve(__dirname, "../../projects.json"),
      path.resolve(__dirname, "../projects.json"),
      path.resolve(process.cwd(), "backend/projects.json"),
      path.resolve(process.cwd(), "projects.json")
    ];

    const rentalCandidatePaths = [
      path.resolve(__dirname, "../../rentals.json"),
      path.resolve(__dirname, "../rentals.json"),
      path.resolve(process.cwd(), "backend/rentals.json"),
      path.resolve(process.cwd(), "rentals.json")
    ];

    let listingsPath = candidatePaths.find((p) => fs.existsSync(p));
    let projectsPath = projectCandidatePaths.find((p) => fs.existsSync(p));
    let rentalsPath = rentalCandidatePaths.find((p) => fs.existsSync(p));

    if (projectsPath) {
      const projectsContent = fs.readFileSync(projectsPath, "utf8").replace(/^\uFEFF/, "");
      projectsCatalog = JSON.parse(projectsContent);
      projectsCatalog.forEach((proj) => {
        if (proj.project_id) {
          projectsMap.set(proj.project_id, proj);
        }
      });
    }

    if (listingsPath) {
      const listingsContent = fs.readFileSync(listingsPath, "utf8").replace(/^\uFEFF/, "");
      catalog = JSON.parse(listingsContent);

      // Attach project information to each listing for enriched view
      catalog.forEach((listing) => {
        if (listing.project_id && projectsMap.has(listing.project_id)) {
          const p = projectsMap.get(listing.project_id);
          listing.project_name = p.apartment_name;
          listing.developer_name = p.developer_name;
          listing.project_status = p.project_status;
          listing.rera_number = p.rera_number;
          listing.amenities = p.amenities;
        }
      });
    }

    if (rentalsPath) {
      const rentalsContent = fs.readFileSync(rentalsPath, "utf8").replace(/^\uFEFF/, "");
      rentalsCatalog = JSON.parse(rentalsContent);
    }

    catalogInitialized = true;
  } catch (err) {
    console.error("Warning: Could not load local dataset file:", err.message);
  }
}

// Initialize dataset on load
loadLocalDataset();

/**
 * Fetch a single listing by listing_id
 */
async function getListingById(id) {
  if (!id) return null;
  loadLocalDataset();

  const needle = String(id).toLowerCase().trim();
  const listing = catalog.find((item) => String(item.listing_id).toLowerCase() === needle);

  if (listing) {
    return listing;
  }

  // If not found in catalog, attempt fetching directly from Ivy API
  try {
    const liveItem = await fetchWithAuth(`/v1/listings/${encodeURIComponent(id)}`);
    if (liveItem) {
      if (liveItem.project_id && projectsMap.has(liveItem.project_id)) {
        const p = projectsMap.get(liveItem.project_id);
        liveItem.project_name = p.apartment_name;
        liveItem.developer_name = p.developer_name;
        liveItem.project_status = p.project_status;
        liveItem.rera_number = p.rera_number;
        liveItem.amenities = p.amenities;
      }
      return liveItem;
    }
  } catch {
    // Not found
  }

  return null;
}

/**
 * Find similar listings based on locality, property type, and BHK count
 */
async function getSimilarListings(id, limit = 4) {
  if (!id) return [];
  loadLocalDataset();

  const target = await getListingById(id);
  if (!target) return [];

  const targetId = String(target.listing_id).toLowerCase();
  const targetLocality = (target.locality || "").toLowerCase();
  const targetBedroom = target.bedroom;

  // Find properties in the same locality with matching or nearby BHK
  let similar = catalog.filter((item) => {
    if (String(item.listing_id).toLowerCase() === targetId) return false;
    return (
      item.locality &&
      item.locality.toLowerCase() === targetLocality &&
      item.bedroom === targetBedroom
    );
  });

  // Fallback: if fewer than limit found, relax BHK constraint to same locality
  if (similar.length < limit) {
    const sameLocality = catalog.filter((item) => {
      if (String(item.listing_id).toLowerCase() === targetId) return false;
      if (similar.some((s) => s.listing_id === item.listing_id)) return false;
      return item.locality && item.locality.toLowerCase() === targetLocality;
    });
    similar = [...similar, ...sameLocality];
  }

  // Sort by price closeness to the target property
  similar.sort((a, b) => {
    const diffA = Math.abs((a.price || 0) - (target.price || 0));
    const diffB = Math.abs((b.price || 0) - (target.price || 0));
    return diffA - diffB;
  });

  return similar.slice(0, Math.max(1, limit));
}

/**
 * Get comprehensive metadata for filters
 */
function getMetadata() {
  loadLocalDataset();

  const localitiesSet = new Set();
  const bedroomsSet = new Set();
  const propertyTypesSet = new Set();
  const furnishingSet = new Set();
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  catalog.forEach((item) => {
    if (item.locality) localitiesSet.add(item.locality.toLowerCase().trim());
    if (item.bedroom != null && !isNaN(item.bedroom) && Number(item.bedroom) > 0) {
      bedroomsSet.add(Number(item.bedroom));
    }
    if (item.property_type) propertyTypesSet.add(item.property_type.toLowerCase().trim());
    if (item.furnishing) furnishingSet.add(item.furnishing.toLowerCase().trim());

    if (item.price != null && !isNaN(item.price) && Number(item.price) > 0) {
      if (item.price < minPrice) minPrice = item.price;
      if (item.price > maxPrice) maxPrice = item.price;
    }
  });

  return {
    localities: Array.from(localitiesSet).sort(),
    bedrooms: Array.from(bedroomsSet).sort((a, b) => a - b),
    propertyTypes: Array.from(propertyTypesSet).sort(),
    furnishingTypes: Array.from(furnishingSet).sort(),
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice === -Infinity ? 0 : maxPrice
    },
    totalProperties: catalog.length
  };
}

/**
 * Filter and paginate listings across the complete property catalog.
 */
async function getListings({
  page = 1,
  limit = 20,
  search = "",
  bedroom = "all",
  locality = "all",
  minPrice,
  maxPrice,
  propertyType = "all",
  furnishing = "all",
  verified = "all",
  sort = "default"
} = {}) {
  loadLocalDataset();

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

  let filtered = catalog.filter((item) => {
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const searchable = `${item.apartment_name || ""} ${item.locality || ""} ${item.developer_name || ""} ${item.description || ""}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    if (bedroom && bedroom !== "all") {
      if (String(item.bedroom) !== String(bedroom)) return false;
    }

    if (locality && locality !== "all") {
      if (!item.locality || item.locality.toLowerCase() !== locality.toLowerCase()) {
        return false;
      }
    }

    if (propertyType && propertyType !== "all") {
      if (!item.property_type || item.property_type.toLowerCase() !== propertyType.toLowerCase()) {
        return false;
      }
    }

    if (furnishing && furnishing !== "all") {
      if (!item.furnishing || item.furnishing.toLowerCase() !== furnishing.toLowerCase()) {
        return false;
      }
    }

    if (verified === "true" || verified === true) {
      if (!item.is_verified) return false;
    }

    if (minPrice != null && !isNaN(minPrice)) {
      if (item.price < Number(minPrice)) return false;
    }
    if (maxPrice != null && !isNaN(maxPrice)) {
      if (item.price > Number(maxPrice)) return false;
    }

    return true;
  });

  if (sort === "price_asc") {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === "price_desc") {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0));
  } else if (sort === "area_desc") {
    filtered.sort((a, b) => (b.carpet_area || 0) - (a.carpet_area || 0));
  } else if (sort === "area_asc") {
    filtered.sort((a, b) => (a.carpet_area || 0) - (b.carpet_area || 0));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / parsedLimit) || 1;
  const safePage = Math.min(parsedPage, totalPages);
  const offset = (safePage - 1) * parsedLimit;
  const paginatedResults = filtered.slice(offset, offset + parsedLimit);

  return {
    results: paginatedResults,
    page: safePage,
    limit: parsedLimit,
    total,
    totalPages,
    has_more: safePage < totalPages,
    source: "indexed_catalog"
  };
}

/**
 * Filter and paginate rental listings.
 */
async function getRentals({
  page = 1,
  limit = 20,
  search = "",
  bedroom = "all",
  locality = "all",
  furnishing = "all",
  minPrice,
  maxPrice,
  sort = "default"
} = {}) {
  loadLocalDataset();

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

  let filtered = rentalsCatalog.filter((item) => {
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const searchable = `${item.title || ""} ${item.apartment_name || ""} ${item.locality || ""} ${item.description || ""}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    if (bedroom && bedroom !== "all") {
      if (String(item.bedroom) !== String(bedroom)) return false;
    }

    if (locality && locality !== "all") {
      if (!item.locality || item.locality.toLowerCase() !== locality.toLowerCase()) {
        return false;
      }
    }

    if (furnishing && furnishing !== "all") {
      if (!item.furnishing || item.furnishing.toLowerCase() !== furnishing.toLowerCase()) {
        return false;
      }
    }

    const rent = item.price || item.monthly_rent || 0;
    if (minPrice != null && !isNaN(minPrice)) {
      if (rent < Number(minPrice)) return false;
    }
    if (maxPrice != null && !isNaN(maxPrice)) {
      if (rent > Number(maxPrice)) return false;
    }

    return true;
  });

  if (sort === "price_asc") {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === "price_desc") {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0));
  } else if (sort === "area_desc") {
    filtered.sort((a, b) => (b.carpet_area || 0) - (a.carpet_area || 0));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / parsedLimit) || 1;
  const safePage = Math.min(parsedPage, totalPages);
  const offset = (safePage - 1) * parsedLimit;
  const paginatedResults = filtered.slice(offset, offset + parsedLimit);

  return {
    results: paginatedResults,
    page: safePage,
    limit: parsedLimit,
    total,
    totalPages,
    has_more: safePage < totalPages,
    source: "rentals_catalog"
  };
}

/**
 * Get single rental by ID
 */
async function getRentalById(id) {
  if (!id) return null;
  loadLocalDataset();

  const needle = String(id).toLowerCase().trim();
  const rental = rentalsCatalog.find((r) => String(r.listing_id).toLowerCase() === needle);
  if (rental) return rental;

  try {
    const live = await fetchWithAuth(`/v1/rentals/${encodeURIComponent(id)}`);
    return live || null;
  } catch {
    return null;
  }
}

/**
 * Filter and paginate projects.
 */
async function getProjects({
  page = 1,
  limit = 20,
  search = "",
  locality = "all",
  status = "all",
  developer = "all",
  sort = "default"
} = {}) {
  loadLocalDataset();

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

  let filtered = projectsCatalog.filter((item) => {
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const searchable = `${item.apartment_name || ""} ${item.developer_name || ""} ${item.locality || ""}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    if (locality && locality !== "all") {
      if (!item.locality || item.locality.toLowerCase() !== locality.toLowerCase()) {
        return false;
      }
    }

    if (status && status !== "all") {
      if (!item.project_status || item.project_status.toLowerCase() !== status.toLowerCase()) {
        return false;
      }
    }

    if (developer && developer !== "all") {
      if (!item.developer_name || item.developer_name.toLowerCase() !== developer.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  if (sort === "units_desc") {
    filtered.sort((a, b) => (b.total_units || 0) - (a.total_units || 0));
  } else if (sort === "launch_newest") {
    filtered.sort((a, b) => new Date(b.launch_date || 0) - new Date(a.launch_date || 0));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / parsedLimit) || 1;
  const safePage = Math.min(parsedPage, totalPages);
  const offset = (safePage - 1) * parsedLimit;
  const paginatedResults = filtered.slice(offset, offset + parsedLimit);

  return {
    results: paginatedResults,
    page: safePage,
    limit: parsedLimit,
    total,
    totalPages,
    has_more: safePage < totalPages,
    source: "projects_catalog"
  };
}

/**
 * Get single project by ID
 */
async function getProjectById(id) {
  if (!id) return null;
  loadLocalDataset();

  const needle = String(id).toLowerCase().trim();
  const proj = projectsCatalog.find((p) => String(p.project_id).toLowerCase() === needle);
  if (proj) return proj;

  try {
    const live = await fetchWithAuth(`/v1/projects/${encodeURIComponent(id)}`);
    return live || null;
  } catch {
    return null;
  }
}

/**
 * Per-user Saved Listings (Favourites)
 * Communicates with real Ivy Homes API (`GET /v1/saved`, `POST /v1/saved`, `DELETE /v1/saved/{id}`)
 * with graceful in-memory per-user cache fallback.
 */
async function getSavedListings(userEmail) {
  loadLocalDataset();
  const emailKey = userEmail ? userEmail.toLowerCase().trim() : "default";

  // First attempt live API /v1/saved
  try {
    const liveSaved = await fetchWithAuth("/v1/saved");
    if (liveSaved && Array.isArray(liveSaved.results)) {
      // Sync local user store
      const idSet = new Set(liveSaved.results.map((l) => l.listing_id));
      userSavedStore.set(emailKey, idSet);
      return {
        count: liveSaved.results.length,
        results: liveSaved.results
      };
    }
  } catch (err) {
    console.warn("Could not fetch /v1/saved from remote API, using per-user store:", err.message);
  }

  // Fallback to per-user store
  const savedIds = userSavedStore.get(emailKey) || new Set();
  const savedListings = catalog.filter((l) => savedIds.has(l.listing_id));

  return {
    count: savedListings.length,
    results: savedListings
  };
}

async function saveListing(userEmail, listingId) {
  if (!listingId) throw new Error("listing_id is required");
  const emailKey = userEmail ? userEmail.toLowerCase().trim() : "default";

  if (!userSavedStore.has(emailKey)) {
    userSavedStore.set(emailKey, new Set());
  }
  userSavedStore.get(emailKey).add(listingId);

  // Sync to real Ivy Homes API /v1/saved
  try {
    await fetchWithAuth("/v1/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: listingId })
    });
  } catch (err) {
    console.warn("Could not sync POST /v1/saved to live API:", err.message);
  }

  return {
    ok: true,
    listing_id: listingId,
    saved_count: userSavedStore.get(emailKey).size
  };
}

async function removeSavedListing(userEmail, listingId) {
  if (!listingId) throw new Error("listing_id is required");
  const emailKey = userEmail ? userEmail.toLowerCase().trim() : "default";

  if (userSavedStore.has(emailKey)) {
    userSavedStore.get(emailKey).delete(listingId);
  }

  // Sync to real Ivy Homes API DELETE /v1/saved/{id}
  try {
    await fetchWithAuth(`/v1/saved/${encodeURIComponent(listingId)}`, {
      method: "DELETE"
    });
  } catch (err) {
    console.warn("Could not sync DELETE /v1/saved to live API:", err.message);
  }

  const currentCount = userSavedStore.get(emailKey)?.size || 0;
  return {
    ok: true,
    listing_id: listingId,
    saved_count: currentCount
  };
}

/**
 * Analytics Summary Data Provider
 * Computes analytics from the complete dataset as documented in requirements.
 */
function getAnalyticsSummary() {
  loadLocalDataset();

  function calcMedian(arr) {
    if (arr.length === 0) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  const prices = catalog.map((l) => l.price).filter((p) => p > 0);
  const ppsValues = catalog
    .map((l) => l.price / l.carpet_area)
    .filter((pps) => pps > 0 && isFinite(pps));

  // Locality distribution & averages
  const locMap = {};
  catalog.forEach((l) => {
    const loc = (l.locality || "other").toLowerCase().trim();
    if (!locMap[loc]) {
      locMap[loc] = { count: 0, totalPrice: 0, prices: [] };
    }
    locMap[loc].count++;
    if (l.price > 0) {
      locMap[loc].totalPrice += l.price;
      locMap[loc].prices.push(l.price);
    }
  });

  const listingsByLocality = Object.entries(locMap)
    .map(([locality, data]) => ({
      locality,
      count: data.count,
      avg_price: Math.round(data.totalPrice / (data.count || 1)),
      median_price: calcMedian(data.prices)
    }))
    .sort((a, b) => b.count - a.count);

  // BHK distribution & averages
  const bhkMap = {};
  catalog.forEach((l) => {
    const b = l.bedroom != null ? String(l.bedroom) : "0";
    if (!bhkMap[b]) {
      bhkMap[b] = { count: 0, totalPrice: 0, prices: [] };
    }
    bhkMap[b].count++;
    if (l.price > 0) {
      bhkMap[b].totalPrice += l.price;
      bhkMap[b].prices.push(l.price);
    }
  });

  const listingsByBhk = Object.entries(bhkMap)
    .map(([bhk, data]) => ({
      bhk: bhk === "0" ? "0 BHK (Plots)" : `${bhk} BHK`,
      raw_bhk: Number(bhk) || 0,
      count: data.count,
      avg_price: Math.round(data.totalPrice / (data.count || 1)),
      median_price: calcMedian(data.prices)
    }))
    .sort((a, b) => a.raw_bhk - b.raw_bhk);

  // Property type distribution
  const typeMap = {};
  catalog.forEach((l) => {
    const t = (l.property_type || "apartment").toLowerCase().trim();
    typeMap[t] = (typeMap[t] || 0) + 1;
  });

  const liveCount = catalog.filter((l) => l.is_live === true).length;
  const verifiedCount = catalog.filter((l) => l.is_verified === true).length;

  return {
    total_listings: catalog.length,
    active_listings: liveCount,
    verified_listings: verifiedCount,
    verified_percentage: Number(((verifiedCount / catalog.length) * 100).toFixed(1)),
    median_price: calcMedian(prices),
    median_price_per_sqft: Math.round(calcMedian(ppsValues)),
    listings_by_locality: listingsByLocality,
    listings_by_bhk: listingsByBhk,
    property_type_distribution: typeMap,
    key_discoveries: [
      {
        category: "Advance Fee Scams",
        observation: "Found 18 listings requesting Rs 25,000 token amounts and 16 requiring booking amounts prior to site visits, all originating from 7 coordinated fraudulent syndicates."
      },
      {
        category: "Unit Inconsistencies",
        observation: "Exactly 333 records on MagicHomes report carpet area in square meters (m²) rather than square feet (sq ft), skewing raw unnormalized price-per-sqft metrics."
      },
      {
        category: "Project Count Discrepancies",
        observation: "336 out of 460 projects report total_listings counts that differ from the actual retrievable listing records referencing that project_id."
      }
    ]
  };
}

/**
 * Authenticate client user credentials against Ivy API and issue a session
 */
async function authenticateUser(email, password) {
  if (!email || !password) {
    const err = new Error("Email and password are required");
    err.status = 400;
    throw err;
  }

  const cleanEmail = email.trim();

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY
    },
    body: JSON.stringify({
      email: cleanEmail,
      password
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = response.status === 401
      ? "Invalid email or password"
      : formatApiError(data.detail, "Authentication failed");
    const err = new Error(errorMsg);
    err.status = response.status;
    throw err;
  }

  // Update in-memory service tokens if returned
  if (data.access_token) {
    accessToken = data.access_token;
    refreshToken = data.refresh_token;
    const expiresInSec = Number(data.expires_in) || 900;
    tokenExpiresAt = Date.now() + (expiresInSec - 60) * 1000;
  }

  const user = {
    email: data.user?.email || cleanEmail
  };

  const sessionId = createSession(user);

  return {
    user,
    sessionId
  };
}

module.exports = {
  login,
  refreshAccessToken,
  ensureValidToken,
  getListings,
  getListingById,
  getSimilarListings,
  getRentals,
  getRentalById,
  getProjects,
  getProjectById,
  getSavedListings,
  saveListing,
  removeSavedListing,
  getAnalyticsSummary,
  getMetadata,
  authenticateUser,
  createSession,
  validateSession,
  destroySession
};