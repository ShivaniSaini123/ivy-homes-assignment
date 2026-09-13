const express = require("express");
const { fetchProjects, fetchProjectById } = require("../controllers/projectController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/projects", fetchProjects);
router.get("/projects/:id", fetchProjectById);

module.exports = router;
