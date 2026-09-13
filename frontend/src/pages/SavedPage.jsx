import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import PropertyCard from "../components/PropertyCard";

export default function SavedPage({
  onNavigate,
  favorites = new Set(),
  onToggleFavorite
}) {
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadSaved() {
      try {
        setLoading(true);
        setError("");

        const data = await api.getSavedListings();
        if (!isCancelled) {
          setSavedListings(data.results || []);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Could not retrieve saved listings");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadSaved();

    return () => {
      isCancelled = true;
    };
  }, [favorites]);

  const handleToggle = async (id) => {
    await onToggleFavorite(id);
    setSavedListings((prev) => prev.filter((l) => l.listing_id !== id));
  };

  return (
    <div className="saved-page-container">
      {/* Page Header */}
      <div className="section-hero-header">
        <div className="saved-title-row">
          <h1 className="page-title">Saved Residences</h1>
          <span className="saved-count-pill">{savedListings.length} Saved</span>
        </div>
        <p className="page-desc">
          Your bookmarked properties are stored per-user and synchronized with the Ivy Homes server.
        </p>
      </div>

      {loading ? (
        <div className="grid-loading-spinner">
          <div className="auth-spinner" />
          <span>Synchronizing saved listings...</span>
        </div>
      ) : error ? (
        <div className="detail-error-card">
          <h2>Failed to Load Saved Properties</h2>
          <p>{error}</p>
        </div>
      ) : savedListings.length === 0 ? (
        <div className="empty-saved-card">
          <div className="empty-heart-icon">🤍</div>
          <h2>Your Shortlist is Empty</h2>
          <p>You have not saved any verified properties yet. Click the heart icon on any card to bookmark it.</p>
          <button
            type="button"
            className="btn-back-home"
            onClick={() => onNavigate("/listings")}
          >
            Browse Verified Homes
          </button>
        </div>
      ) : (
        <div className="dark-property-grid">
          {savedListings.map((listing) => (
            <PropertyCard
              key={listing.listing_id}
              listing={listing}
              isFavorite={true}
              onToggleFavorite={handleToggle}
              onSelectProperty={(prop) => onNavigate(`/listings/${prop.listing_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
