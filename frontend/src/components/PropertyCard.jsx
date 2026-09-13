import React from "react";
import { formatPrice, formatArea, capitalize } from "../utils/formatters";

// Curated architectural ambient themes for cards
const ARCHITECTURAL_THEMES = [
  {
    bg: "radial-gradient(circle at 80% 20%, #2e1065 0%, #171026 60%, #0d0b14 100%)",
    accent: "#8b5cf6"
  },
  {
    bg: "radial-gradient(circle at 80% 20%, #1e1b4b 0%, #14132b 60%, #0d0b14 100%)",
    accent: "#6366f1"
  },
  {
    bg: "radial-gradient(circle at 80% 20%, #042f2e 0%, #0d1e22 60%, #0d0b14 100%)",
    accent: "#14b8a6"
  },
  {
    bg: "radial-gradient(circle at 80% 20%, #1e293b 0%, #151928 60%, #0d0b14 100%)",
    accent: "#a78bfa"
  }
];

function getTheme(id) {
  if (!id) return ARCHITECTURAL_THEMES[0];
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }
  return ARCHITECTURAL_THEMES[sum % ARCHITECTURAL_THEMES.length];
}

export default function PropertyCard({
  listing,
  isFavorite = false,
  onToggleFavorite,
  onSelect
}) {
  const {
    listing_id,
    apartment_name,
    locality,
    price,
    bedroom,
    bathroom,
    carpet_area,
    furnishing,
    covered_parking,
    property_type,
    is_verified,
    posted_by_name,
    posted_by
  } = listing;

  const theme = getTheme(listing_id);

  return (
    <article className="property-card" onClick={() => onSelect(listing)}>
      {/* Large Architectural Top Visual Placeholder */}
      <div className="card-visual-wrapper" style={{ background: theme.bg }}>
        {/* CSS Architectural Building Silhouette / Blueprint lines */}
        <div className="architectural-graphic">
          <svg
            className="blueprint-svg"
            viewBox="0 0 400 180"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M40 180V90L110 50L180 90V180H40Z"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1.5"
            />
            <path
              d="M170 180V60L250 20L330 60V180H170Z"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
            />
            <path
              d="M320 180V100L380 70V180H320Z"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1.5"
            />
            <line x1="0" y1="179" x2="400" y2="179" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <circle cx="250" cy="50" r="3" fill="rgba(139,92,246,0.6)" />
            <circle cx="110" cy="70" r="2.5" fill="rgba(139,92,246,0.4)" />
          </svg>
          <div className="visual-vignette" />
        </div>

        {/* Badges on Top */}
        <div className="card-badge-row">
          <div className="badge-pills">
            <span className="pill-bhk">{bedroom || 1} BHK</span>
            {property_type && (
              <span className="pill-type">{capitalize(property_type)}</span>
            )}
          </div>

          {/* Heart Button */}
          <button
            type="button"
            className={`card-heart-btn ${isFavorite ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(listing_id);
            }}
            title={isFavorite ? "Remove from shortlisted" : "Add to shortlisted"}
            aria-label="Toggle shortlist"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFavorite ? "#f43f5e" : "none"}
              stroke={isFavorite ? "#f43f5e" : "#f5f3ff"}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>

        {/* Bottom Tag within Visual: Verified badge */}
        {is_verified && (
          <div className="verified-status-tag">
            <span className="verified-icon">✓</span> Verified Property
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div className="card-body">
        {/* Apartment Title & Locality */}
        <div className="card-header-meta">
          <h3 className="card-title" title={apartment_name}>
            {apartment_name || "Premium Residence"}
          </h3>
          <p className="card-locality">
            <svg
              className="pin-icon"
              width="13"
              height="13"
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
            <span>{capitalize(locality || "Prime Locality")}</span>
          </p>
        </div>

        {/* Prominent Price */}
        <div className="card-price-container">
          <span className="card-price-value">{formatPrice(price)}</span>
        </div>

        {/* Core Specs Grid */}
        <div className="card-specs-row">
          <div className="spec-cell" title="Bedrooms">
            <span className="spec-emoji">🛏</span>
            <span className="spec-text">{bedroom} BHK</span>
          </div>
          <div className="spec-cell" title="Bathrooms">
            <span className="spec-emoji">🚿</span>
            <span className="spec-text">{bathroom ? `${bathroom} Bath` : "-"}</span>
          </div>
          <div className="spec-cell" title="Carpet Area">
            <span className="spec-emoji">📐</span>
            <span className="spec-text">{formatArea(carpet_area)}</span>
          </div>
        </div>

        {/* Secondary Specs (Furnishing, Parking) */}
        <div className="card-sub-info">
          <span>{capitalize(furnishing || "Unfurnished")}</span>
          {covered_parking > 0 && (
            <>
              <span className="sep-bullet">•</span>
              <span>{covered_parking} Parking</span>
            </>
          )}
        </div>

        {/* Card Footer with Poster info and CTA */}
        <div className="card-action-footer">
          <span className="poster-credit" title={posted_by_name}>
            By {posted_by_name || (posted_by ? capitalize(posted_by) : "Verified Partner")}
          </span>
          <button
            type="button"
            className="btn-card-details"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(listing);
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}
