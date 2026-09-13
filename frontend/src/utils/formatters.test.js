import { describe, it } from "node:test";
import assert from "node:assert";
import { formatPrice, formatArea, formatDate, capitalize } from "./formatters.js";

describe("Frontend Formatters Test Suite", () => {
  describe("formatPrice()", () => {
    it("formats price below 1 Crore in Lakhs (L)", () => {
      assert.strictEqual(formatPrice(5000000), "₹50 L");
      assert.strictEqual(formatPrice(6610000), "₹66.10 L");
      assert.strictEqual(formatPrice(8500000), "₹85 L");
    });

    it("formats price at or above 1 Crore in Crores (Cr)", () => {
      assert.strictEqual(formatPrice(10000000), "₹1 Cr");
      assert.strictEqual(formatPrice(12950000), "₹1.30 Cr");
      assert.strictEqual(formatPrice(25000000), "₹2.50 Cr");
    });

    it("handles edge cases gracefully", () => {
      assert.strictEqual(formatPrice(0), "Price on Request");
      assert.strictEqual(formatPrice(-500), "Price on Request");
      assert.strictEqual(formatPrice(null), "Price on Request");
      assert.strictEqual(formatPrice(undefined), "Price on Request");
      assert.strictEqual(formatPrice("invalid"), "Price on Request");
    });
  });

  describe("formatArea()", () => {
    it("formats area in square feet with comma grouping", () => {
      assert.strictEqual(formatArea(850), "850 sq.ft");
      assert.strictEqual(formatArea(1250), "1,250 sq.ft");
      assert.strictEqual(formatArea(3500), "3,500 sq.ft");
    });

    it("handles missing or invalid area", () => {
      assert.strictEqual(formatArea(0), "N/A");
      assert.strictEqual(formatArea(null), "N/A");
      assert.strictEqual(formatArea(undefined), "N/A");
    });
  });

  describe("formatDate()", () => {
    it("formats ISO date string into readable text", () => {
      const formatted = formatDate("2026-06-24T16:50:00Z");
      assert.ok(formatted.includes("2026"), "should contain year 2026");
      assert.ok(formatted.includes("Jun") || formatted.includes("06"), "should contain month");
    });

    it("falls back to 'Recently' for empty or invalid dates", () => {
      assert.strictEqual(formatDate(""), "Recently");
      assert.strictEqual(formatDate(null), "Recently");
      assert.strictEqual(formatDate("invalid-date-string"), "Recently");
    });
  });

  describe("capitalize()", () => {
    it("capitalizes words and handles hyphens", () => {
      assert.strictEqual(capitalize("adyar"), "Adyar");
      assert.strictEqual(capitalize("anna nagar"), "Anna Nagar");
      assert.strictEqual(capitalize("semi-furnished"), "Semi Furnished");
      assert.strictEqual(capitalize("builder floor"), "Builder Floor");
    });

    it("handles empty or non-string inputs", () => {
      assert.strictEqual(capitalize(""), "");
      assert.strictEqual(capitalize(null), "");
    });
  });

  describe("Shortlist / Favorites logic", () => {
    it("correctly toggles favorite IDs in a set", () => {
      const favorites = new Set();
      const id1 = "MAG-4001518";
      const id2 = "100-4000035";

      // Add id1
      favorites.add(id1);
      assert.ok(favorites.has(id1));
      assert.strictEqual(favorites.size, 1);

      // Add id2
      favorites.add(id2);
      assert.strictEqual(favorites.size, 2);

      // Remove id1
      favorites.delete(id1);
      assert.ok(!favorites.has(id1));
      assert.strictEqual(favorites.size, 1);

      // Serialize and deserialize from JSON (localStorage behavior)
      const serialized = JSON.stringify(Array.from(favorites));
      const restored = new Set(JSON.parse(serialized));
      assert.ok(restored.has(id2));
      assert.strictEqual(restored.size, 1);
    });
  });
});
