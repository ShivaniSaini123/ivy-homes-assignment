/**
 * Format numerical price to Indian currency format (Lakhs and Crores)
 * - Below ₹1 crore (10,000,000) -> ₹XX.XX L
 * - ₹1 crore or above -> ₹X.XX Cr
 */
export function formatPrice(price) {
  if (price == null || isNaN(price) || price <= 0) {
    return "Price on Request";
  }

  const num = Number(price);

  if (num >= 10000000) {
    const inCrore = num / 10000000;
    const rounded = Math.round((inCrore + Number.EPSILON) * 100) / 100;
    const formatted = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
    return `₹${formatted} Cr`;
  }

  const inLakh = num / 100000;
  const rounded = Math.round((inLakh + Number.EPSILON) * 100) / 100;
  const formatted = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
  return `₹${formatted} L`;
}

/**
 * Format area in square feet with locale grouping
 */
export function formatArea(area) {
  if (area == null || isNaN(area) || area <= 0) {
    return "N/A";
  }
  return `${Number(area).toLocaleString("en-IN")} sq.ft`;
}

/**
 * Format ISO date string into readable date (e.g., 24 Jun 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return "Recently";
  }
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
