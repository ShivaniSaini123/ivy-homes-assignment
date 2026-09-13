import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { capitalize } from "../utils/formatters";
import Pagination from "../components/Pagination";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [locality, setLocality] = useState("all");
  const [status, setStatus] = useState("all");
  const [developer, setDeveloper] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadProjects() {
      try {
        setLoading(true);
        setError("");

        const data = await api.getProjects({
          page,
          limit: 12,
          locality,
          status,
          developer,
          search
        });

        if (!isCancelled) {
          setProjects(data.results || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Failed to load projects");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      loadProjects();
    }, search ? 300 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [page, locality, status, developer, search]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const formatProjectPrice = (min, max) => {
    if (!min && !max) return "Price on Request";
    const formatVal = (v) => {
      if (v == null) return "";
      return v < 10 ? `₹${v} Cr` : `₹${v} L`;
    };
    if (min && max) return `${formatVal(min)} - ${formatVal(max)}`;
    return formatVal(min || max);
  };

  return (
    <div className="projects-page-container">
      {/* Page Header */}
      <div className="section-hero-header">
        <h1 className="page-title">Master Planned Real Estate Projects</h1>
        <p className="page-desc">
          Explore premier residential societies and township developments across Chennai with verified RERA certifications.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="filter-panel">
        <div className="filter-grid">
          <div className="filter-item">
            <label htmlFor="project-search">Search</label>
            <input
              id="project-search"
              type="text"
              className="dark-form-input filter-input"
              placeholder="Project or builder..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="filter-item">
            <label htmlFor="project-locality">Locality</label>
            <select
              id="project-locality"
              className="dark-form-input filter-select"
              value={locality}
              onChange={handleFilterChange(setLocality)}
            >
              <option value="all">All Localities</option>
              <option value="adyar">Adyar</option>
              <option value="anna nagar">Anna Nagar</option>
              <option value="guindy">Guindy</option>
              <option value="omr">OMR</option>
              <option value="perungudi">Perungudi</option>
              <option value="porur">Porur</option>
              <option value="t nagar">T Nagar</option>
              <option value="tambaram">Tambaram</option>
              <option value="thoraipakkam">Thoraipakkam</option>
              <option value="velachery">Velachery</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="project-status">Project Status</label>
            <select
              id="project-status"
              className="dark-form-input filter-select"
              value={status}
              onChange={handleFilterChange(setStatus)}
            >
              <option value="all">All Statuses</option>
              <option value="ready to move">Ready to Move</option>
              <option value="under construction">Under Construction</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="project-developer">Developer</label>
            <select
              id="project-developer"
              className="dark-form-input filter-select"
              value={developer}
              onChange={handleFilterChange(setDeveloper)}
            >
              <option value="all">All Developers</option>
              <option value="Sobha">Sobha</option>
              <option value="Prestige">Prestige</option>
              <option value="Brigade">Brigade</option>
              <option value="Godrej">Godrej</option>
              <option value="Puravankara">Puravankara</option>
              <option value="Casagrand">Casagrand</option>
              <option value="Salarpuria">Salarpuria</option>
              <option value="Adarsh">Adarsh</option>
              <option value="Rohan">Rohan</option>
            </select>
          </div>
        </div>

        <div className="results-count-badge">
          <span>{total.toLocaleString()} Verified Projects Found</span>
        </div>
      </div>

      {/* Grid or Loading/Error */}
      {loading ? (
        <div className="grid-loading-spinner">
          <div className="auth-spinner" />
          <span>Loading verified projects...</span>
        </div>
      ) : error ? (
        <div className="detail-error-card">
          <h2>Failed to Load Projects</h2>
          <p>{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state-card">
          <h3>No Projects Found</h3>
          <p>Try adjusting your search criteria or developer filters.</p>
        </div>
      ) : (
        <div className="dark-property-grid project-grid-custom">
          {projects.map((p) => (
            <div key={p.project_id} className="property-card project-card">
              <div className="project-card-header">
                <span className="project-dev-tag">{p.developer_name}</span>
                <span className={`status-pill ${p.project_status === "ready to move" ? "ready" : "ongoing"}`}>
                  {capitalize(p.project_status || "Active")}
                </span>
              </div>

              <div className="card-body">
                <h3 className="card-title" title={p.apartment_name}>
                  {p.apartment_name}
                </h3>
                <div className="card-locality">
                  <span className="pin-icon">📍</span>
                  <span>{capitalize(p.locality || "Chennai")}</span>
                </div>

                <div className="project-price-strip">
                  <span className="price-tagline">Price Range</span>
                  <span className="card-price-value">{formatProjectPrice(p.price_min, p.price_max)}</span>
                </div>

                <div className="card-specs-row">
                  <div className="spec-cell">
                    <span>🏘️</span>
                    <span>{p.total_units?.toLocaleString() || "N/A"} Units</span>
                  </div>
                  <div className="spec-cell">
                    <span>🏢</span>
                    <span>{p.total_towers || "Multi"} Towers</span>
                  </div>
                  <div className="spec-cell">
                    <span>📐</span>
                    <span>{p.min_area_sqft ? `${p.min_area_sqft}-${p.max_area_sqft} sqft` : "Various"}</span>
                  </div>
                </div>

                {p.rera_number && (
                  <div className="project-rera-pill">
                    <span>RERA: {p.rera_number}</span>
                  </div>
                )}

                {Array.isArray(p.amenities) && p.amenities.length > 0 && (
                  <div className="project-amenity-tags">
                    {p.amenities.slice(0, 4).map((amenity, idx) => (
                      <span key={idx} className="amenity-mini-tag">
                        {capitalize(amenity)}
                      </span>
                    ))}
                    {p.amenities.length > 4 && (
                      <span className="amenity-mini-tag count-tag">+{p.amenities.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 180, behavior: "smooth" });
          }}
          loading={loading}
        />
      )}
    </div>
  );
}
