const {
  getListings,
  getListingById,
  getSimilarListings,
  getMetadata
} = require("../services/ivyService");

/**
 * GET /api/listings
 * Fetch paginated listings with search, filter, and sort options
 */
async function fetchListings(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      bedroom,
      bhk, // alias for bedroom
      locality,
      minPrice,
      maxPrice,
      propertyType,
      furnishing,
      verified,
      sort
    } = req.query;

    const queryParams = {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search: typeof search === "string" ? search.trim() : "",
      bedroom: bedroom || bhk || "all",
      locality: typeof locality === "string" ? locality.trim() : "all",
      minPrice: minPrice !== undefined && minPrice !== "" ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : undefined,
      propertyType: typeof propertyType === "string" ? propertyType.trim() : "all",
      furnishing: typeof furnishing === "string" ? furnishing.trim() : "all",
      verified: verified !== undefined ? verified : "all",
      sort: typeof sort === "string" ? sort.trim() : "default"
    };

    const data = await getListings(queryParams);

    res.json(data);
  } catch (error) {
    console.error("Fetch listings error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to fetch listings"
    });
  }
}

/**
 * GET /api/listings/:id
 * Fetch a single listing by its unique identifier
 */
async function fetchListingById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Listing ID is required" });
    }

    const listing = await getListingById(id);

    if (!listing) {
      return res.status(404).json({ error: `Listing with ID '${id}' was not found` });
    }

    res.json(listing);
  } catch (error) {
    console.error("Fetch listing by ID error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to fetch listing details"
    });
  }
}

/**
 * GET /api/listings/:id/similar
 * Fetch similar listings for a given listing ID
 */
async function fetchSimilarListings(req, res) {
  try {
    const { id } = req.params;
    const limit = Number(req.query.limit) || 4;

    if (!id) {
      return res.status(400).json({ error: "Listing ID is required" });
    }

    const similar = await getSimilarListings(id, limit);
    res.json({ results: similar, count: similar.length });
  } catch (error) {
    console.error("Fetch similar listings error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to fetch similar listings"
    });
  }
}

/**
 * GET /api/meta
 * Fetch metadata for dynamic frontend filters
 */
async function fetchMetadata(req, res) {
  try {
    const meta = getMetadata();
    res.json(meta);
  } catch (error) {
    console.error("Fetch metadata error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to retrieve filter metadata"
    });
  }
}

module.exports = {
  fetchListings,
  fetchListingById,
  fetchSimilarListings,
  fetchMetadata
};
