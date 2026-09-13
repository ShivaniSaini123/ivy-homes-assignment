import React from "react";
import { capitalize } from "../utils/formatters";

export default function Hero({
  searchValue = "",
  localityValue = "all",
  localities = [],
  onSearchChange,
  onLocalityChange,
  onSearchSubmit
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-glow" />
      <div className="hero-container">
        <div className="hero-badge">
          <span className="hero-badge-dot" /> Verified Marketplace
        </div>

        <h1 className="hero-headline">
          Find a home <span className="highlight-text">you'll love</span>
        </h1>

        <p className="hero-subheadline">
          Browse verified residential apartments, builder floors, and luxury societies across Chennai with complete price transparency.
        </p>

        {/* Large Hero Search Bar */}
        <form className="hero-search-box" onSubmit={handleSubmit}>
          {/* Property Name Input */}
          <div className="hero-search-field">
            <svg
              className="hero-field-icon"
              width="18"
              height="18"
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
              className="hero-input"
              placeholder="Search apartment, project, builder..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search by property name"
            />
          </div>

          <div className="hero-search-divider" />

          {/* Locality Selector */}
          <div className="hero-search-field locality-field">
            <svg
              className="hero-field-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <select
              className="hero-select"
              value={localityValue}
              onChange={(e) => onLocalityChange(e.target.value)}
              aria-label="Select Locality"
            >
              <option value="all">All Localities</option>
              {localities.map((loc) => (
                <option key={loc} value={loc}>
                  {capitalize(loc)}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button type="submit" className="hero-search-submit-btn">
            <span>Search</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
