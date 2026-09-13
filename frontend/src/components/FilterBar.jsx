import React from "react";
import { capitalize } from "../utils/formatters";

export default function FilterBar({
  filters,
  metadata,
  onChange,
  onReset,
  totalResults = 0,
  loading = false,
  showFavoritesOnly = false
}) {
  const localities = metadata?.localities || [];
  const bedrooms = metadata?.bedrooms || [1, 2, 3, 4, 5];
  const propertyTypes = metadata?.propertyTypes || [];
  const furnishingTypes = metadata?.furnishingTypes || [];

  const handleSearchChange = (e) => {
    onChange({ search: e.target.value });
  };

  const handleSelectChange = (key, value) => {
    onChange({ [key]: value });
  };

  const handlePricePreset = (e) => {
    const val = e.target.value;
    if (val === "all") {
      onChange({ minPrice: undefined, maxPrice: undefined, pricePreset: "all" });
    } else if (val === "under_50l") {
      onChange({ minPrice: undefined, maxPrice: 5000000, pricePreset: val });
    } else if (val === "50l_1cr") {
      onChange({ minPrice: 5000000, maxPrice: 10000000, pricePreset: val });
    } else if (val === "1cr_1.5cr") {
      onChange({ minPrice: 10000000, maxPrice: 15000000, pricePreset: val });
    } else if (val === "1.5cr_2cr") {
      onChange({ minPrice: 15000000, maxPrice: 20000000, pricePreset: val });
    } else if (val === "above_2cr") {
      onChange({ minPrice: 20000000, maxPrice: undefined, pricePreset: val });
    }
  };

  const isFiltered =
    Boolean(filters.search) ||
    filters.bedroom !== "all" ||
    filters.locality !== "all" ||
    filters.propertyType !== "all" ||
    filters.furnishing !== "all" ||
    filters.verified === "true" ||
    (filters.pricePreset && filters.pricePreset !== "all") ||
    filters.sort !== "default";

  return (
    <section className="filter-panel">
      {/* Top Controls: Compact Search & Sort */}
      <div className="filter-top-row">
        <div className="compact-search-box">
          <svg
            className="compact-search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            className="compact-search-input"
            placeholder="Filter by apartment, locality or keyword..."
            value={filters.search}
            onChange={handleSearchChange}
            aria-label="Filter search"
          />
          {filters.search && (
            <button
              type="button"
              className="clear-icon-btn"
              onClick={() => onChange({ search: "" })}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="compact-sort-control">
          <label htmlFor="sort-dropdown" className="control-label">Sort:</label>
          <select
            id="sort-dropdown"
            className="compact-select sort-dropdown"
            value={filters.sort}
            onChange={(e) => handleSelectChange("sort", e.target.value)}
          >
            <option value="default">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Listed</option>
            <option value="area_desc">Carpet Area: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Filter Dropdowns Grid */}
      <div className="filter-grid-row">
        {/* BHK Filter */}
        <div className="filter-item">
          <label htmlFor="filter-bhk">BHK</label>
          <select
            id="filter-bhk"
            className="compact-select"
            value={filters.bedroom}
            onChange={(e) => handleSelectChange("bedroom", e.target.value)}
          >
            <option value="all">All BHK</option>
            {bedrooms.map((b) => (
              <option key={b} value={b}>
                {b} BHK
              </option>
            ))}
          </select>
        </div>

        {/* Locality Filter */}
        <div className="filter-item">
          <label htmlFor="filter-locality">Locality</label>
          <select
            id="filter-locality"
            className="compact-select"
            value={filters.locality}
            onChange={(e) => handleSelectChange("locality", e.target.value)}
          >
            <option value="all">All Localities</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {capitalize(loc)}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="filter-item">
          <label htmlFor="filter-price">Price Range</label>
          <select
            id="filter-price"
            className="compact-select"
            value={filters.pricePreset || "all"}
            onChange={handlePricePreset}
          >
            <option value="all">All Budgets</option>
            <option value="under_50l">Under ₹50 L</option>
            <option value="50l_1cr">₹50 L – ₹1 Cr</option>
            <option value="1cr_1.5cr">₹1 Cr – ₹1.5 Cr</option>
            <option value="1.5cr_2cr">₹1.5 Cr – ₹2 Cr</option>
            <option value="above_2cr">Above ₹2 Cr</option>
          </select>
        </div>

        {/* Property Type */}
        <div className="filter-item">
          <label htmlFor="filter-type">Property Type</label>
          <select
            id="filter-type"
            className="compact-select"
            value={filters.propertyType}
            onChange={(e) => handleSelectChange("propertyType", e.target.value)}
          >
            <option value="all">All Types</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {capitalize(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Furnishing */}
        <div className="filter-item">
          <label htmlFor="filter-furnishing">Furnishing</label>
          <select
            id="filter-furnishing"
            className="compact-select"
            value={filters.furnishing}
            onChange={(e) => handleSelectChange("furnishing", e.target.value)}
          >
            <option value="all">All Furnishings</option>
            {furnishingTypes.map((f) => (
              <option key={f} value={f}>
                {capitalize(f)}
              </option>
            ))}
          </select>
        </div>

        {/* Verified Only Toggle */}
        <div className="filter-item verified-toggle-item">
          <label className="verified-checkbox-container" htmlFor="verified-filter-checkbox">
            <input
              id="verified-filter-checkbox"
              type="checkbox"
              checked={filters.verified === "true"}
              onChange={(e) =>
                handleSelectChange("verified", e.target.checked ? "true" : "all")
              }
            />
            <span className="verified-chip">
              <span className="check-mark">✓</span> Verified Only
            </span>
          </label>
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            type="button"
            className="btn-clear-filters"
            onClick={onReset}
            title="Reset all filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Header Bar */}
      <div className="filter-results-bar">
        <div className="results-count-badge">
          {showFavoritesOnly ? (
            <span>
              Showing <strong>{totalResults}</strong> Shortlisted {totalResults === 1 ? "Property" : "Properties"}
            </span>
          ) : (
            <span>
              Showing <strong>{totalResults.toLocaleString()}</strong> Available {totalResults === 1 ? "Property" : "Properties"}
            </span>
          )}
          {loading && <span className="refreshing-indicator">Updating...</span>}
        </div>
      </div>
    </section>
  );
}
