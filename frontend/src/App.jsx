import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/listings";

function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [bhk, setBhk] = useState("all");
  const [locality, setLocality] = useState("all");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const limit = 20;

  useEffect(() => {
    fetchListings();
  }, [page]);

  async function fetchListings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();

      setListings(data.results || []);
      setHasMore(data.has_more || false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const localities = [
    ...new Set(
      listings
        .map((listing) => listing.locality)
        .filter(Boolean)
    ),
  ];

  const filteredListings = listings.filter((listing) => {
    const text = `${listing.apartment_name || ""} ${
      listing.locality || ""
    }`.toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());

    const matchesBhk =
      bhk === "all" || String(listing.bedroom) === bhk;

    const matchesLocality =
      locality === "all" || listing.locality === locality;

    return matchesSearch && matchesBhk && matchesLocality;
  });

  function formatPrice(price) {
    if (!price) return "Price unavailable";
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  }

  if (loading) {
    return (
      <div className="center-message">
        <h2>Loading properties...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-message">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchListings}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Ivy Homes</h1>
          <p>Find your perfect home</p>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h2>Find a home you'll love</h2>
          <p>
            Browse verified property listings across popular localities.
          </p>
        </section>

        <section className="filters">
          <input
            type="text"
            placeholder="Search apartment or locality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={bhk}
            onChange={(e) => setBhk(e.target.value)}
          >
            <option value="all">All BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4 BHK</option>
          </select>

          <select
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
          >
            <option value="all">All Localities</option>

            {localities.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <button
            className="clear-button"
            onClick={() => {
              setSearch("");
              setBhk("all");
              setLocality("all");
            }}
          >
            Clear
          </button>
        </section>

        <div className="results-header">
          <h2>Available Properties</h2>
          <span>{filteredListings.length} properties</span>
        </div>

        {filteredListings.length === 0 ? (
          <div className="empty">
            <h3>No properties found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          <section className="listing-grid">
            {filteredListings.map((listing) => (
              <article
                className="listing-card"
                key={listing.listing_id}
              >
                <div className="card-top">
                  <span className="badge">
                    {listing.bedroom} BHK
                  </span>

                  {listing.is_verified && (
                    <span className="verified">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <h3>{listing.apartment_name}</h3>

                <p className="locality">
                  📍 {listing.locality}
                </p>

                <div className="price">
                  {formatPrice(listing.price)}
                </div>

                <div className="details">
                  <span>
                    🛏 {listing.bedroom} BHK
                  </span>

                  <span>
                    🛁 {listing.bathroom || "-"} Bath
                  </span>

                  <span>
                    📐 {listing.carpet_area || "-"} sq.ft
                  </span>
                </div>

                <div className="extra-details">
                  <p>
                    <strong>Furnishing:</strong>{" "}
                    {listing.furnishing || "N/A"}
                  </p>

                  <p>
                    <strong>Parking:</strong>{" "}
                    {listing.covered_parking || 0}
                  </p>

                  <p>
                    <strong>Floor:</strong>{" "}
                    {listing.floor || "N/A"}
                  </p>
                </div>

                <div className="card-footer">
                  <span>
                    Posted by {listing.posted_by_name || "Unknown"}
                  </span>

                  {listing.listing_url && (
                    <a
                      href={listing.listing_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>

          <span>Page {page}</span>

          <button
            disabled={!hasMore}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;