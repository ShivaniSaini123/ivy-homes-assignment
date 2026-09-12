const { getListings } = require("../services/ivyService");

async function fetchListings(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const data = await getListings(page, limit);

    res.json(data);
  } catch (error) {
    console.error("Listings error:", error.message);

    res.status(500).json({
      error: error.message
    });
  }
}

module.exports = {
  fetchListings
};
