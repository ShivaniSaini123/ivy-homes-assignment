const express = require("express");
const { fetchSaved, addSaved, removeSaved } = require("../controllers/savedController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

// Support both /saved and /favourites seamlessly
router.get("/saved", fetchSaved);
router.post("/saved", addSaved);
router.delete("/saved/:id", removeSaved);

router.get("/favourites", fetchSaved);
router.post("/favourites", addSaved);
router.delete("/favourites/:id", removeSaved);

module.exports = router;
