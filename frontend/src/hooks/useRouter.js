import { useState, useEffect, useCallback } from "react";

export function useRouter() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || "/");

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((to) => {
    if (to === window.location.pathname) return;
    window.history.pushState({}, "", to);
    setCurrentPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Parse path into route and params
  const cleanPath = currentPath.replace(/\/$/, "") || "/";

  let route = "listings";
  const params = {};

  if (cleanPath === "/" || cleanPath === "/listings") {
    route = "listings";
  } else if (cleanPath.startsWith("/listings/")) {
    route = "listing-detail";
    params.id = decodeURIComponent(cleanPath.replace("/listings/", ""));
  } else if (cleanPath === "/rentals" || cleanPath.startsWith("/rentals/")) {
    route = "rentals";
    if (cleanPath.startsWith("/rentals/")) {
      params.id = decodeURIComponent(cleanPath.replace("/rentals/", ""));
    }
  } else if (cleanPath === "/projects" || cleanPath.startsWith("/projects/")) {
    route = "projects";
    if (cleanPath.startsWith("/projects/")) {
      params.id = decodeURIComponent(cleanPath.replace("/projects/", ""));
    }
  } else if (cleanPath === "/saved" || cleanPath === "/favourites" || cleanPath === "/favorites") {
    route = "saved";
  } else if (cleanPath === "/insights" || cleanPath === "/analytics") {
    route = "insights";
  }

  return {
    path: currentPath,
    route,
    params,
    navigate
  };
}
