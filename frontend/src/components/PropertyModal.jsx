import React, { useEffect } from "react";
import { formatPrice, formatArea, formatDate, capitalize } from "../utils/formatters";

export default function PropertyModal({
  listing,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !listing) return null;

  const {
    listing_id,
    apartment_name,
    locality,
    price,
    bedroom,
    bathroom,
    balcony,
    carpet_area,
    super_built_up_area,
    furnishing,
    floor,
    total_floors,
    facing_direction,
    covered_parking,
    property_type,
    is_verified,
    posted_by,
    posted_by_name,
    description,
    posted_at,
    listing_url,
    website,
    project_name,
    developer_name,
    project_status,
    rera_number,
    amenities
  } = listing;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dark-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="dark-modal-header">
          <div className="modal-title-col">
            <div className="modal-badge-group">
              <span className="modal-bhk-pill">{bedroom || 1} BHK</span>
              {property_type && (
                <span className="modal-type-pill">{capitalize(property_type)}</span>
              )}
              {is_verified && (
                <span className="modal-verified-pill">✓ Ivy Verified</span>
              )}
            </div>
            <h2 className="modal-property-title">{apartment_name || "Property Details"}</h2>
            <p className="modal-property-locality">
              📍 {capitalize(locality || "Chennai")}, Chennai
            </p>
          </div>

          <button
            type="button"
            className="modal-x-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="dark-modal-body">
          {/* Price & Primary Action Strip */}
          <div className="modal-price-strip">
            <div>
              <span className="strip-label">Estimated Value</span>
              <div className="strip-price">{formatPrice(price)}</div>
            </div>
            <div className="strip-actions">
              <button
                type="button"
                className={`btn-shortlist-action ${isFavorite ? "active" : ""}`}
                onClick={() => onToggleFavorite(listing_id)}
              >
                {isFavorite ? "♥ Shortlisted" : "♡ Shortlist"}
              </button>
              {listing_url && (
                <a
                  href={listing_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-portal-action"
                >
                  View on {website ? capitalize(website) : "Portal"} ↗
                </a>
              )}
            </div>
          </div>

          {/* Specifications Grid */}
          <section className="modal-content-section">
            <h3 className="modal-section-heading">Property Specifications</h3>
            <div className="dark-specs-grid">
              <div className="dark-spec-box">
                <span className="spec-box-label">Bedrooms</span>
                <span className="spec-box-value">🛏 {bedroom} BHK</span>
              </div>
              <div className="dark-spec-box">
                <span className="spec-box-label">Bathrooms</span>
                <span className="spec-box-value">🚿 {bathroom != null ? `${bathroom} Bath` : "-"}</span>
              </div>
              <div className="dark-spec-box">
                <span className="spec-box-label">Balconies</span>
                <span className="spec-box-value">🪴 {balcony != null ? `${balcony} Balcony` : "-"}</span>
              </div>
              <div className="dark-spec-box">
                <span className="spec-box-label">Carpet Area</span>
                <span className="spec-box-value">📐 {formatArea(carpet_area)}</span>
              </div>
              <div className="dark-spec-box">
                <span className="spec-box-label">Super Built-up Area</span>
                <span className="spec-box-value">📏 {formatArea(super_built_up_area)}</span>
              </div>
              <div className="dark-spec-box">
                <span className="spec-box-label">Floor</span>
                <span className="spec-box-value">
                  🏢 {floor != null ? `Floor ${floor}` : "N/A"}
                  {total_floors ? ` of ${total_floors}` : ""}
                </span>
              </div>
              <div className="dark-spec-box">
                <span className="spec-box-label">Facing Direction</span>
                <span className="spec-box-value">🧭 {capitalize(facing_direction || "N/A")}</span>
              </div>
              <div className="dark-spec-box">
                <span className="spec-box-label">Covered Parking</span>
                <span className="spec-box-value">🚗 {covered_parking > 0 ? `${covered_parking} Slot(s)` : "None"}</span>
              </div>
              <div className="dark-spec-box">
                <span className="spec-box-label">Furnishing Status</span>
                <span className="spec-box-value">🛋 {capitalize(furnishing || "Unfurnished")}</span>
              </div>
            </div>
          </section>

          {/* Society & Project Information */}
          {(project_name || developer_name || amenities?.length > 0) && (
            <section className="modal-content-section">
              <h3 className="modal-section-heading">Project & Society Overview</h3>
              <div className="society-detail-panel">
                {developer_name && (
                  <p className="society-info-line">
                    <span className="society-label">Developer:</span> {developer_name}
                  </p>
                )}
                {project_status && (
                  <p className="society-info-line">
                    <span className="society-label">Project Status:</span> {capitalize(project_status)}
                  </p>
                )}
                {rera_number && (
                  <p className="society-info-line">
                    <span className="society-label">RERA Number:</span> {rera_number}
                  </p>
                )}

                {amenities && amenities.length > 0 && (
                  <div className="society-amenities-group">
                    <span className="society-label">Society Amenities:</span>
                    <div className="society-amenity-tags">
                      {amenities.map((amenity, idx) => (
                        <span key={idx} className="society-amenity-pill">
                          ✓ {capitalize(amenity)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Description */}
          {description && (
            <section className="modal-content-section">
              <h3 className="modal-section-heading">About This Residence</h3>
              <p className="modal-description-paragraph">{description}</p>
            </section>
          )}

          {/* Meta & Poster Info */}
          <section className="modal-content-section">
            <h3 className="modal-section-heading">Listing Details</h3>
            <div className="listing-meta-row">
              <div className="meta-pair">
                <span className="meta-dim">Listed by:</span>
                <span className="meta-bright">
                  {posted_by_name || (posted_by ? capitalize(posted_by) : "Verified Partner")}
                  {posted_by ? ` (${capitalize(posted_by)})` : ""}
                </span>
              </div>

              <div className="meta-pair">
                <span className="meta-dim">Listed on:</span>
                <span className="meta-bright">{formatDate(posted_at)}</span>
              </div>

              <div className="meta-pair">
                <span className="meta-dim">Property ID:</span>
                <span className="meta-bright font-mono">{listing_id}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="dark-modal-footer">
          <button type="button" className="btn-modal-dismiss" onClick={onClose}>
            Close
          </button>
          {listing_url && (
            <a
              href={listing_url}
              target="_blank"
              rel="noreferrer"
              className="btn-portal-action"
            >
              Open Original Portal
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
