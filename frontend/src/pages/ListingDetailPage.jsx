import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { formatPrice, formatArea, formatDate, capitalize } from "../utils/formatters";
import PropertyCard from "../components/PropertyCard";

export default function ListingDetailPage({
  id,
  onNavigate,
  favorites = new Set(),
  onToggleFavorite
}) {
  const [listing, setListing] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        setError("");

        const data = await api.getListingById(id);
        if (!isCancelled) {
          setListing(data);
        }

        // Load similar listings
        try {
          const simData = await api.getSimilarListings(id, 4);
          if (!isCancelled) {
            setSimilar(simData.results || []);
          }
        } catch {
          // Non-blocking
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Property not found");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page-container">
        <div className="detail-loading-state">
          <div className="auth-spinner" />
          <span>Loading verified property specifications...</span>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="detail-page-container">
        <div className="detail-error-card">
          <div className="detail-error-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2>Property Not Found</h2>
          <p>{error || `The listing with ID "${id}" does not exist or has been unlisted.`}</p>
          <button type="button" className="btn-back-home" onClick={() => onNavigate("/listings")}>
            ← Back to All Listings
          </button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.has(listing.listing_id);

  return (
    <div className="detail-page-container">
      {/* Top Breadcrumb Navigation */}
      <div className="detail-top-nav">
        <button type="button" className="btn-back-nav" onClick={() => onNavigate("/listings")}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back to Marketplace</span>
        </button>
        <span className="breadcrumb-pill">ID: {listing.listing_id}</span>
      </div>

      {/* Main Detail Header Card */}
      <div className="detail-hero-card">
        <div className="detail-header-left">
          <div className="detail-badges-row">
            <span className="badge-locality-tag">{capitalize(listing.locality || "Chennai")}</span>
            <span className="badge-type-tag">{capitalize(listing.property_type || "Apartment")}</span>
            {listing.is_verified && <span className="verified-status-tag">✓ Ivy Verified</span>}
          </div>
          <h1 className="detail-title">{listing.apartment_name}</h1>
          <p className="detail-sub-meta">
            <span>Posted {formatDate(listing.posted_at)}</span>
            <span>•</span>
            <span>Ref: {listing.website || "Ivy Homes"}</span>
          </p>
        </div>

        <div className="detail-header-right">
          <div className="detail-price-box">
            <span className="price-label">Verified Valuation</span>
            <span className="price-amount">{formatPrice(listing.price)}</span>
            {listing.carpet_area > 0 && (
              <span className="price-per-sqft">
                ₹{Math.round(listing.price / listing.carpet_area).toLocaleString()}/sq ft
              </span>
            )}
          </div>
          <button
            type="button"
            className={`btn-detail-fav ${isFavorite ? "active" : ""}`}
            onClick={() => onToggleFavorite(listing.listing_id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{isFavorite ? "Saved to Shortlist" : "Save Property"}</span>
          </button>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="detail-section-card">
        <h2 className="section-title">Property Architecture & Specifications</h2>
        <div className="dark-specs-grid">
          <div className="spec-cell-lg">
            <span className="spec-label">Configuration</span>
            <span className="spec-value">{listing.bedroom ? `${listing.bedroom} BHK` : "N/A"}</span>
          </div>
          <div className="spec-cell-lg">
            <span className="spec-label">Carpet Area</span>
            <span className="spec-value">{formatArea(listing.carpet_area)}</span>
          </div>
          {listing.super_built_up_area > 0 && (
            <div className="spec-cell-lg">
              <span className="spec-label">Super Built-up Area</span>
              <span className="spec-value">{formatArea(listing.super_built_up_area)}</span>
            </div>
          )}
          <div className="spec-cell-lg">
            <span className="spec-label">Bathrooms</span>
            <span className="spec-value">{listing.bathroom ?? "N/A"}</span>
          </div>
          <div className="spec-cell-lg">
            <span className="spec-label">Balconies</span>
            <span className="spec-value">{listing.balcony ?? "0"}</span>
          </div>
          <div className="spec-cell-lg">
            <span className="spec-label">Floor Position</span>
            <span className="spec-value">
              {listing.floor != null
                ? `${listing.floor} of ${listing.total_floors || "N/A"}`
                : "Not specified"}
            </span>
          </div>
          <div className="spec-cell-lg">
            <span className="spec-label">Facing Direction</span>
            <span className="spec-value">{capitalize(listing.facing_direction || "East")}</span>
          </div>
          <div className="spec-cell-lg">
            <span className="spec-label">Furnishing Status</span>
            <span className="spec-value">{capitalize(listing.furnishing || "Unfurnished")}</span>
          </div>
          <div className="spec-cell-lg">
            <span className="spec-label">Covered Parking</span>
            <span className="spec-value">
              {listing.covered_parking ? `${listing.covered_parking} Vehicle(s)` : "None"}
            </span>
          </div>
        </div>
      </div>

      {/* Society / Developer Information */}
      <div className="detail-section-card">
        <h2 className="section-title">Project & Society Overview</h2>
        <div className="project-info-grid">
          <div>
            <span className="meta-subheading">Project / Society</span>
            <p className="meta-highlight-val">{listing.project_name || listing.apartment_name}</p>
          </div>
          {listing.developer_name && (
            <div>
              <span className="meta-subheading">Developer / Builder</span>
              <p className="meta-highlight-val">{listing.developer_name}</p>
            </div>
          )}
          {listing.project_status && (
            <div>
              <span className="meta-subheading">Project Status</span>
              <p className="meta-highlight-val status-pill">{capitalize(listing.project_status)}</p>
            </div>
          )}
          {listing.rera_number && (
            <div>
              <span className="meta-subheading">RERA Certification</span>
              <p className="meta-highlight-val rera-code">{listing.rera_number}</p>
            </div>
          )}
        </div>

        {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
          <div className="amenities-container">
            <span className="meta-subheading">Society Amenities</span>
            <div className="amenities-tags">
              {listing.amenities.map((amenity, idx) => (
                <span key={idx} className="amenity-tag">
                  ✓ {capitalize(amenity)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description & Seller Information */}
      <div className="detail-section-card">
        <h2 className="section-title">Property Description & Insights</h2>
        <p className="detail-description-text">{listing.description}</p>

        <div className="seller-profile-card">
          <div className="seller-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <span className="seller-name">Listed by {listing.posted_by_name || "Verified Representative"}</span>
            <span className="seller-badge">Role: {capitalize(listing.posted_by || "Representative")}</span>
          </div>
        </div>
      </div>

      {/* Similar Listings Section */}
      {similar.length > 0 && (
        <div className="detail-section-card">
          <div className="section-header-row">
            <h2 className="section-title">Similar Homes in {capitalize(listing.locality)}</h2>
            <span className="section-subtitle">Based on configuration and pricing proximity</span>
          </div>
          <div className="dark-property-grid">
            {similar.map((p) => (
              <PropertyCard
                key={p.listing_id}
                listing={p}
                isFavorite={favorites.has(p.listing_id)}
                onToggleFavorite={onToggleFavorite}
                onSelectProperty={(prop) => onNavigate(`/listings/${prop.listing_id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
