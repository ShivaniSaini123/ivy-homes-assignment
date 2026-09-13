import React from "react";
import PropertyCard from "./PropertyCard";
import SkeletonCard from "./SkeletonCard";

export default function PropertyGrid({
  listings = [],
  loading = false,
  error = "",
  favorites = new Set(),
  onToggleFavorite,
  onSelectProperty,
  onResetFilters,
  onRetry,
  showFavoritesOnly = false
}) {
  if (error) {
    return (
      <div className="dark-state-card error-card">
        <div className="state-icon-circle">⚠️</div>
        <h3>Unable to load properties</h3>
        <p>{error}</p>
        <button type="button" className="btn-dark-primary" onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  }

  if (loading && listings.length === 0) {
    return (
      <section className="dark-property-grid" aria-label="Loading properties">
        {Array.from({ length: 8 }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </section>
    );
  }

  if (!loading && listings.length === 0) {
    return (
      <div className="dark-state-card empty-card">
        <div className="state-icon-circle">🏡</div>
        {showFavoritesOnly ? (
          <>
            <h3>No shortlisted homes</h3>
            <p>Click the heart icon on any property card to save it here for quick access.</p>
          </>
        ) : (
          <>
            <h3>No homes found</h3>
            <p>Try changing your filters or search.</p>
            <button type="button" className="btn-dark-primary" onClick={onResetFilters}>
              Clear All Filters
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <section className={`dark-property-grid ${loading ? "grid-updating" : ""}`}>
      {listings.map((listing) => (
        <PropertyCard
          key={listing.listing_id}
          listing={listing}
          isFavorite={favorites.has(listing.listing_id)}
          onToggleFavorite={onToggleFavorite}
          onSelect={onSelectProperty}
        />
      ))}
    </section>
  );
}
