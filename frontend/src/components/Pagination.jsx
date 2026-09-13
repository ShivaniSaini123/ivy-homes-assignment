import React from "react";

export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  loading = false
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="dark-pagination-nav" aria-label="Pagination Navigation">
      <div className="pagination-bar">
        {/* Previous Button */}
        <button
          type="button"
          className="dark-page-nav-btn prev-btn"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ← Previous
        </button>

        {/* Numbered Pills */}
        <div className="dark-page-pills">
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="dark-page-ellipsis">
                  •••
                </span>
              );
            }

            const isCurrent = p === page;

            return (
              <button
                key={p}
                type="button"
                className={`dark-page-pill ${isCurrent ? "current-pill" : ""}`}
                disabled={loading || isCurrent}
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={isCurrent ? "page" : undefined}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          className="dark-page-nav-btn next-btn"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>

      <div className="dark-page-meta">
        Page <span className="meta-number">{page}</span> of <span className="meta-number">{totalPages}</span>
      </div>
    </nav>
  );
}
