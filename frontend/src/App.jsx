import React, { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { useRouter } from "./hooks/useRouter";
import { api } from "./services/api";

import LoginPage from "./components/LoginPage";
import Navbar from "./components/Navbar";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import RentalsPage from "./pages/RentalsPage";
import ProjectsPage from "./pages/ProjectsPage";
import SavedPage from "./pages/SavedPage";
import InsightsPage from "./pages/InsightsPage";

import "./App.css";

const INITIAL_FILTERS = {
  search: "",
  bedroom: "all",
  locality: "all",
  pricePreset: "all",
  minPrice: undefined,
  maxPrice: undefined,
  propertyType: "all",
  furnishing: "all",
  verified: "all",
  sort: "default"
};

function PropertyMarketplace() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { route, params, navigate } = useRouter();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [metadata, setMetadata] = useState(null);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Favorites state synchronized per-user with backend /api/saved
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("ivy_shortlist");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Sync server saved items on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    let isCancelled = false;
    api
      .getSavedListings()
      .then((data) => {
        if (!isCancelled && data?.results && Array.isArray(data.results)) {
          const serverSet = new Set(data.results.map((l) => l.listing_id));
          setFavorites(serverSet);
          localStorage.setItem("ivy_shortlist", JSON.stringify(Array.from(serverSet)));
        }
      })
      .catch((err) => {
        console.warn("Could not load user saved listings from backend:", err.message);
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  // Load filter metadata once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let isCancelled = false;
    api
      .getMetadata()
      .then((data) => {
        if (!isCancelled) {
          setMetadata(data);
        }
      })
      .catch((err) => {
        if (err.status === 401) {
          logout();
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, logout]);

  // Toggle favorite with optimistic update & real backend API sync
  const toggleFavorite = async (id) => {
    if (!id) return;
    const exists = favorites.has(id);

    setFavorites((prev) => {
      const next = new Set(prev);
      if (exists) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem("ivy_shortlist", JSON.stringify(Array.from(next)));
      } catch {
        // Ignored
      }
      return next;
    });

    try {
      if (exists) {
        await api.removeSavedListing(id);
      } else {
        await api.saveListing(id);
      }
    } catch (err) {
      console.warn("Could not sync favorite to server:", err.message);
    }
  };

  // Main data fetching effect for browse listings
  useEffect(() => {
    if (!isAuthenticated || route !== "listings") return;

    let isCancelled = false;

    async function loadListings() {
      try {
        setLoading(true);
        setError("");

        const data = await api.getListings({
          page,
          limit: 20,
          search: filters.search,
          bedroom: filters.bedroom,
          locality: filters.locality,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          propertyType: filters.propertyType,
          furnishing: filters.furnishing,
          verified: filters.verified,
          sort: filters.sort
        });

        if (!isCancelled) {
          setListings(data.results || []);
          setTotalPages(data.totalPages || 1);
          setTotalResults(data.total || 0);
        }
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }
        if (!isCancelled) {
          setError(err.message || "Failed to load listings");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    const delay = filters.search ? 300 : 0;
    const timer = setTimeout(() => {
      loadListings();
    }, delay);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [page, filters, isAuthenticated, route, logout]);

  const handleFilterChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handleHeroSearch = () => {
    const resultsElem = document.getElementById("results-section");
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Guard: Authenticating initial session
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner" />
        <span className="auth-loading-text">Verifying secure session...</span>
      </div>
    );
  }

  // Guard: Unauthenticated state
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-root-dark">
      {/* Sticky Dark Navbar */}
      <Navbar
        currentRoute={route}
        onNavigate={navigate}
        favoriteCount={favorites.size}
        totalProperties={metadata?.totalProperties || totalResults}
        user={user}
        onLogout={logout}
      />

      {/* Main Routed Content Area */}
      {route === "listings" && (
        <ListingsPage
          listings={listings}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          totalResults={totalResults}
          metadata={metadata}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 380, behavior: "smooth" });
          }}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectProperty={(p) => navigate(`/listings/${p.listing_id}`)}
          onHeroSearch={handleHeroSearch}
        />
      )}

      {route === "listing-detail" && (
        <ListingDetailPage
          id={params.id}
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {route === "rentals" && <RentalsPage onNavigate={navigate} />}

      {route === "projects" && <ProjectsPage onNavigate={navigate} />}

      {route === "saved" && (
        <SavedPage
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {route === "insights" && <InsightsPage onNavigate={navigate} />}

      {/* Dark Footer */}
      <footer className="dark-footer">
        <div className="dark-footer-inner">
          <div className="footer-brand">
            <span className="footer-title">Ivy Homes</span>
            <span className="footer-desc">Direct verified property listings across Chennai</span>
          </div>
          <div className="footer-copyright">
            © 2026 Ivy Homes Technologies Pvt. Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PropertyMarketplace />
    </AuthProvider>
  );
}