import React from "react";

export default function SkeletonCard() {
  return (
    <div className="property-card dark-skeleton-card" aria-hidden="true">
      <div className="dark-skeleton-header dark-shimmer" />
      <div className="card-body">
        <div className="dark-skeleton-line dark-shimmer sk-title" />
        <div className="dark-skeleton-line dark-shimmer sk-locality" />
        <div className="dark-skeleton-line dark-shimmer sk-price" />

        <div className="dark-skeleton-specs-row">
          <div className="dark-skeleton-box dark-shimmer" />
          <div className="dark-skeleton-box dark-shimmer" />
          <div className="dark-skeleton-box dark-shimmer" />
        </div>

        <div className="dark-skeleton-line dark-shimmer sk-sub" />

        <div className="dark-skeleton-footer">
          <div className="dark-skeleton-line dark-shimmer sk-author" />
          <div className="dark-skeleton-box dark-shimmer sk-btn" />
        </div>
      </div>
    </div>
  );
}
