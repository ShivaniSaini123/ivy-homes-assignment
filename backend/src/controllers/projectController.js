const { getProjects, getProjectById } = require("../services/ivyService");

/**
 * GET /api/projects
 * Paginated and filtered real estate projects
 */
async function fetchProjects(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      locality,
      status,
      developer,
      sort
    } = req.query;

    const data = await getProjects({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search: typeof search === "string" ? search.trim() : "",
      locality: typeof locality === "string" ? locality.trim() : "all",
      status: typeof status === "string" ? status.trim() : "all",
      developer: typeof developer === "string" ? developer.trim() : "all",
      sort: typeof sort === "string" ? sort.trim() : "default"
    });

    res.json(data);
  } catch (error) {
    console.error("Fetch projects error:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch projects" });
  }
}

/**
 * GET /api/projects/:id
 * Single project details
 */
async function fetchProjectById(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Project ID is required" });

    const project = await getProjectById(id);
    if (!project) {
      return res.status(404).json({ error: `Project with ID '${id}' was not found` });
    }

    res.json(project);
  } catch (error) {
    console.error("Fetch project by ID error:", error.message);
    res.status(500).json({ error: error.message || "Failed to fetch project details" });
  }
}

module.exports = {
  fetchProjects,
  fetchProjectById
};
