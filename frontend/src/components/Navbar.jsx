import React, { useState } from "react";

export default function Navbar({
  currentRoute = "listings",
  onNavigate,
  favoriteCount = 0,
  totalProperties = 0,
  user = null,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "listings", path: "/listings", label: "Buy" },
    { id: "rentals", path: "/rentals", label: "Rent" },
    { id: "projects", path: "/projects", label: "Projects" },
    { id: "saved", path: "/saved", label: "Saved", badge: favoriteCount },
    { id: "insights", path: "/insights", label: "Insights" }
  ];

  const handleNavClick = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo & Name */}
        <div className="brand" onClick={() => handleNavClick("/listings")}>
          <div className="brand-logo-dark">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title-dark">Ivy Homes</span>
            <span className="brand-tagline-dark">Verified Real Estate</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-link-btn ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick(item.path)}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`nav-badge ${isActive ? "active-badge" : ""}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Side Actions: Catalog Indicator + Profile Avatar */}
        <div className="navbar-right">
          {totalProperties > 0 && (
            <div className="catalog-indicator">
              <span className="pulse-dot" />
              <span>{totalProperties.toLocaleString()} Live Homes</span>
            </div>
          )}

          {/* User Profile Pill & Logout */}
          <div className="user-profile-group">
            <div className="user-profile-pill" title={user?.email ? `Signed in as ${user.email}` : "Verified Account"}>
              <div className="avatar-circle">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="user-name-text">
                {user?.email ? user.email.split("@")[0] : "Account"}
              </span>
            </div>

            {onLogout && (
              <button
                type="button"
                className="btn-navbar-logout"
                onClick={onLogout}
                title="Sign out of account"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <span className={`hamburger-bar ${mobileMenuOpen ? "open-1" : ""}`} />
            <span className={`hamburger-bar ${mobileMenuOpen ? "open-2" : ""}`} />
            <span className={`hamburger-bar ${mobileMenuOpen ? "open-3" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-link ${currentRoute === item.id ? "active" : ""}`}
              onClick={() => handleNavClick(item.path)}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          ))}

          {user && (
            <div className="mobile-drawer-user">
              <span className="mobile-user-email">{user.email}</span>
              {onLogout && (
                <button
                  type="button"
                  className="mobile-logout-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
