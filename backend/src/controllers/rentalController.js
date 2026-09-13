const { getRentals, getRentalById } = require("../services/ivyService");

/**
 * GET /api/rentals
 * Paginated and filtered rentals
 */
async function fetchRentals(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      bedroom,
      bhk,
      locality,
      furnishing,
      minPrice,
      maxPrice,
      sort
    } = req.query;

    const data = await getRentals({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search: typeof search === "string" ? search.trim() : "",
      bedroom: bedroom || bhk || "all",
      locality: typeof locality === "string" ? locality.trim() : "all",
      furnishing: typeof furnishing === "string" ? furnishing.trim() : "all",
      minPrice: minPrice !== undefined && minPrice !== "" ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : undefined,
      sort: typeof sort === "string" ? sort.trim() : "default"
    });

    res.json(data);
  } catch (error) {
    console.error("Fetch rentals error:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch rental listings" });
  }
}

/**
 * GET /api/rentals/:id
 * Single rental details
 */
async function fetchRentalById(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Rental ID is required" });

    const rental = await getRentalById(id);
    if (!rental) {
      return res.status(404).json({ error: `Rental with ID '${id}' was not found` });
    }

    res.json(rental);
  } catch (error) {
    console.error("Fetch rental by ID error:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch rental details" });
  }
}

module.exports = {
  fetchRentals,
  fetchRentalById
};
