import React, { useState } from "react";
import { useAuth } from "../context/useAuth";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleDemoFill = () => {
    setEmail("demo1@ivy.homes");
    setPassword("305dc2b341");
    setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }

    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    try {
      setSubmitting(true);
      await login(email.trim(), password);
    } catch (err) {
      setLocalError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-ambient-glow" />

      <div className="login-container">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-brand-logo">
            <svg
              width="26"
              height="26"
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
          <h1 className="login-brand-title">Ivy Homes</h1>
          <p className="login-brand-subtitle">
            Sign in to explore verified residences, pricing insights, and society amenities.
          </p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <h2 className="login-card-title">Welcome Back</h2>
          <p className="login-card-desc">Enter your credentials to access your verified account.</p>

          {/* Error Message Alert */}
          {localError && (
            <div className="login-error-alert" role="alert">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-with-icon">
                <svg
                  className="field-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" borderRadius="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  className="dark-form-input"
                  placeholder="name@ivy.homes"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label htmlFor="login-password">Password</label>
              <div className="input-with-icon">
                <svg
                  className="field-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="dark-form-input password-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={submitting}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-login-submit"
              disabled={submitting}
            >
              {submitting ? (
                <span className="btn-loading-content">
                  <span className="mini-spinner" /> Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Quick Demo Helper Shortcut */}
          <div className="demo-credentials-shortcut">
            <span className="demo-hint-label">Testing or reviewing the assignment?</span>
            <button
              type="button"
              className="btn-demo-fill"
              onClick={handleDemoFill}
            >
              ⚡ Fill Demo Account (demo1@ivy.homes)
            </button>
          </div>
        </div>

        <div className="login-security-notice">
          <span>🔒 Protected by secure HTTP-only session cookies. All Ivy API secrets stay on the server.</span>
        </div>
      </div>
    </div>
  );
}
