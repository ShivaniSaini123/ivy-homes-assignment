const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (res.status === 401) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const api = {
  // Listings
  getListings: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "all") {
        query.set(k, String(v));
      }
    });
    return request(`/listings?${query.toString()}`);
  },
  getListingById: (id) => request(`/listings/${encodeURIComponent(id)}`),
  getSimilarListings: (id, limit = 4) =>
    request(`/listings/${encodeURIComponent(id)}/similar?limit=${limit}`),
  getMetadata: () => request("/meta"),

  // Rentals
  getRentals: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "all") {
        query.set(k, String(v));
      }
    });
    return request(`/rentals?${query.toString()}`);
  },
  getRentalById: (id) => request(`/rentals/${encodeURIComponent(id)}`),

  // Projects
  getProjects: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "all") {
        query.set(k, String(v));
      }
    });
    return request(`/projects?${query.toString()}`);
  },
  getProjectById: (id) => request(`/projects/${encodeURIComponent(id)}`),

  // Saved / Favourites (Real API sync per-user)
  getSavedListings: () => request("/saved"),
  saveListing: (listingId) =>
    request("/saved", {
      method: "POST",
      body: JSON.stringify({ listing_id: listingId })
    }),
  removeSavedListing: (listingId) =>
    request(`/saved/${encodeURIComponent(listingId)}`, {
      method: "DELETE"
    }),

  // Analytics & Assignment Insights
  getAnalyticsSummary: () => request("/analytics/summary"),
  getInsights: () => request("/insights")
};
