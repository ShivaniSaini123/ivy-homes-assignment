const express = require("express");
const {
  fetchListings,
  fetchListingById,
  fetchSimilarListings,
  fetchMetadata
} = require("../controllers/listingController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all listing and metadata resources
router.use(requireAuth);

router.get("/meta", fetchMetadata);
router.get("/listings", fetchListings);
router.get("/listings/:id/similar", fetchSimilarListings);
router.get("/listings/:id", fetchListingById);

module.exports = router;
