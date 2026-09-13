const { getAnalyticsSummary } = require("../services/ivyService");
const { getDetailedInsights } = require("../services/insightsService");

/**
 * GET /api/analytics/summary
 * Serve comprehensive real estate marketplace insights
 */
function fetchAnalyticsSummary(req, res) {
  try {
    const summary = getAnalyticsSummary();
    res.json(summary);
  } catch (error) {
    console.error("Fetch analytics summary error:", error.message);
    res.status(500).json({ error: error.message || "Failed to generate analytics summary" });
  }
}

/**
 * GET /api/insights
 * Serve all 10 assignment questions, documentation lies, verified hypotheses, and summary metrics
 */
function fetchInsightsData(req, res) {
  try {
    const insights = getDetailedInsights();
    res.json(insights);
  } catch (error) {
    console.error("Fetch detailed insights error:", error.message);
    res.status(500).json({ error: error.message || "Failed to retrieve assignment insights" });
  }
}

module.exports = {
  fetchAnalyticsSummary,
  fetchInsightsData
};
