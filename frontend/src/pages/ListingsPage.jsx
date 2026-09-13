import React from "react";
import Hero from "../components/Hero";
import FilterBar from "../components/FilterBar";
import PropertyGrid from "../components/PropertyGrid";
import Pagination from "../components/Pagination";

export default function ListingsPage({
  listings,
  loading,
  error,
  page,
  totalPages,
  totalResults,
  metadata,
  filters,
  onFilterChange,
  onResetFilters,
  onPageChange,
  favorites,
  onToggleFavorite,
  onSelectProperty,
  onHeroSearch
}) {
  return (
    <>
      {/* Hero Section */}
      <Hero
        searchValue={filters.search}
        localityValue={filters.locality}
        localities={metadata?.localities || []}
        onSearchChange={(search) => onFilterChange({ search })}
        onLocalityChange={(locality) => onFilterChange({ locality })}
        onSearchSubmit={onHeroSearch}
      />

      {/* Main Content Area */}
      <main className="main-content-dark" id="results-section">
        {/* Compact Dark Filter Panel */}
        <FilterBar
          filters={filters}
          metadata={metadata}
          onChange={onFilterChange}
          onReset={onResetFilters}
          totalResults={totalResults}
          loading={loading}
          showFavoritesOnly={false}
        />

        {/* Property Grid */}
        <PropertyGrid
          listings={listings}
          loading={loading}
          error={error}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onSelectProperty={onSelectProperty}
          onResetFilters={onResetFilters}
          onRetry={() => onPageChange(page)}
          showFavoritesOnly={false}
        />

        {/* Dark Elegant Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          loading={loading}
        />
      </main>
    </>
  );
}
