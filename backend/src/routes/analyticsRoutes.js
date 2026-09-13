const express = require("express");
const { fetchAnalyticsSummary, fetchInsightsData } = require("../controllers/analyticsController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

// Both /insights and /analytics/summary are supported
router.get("/insights", fetchInsightsData);
router.get("/analytics/insights", fetchInsightsData);
router.get("/analytics/summary", fetchAnalyticsSummary);

module.exports = router;
