const express = require("express");
const { loginUser, getCurrentUser, logoutUser } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", loginUser);
router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", logoutUser);

module.exports = router;
