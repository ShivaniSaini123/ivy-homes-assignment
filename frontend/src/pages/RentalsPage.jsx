import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { formatArea, capitalize } from "../utils/formatters";
import Pagination from "../components/Pagination";

export default function RentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [locality, setLocality] = useState("all");
  const [bedroom, setBedroom] = useState("all");
  const [furnishing, setFurnishing] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadRentals() {
      try {
        setLoading(true);
        setError("");

        const data = await api.getRentals({
          page,
          limit: 16,
          locality,
          bedroom,
          furnishing,
          search
        });

        if (!isCancelled) {
          setRentals(data.results || []);
          setTotalPages(data.totalPages || 1);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Failed to load rental properties");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      loadRentals();
    }, search ? 300 : 0);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [page, locality, bedroom, furnishing, search]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const formatMonthlyRent = (amount) => {
    if (!amount) return "Rent on Request";
    return `₹${Number(amount).toLocaleString("en-IN")}/mo`;
  };

  return (
    <div className="rentals-page-container">
      {/* Page Header */}
      <div className="section-hero-header">
        <h1 className="page-title">Verified Rental Residences</h1>
        <p className="page-desc">
          Browse authentic residential rental homes across Chennai with verified security deposits and maintenance terms.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="filter-panel">
        <div className="filter-grid">
          <div className="filter-item">
            <label htmlFor="rental-search">Search</label>
            <input
              id="rental-search"
              type="text"
              className="dark-form-input filter-input"
              placeholder="Apartment, locality..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="filter-item">
            <label htmlFor="rental-locality">Locality</label>
            <select
              id="rental-locality"
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
            <label htmlFor="rental-bhk">Bedrooms (BHK)</label>
            <select
              id="rental-bhk"
              className="dark-form-input filter-select"
              value={bedroom}
              onChange={handleFilterChange(setBedroom)}
            >
              <option value="all">Any BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="rental-furnishing">Furnishing</label>
            <select
              id="rental-furnishing"
              className="dark-form-input filter-select"
              value={furnishing}
              onChange={handleFilterChange(setFurnishing)}
            >
              <option value="all">All Furnishings</option>
              <option value="unfurnished">Unfurnished</option>
              <option value="semi-furnished">Semi-Furnished</option>
              <option value="fully-furnished">Fully Furnished</option>
            </select>
          </div>
        </div>

        <div className="results-count-badge">
          <span>{total.toLocaleString()} Verified Rentals Found</span>
        </div>
      </div>

      {/* Grid or Loading/Error */}
      {loading ? (
        <div className="grid-loading-spinner">
          <div className="auth-spinner" />
          <span>Refreshing rental catalog...</span>
        </div>
      ) : error ? (
        <div className="detail-error-card">
          <h2>Failed to Load Rentals</h2>
          <p>{error}</p>
        </div>
      ) : rentals.length === 0 ? (
        <div className="empty-state-card">
          <h3>No Rentals Matching Filters</h3>
          <p>Try clearing your locality or bedroom filters.</p>
        </div>
      ) : (
        <div className="dark-property-grid">
          {rentals.map((r) => (
            <div key={r.listing_id} className="property-card rental-card">
              <div className="rental-price-banner">
                <span className="rental-price-value">{formatMonthlyRent(r.price)}</span>
                <span className="pill-bhk">{r.bedroom ? `${r.bedroom} BHK` : "Rental"}</span>
              </div>

              <div className="card-body">
                <div className="card-header-meta">
                  <h3 className="card-title" title={r.title || r.apartment_name}>
                    {r.apartment_name || r.title || "Chennai Residence"}
                  </h3>
                  <div className="card-locality">
                    <span className="pin-icon">📍</span>
                    <span>{capitalize(r.locality || "Chennai")}</span>
                  </div>
                </div>

                <div className="rental-deposit-strip">
                  {r.deposit > 0 && (
                    <div className="rental-term">
                      <span className="term-label">Deposit:</span>
                      <span className="term-val">₹{Number(r.deposit).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {r.maintenance > 0 && (
                    <div className="rental-term">
                      <span className="term-label">Maint:</span>
                      <span className="term-val">₹{Number(r.maintenance).toLocaleString("en-IN")}/mo</span>
                    </div>
                  )}
                </div>

                <div className="card-specs-row">
                  <div className="spec-cell">
                    <span>📐</span>
                    <span>{formatArea(r.carpet_area)}</span>
                  </div>
                  <div className="spec-cell">
                    <span>🪑</span>
                    <span>{capitalize(r.furnishing || "Unfurnished")}</span>
                  </div>
                  <div className="spec-cell">
                    <span>🏢</span>
                    <span>{r.floor != null ? `Floor ${r.floor}` : "Ground"}</span>
                  </div>
                </div>

                <p className="rental-card-desc">{r.description?.slice(0, 95)}...</p>

                <div className="rental-card-footer">
                  <span className="rental-poster">Posted by {r.posted_by_name || "Agent"}</span>
                </div>
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
