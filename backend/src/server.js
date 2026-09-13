const path = require("path");

// Load backend .env explicitly, followed by general .env fallback
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const listingRoutes = require("./routes/listingRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const projectRoutes = require("./routes/projectRoutes");
const savedRoutes = require("./routes/savedRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

// Base status endpoints
app.get("/", (req, res) => {
  res.json({
    name: "Ivy Homes Property API Proxy",
    status: "online",
    documentation: "/api/auth/login, /api/auth/me, /api/auth/logout, /api/listings, /api/rentals, /api/projects, /api/saved, /api/analytics/summary",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Ivy Homes Backend",
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Protected application routes
app.use("/api", listingRoutes);
app.use("/api", rentalRoutes);
app.use("/api", projectRoutes);
app.use("/api", savedRoutes);
app.use("/api", analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: `Endpoint '${req.originalUrl}' not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack || err.message);
  res.status(500).json({
    error: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Ivy Homes backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;