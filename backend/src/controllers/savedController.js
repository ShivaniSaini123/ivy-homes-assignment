const {
  getSavedListings,
  saveListing,
  removeSavedListing
} = require("../services/ivyService");

/**
 * GET /api/saved (and /api/favourites)
 * Retrieve user's saved listings
 */
async function fetchSaved(req, res) {
  try {
    const userEmail = req.user?.email || "demo1@ivy.homes";
    const data = await getSavedListings(userEmail);
    res.json(data);
  } catch (error) {
    console.error("Fetch saved listings error:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch saved listings" });
  }
}

/**
 * POST /api/saved (and /api/favourites)
 * Add a listing to user's saved items
 */
async function addSaved(req, res) {
  try {
    const userEmail = req.user?.email || "demo1@ivy.homes";
    const listingId = req.body.listing_id || req.body.id;

    if (!listingId) {
      return res.status(400).json({ error: "listing_id is required" });
    }

    const result = await saveListing(userEmail, listingId);
    res.status(201).json(result);
  } catch (error) {
    console.error("Save listing error:", error.message);
    res.status(500).json({ error: error.message || "Failed to save listing" });
  }
}

/**
 * DELETE /api/saved/:id (and /api/favourites/:id)
 * Remove a listing from user's saved items
 */
async function removeSaved(req, res) {
  try {
    const userEmail = req.user?.email || "demo1@ivy.homes";
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "listing ID is required" });
    }

    const result = await removeSavedListing(userEmail, id);
    res.json(result);
  } catch (error) {
    console.error("Remove saved listing error:", error.message);
    res.status(500).json({ error: error.message || "Failed to remove saved listing" });
  }
}

module.exports = {
  fetchSaved,
  addSaved,
  removeSaved
};
