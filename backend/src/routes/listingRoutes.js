const express = require("express");
const { fetchListings } = require("../controllers/listingController");

const router = express.Router();

router.get("/listings", fetchListings);

module.exports = router;
