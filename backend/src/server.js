require("dotenv").config();

const express = require("express");
const cors = require("cors");

const listingRoutes = require("./routes/listingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Ivy Homes backend is running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Ivy Homes backend is running"
  });
});

app.use("/api", listingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});