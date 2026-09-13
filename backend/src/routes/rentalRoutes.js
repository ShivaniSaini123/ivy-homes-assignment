const express = require("express");
const { fetchRentals, fetchRentalById } = require("../controllers/rentalController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/rentals", fetchRentals);
router.get("/rentals/:id", fetchRentalById);

module.exports = router;
