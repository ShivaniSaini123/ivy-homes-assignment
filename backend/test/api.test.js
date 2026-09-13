const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");
const app = require("../src/server");

let server;
let baseUrl;
let authCookie;
let authToken;

before((t, done) => {
  server = app.listen(0, () => {
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    done();
  });
});

after((t, done) => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
});

describe("Ivy Homes Authentication & API Tests", () => {
  it("GET /health returns 200 and status: ok without authentication", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, "ok");
  });

  it("GET /api/listings returns 401 when not authenticated", async () => {
    const res = await fetch(`${baseUrl}/api/listings`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.code, "UNAUTHORIZED");
  });

  it("POST /api/auth/login fails with invalid credentials", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid@example.com", password: "wrongpassword" })
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.ok(body.error);
  });

  it("POST /api/auth/login succeeds with valid credentials and sets session cookie", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.IVY_EMAIL || "demo1@ivy.homes",
        password: process.env.IVY_PASSWORD || "305dc2b341"
      })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.user);
    assert.ok(body.token);

    authToken = body.token;

    // Capture set-cookie header
    const rawCookie = res.headers.get("set-cookie");
    if (rawCookie) {
      authCookie = rawCookie.split(";")[0];
    } else {
      authCookie = `ivy_session=${authToken}`;
    }
  });

  it("GET /api/auth/me returns current user for authenticated session", async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.authenticated, true);
    assert.ok(body.user.email);
  });

  it("GET /api/meta returns filter metadata when authenticated", async () => {
    const res = await fetch(`${baseUrl}/api/meta`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.ok(Array.isArray(body.localities), "localities should be an array");
    assert.ok(body.localities.length > 0, "should have localities");
    assert.ok(Array.isArray(body.bedrooms), "bedrooms should be an array");
    assert.ok(body.priceRange, "priceRange should exist");
  });

  it("GET /api/listings returns paginated results when authenticated", async () => {
    const res = await fetch(`${baseUrl}/api/listings?page=1&limit=10`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.ok(Array.isArray(body.results));
    assert.strictEqual(body.results.length, 10);
    assert.strictEqual(body.page, 1);
    assert.ok(body.total > 0);
  });

  it("GET /api/listings supports search filter across catalog", async () => {
    const res = await fetch(`${baseUrl}/api/listings?search=Puravankara&limit=5`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.ok(body.total > 0);
    body.results.forEach((item) => {
      const text = `${item.apartment_name} ${item.developer_name || ""} ${item.locality} ${item.description || ""}`.toLowerCase();
      assert.ok(text.includes("puravankara"));
    });
  });

  it("GET /api/listings filters by bedroom and locality", async () => {
    const res = await fetch(`${baseUrl}/api/listings?bedroom=2&locality=adyar&limit=5`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.ok(body.total > 0);
    body.results.forEach((item) => {
      assert.strictEqual(Number(item.bedroom), 2);
      assert.strictEqual(item.locality.toLowerCase(), "adyar");
    });
  });

  it("GET /api/listings/:id returns listing details for valid ID", async () => {
    const listRes = await fetch(`${baseUrl}/api/listings?limit=1`, {
      headers: { Cookie: authCookie }
    });
    const listBody = await listRes.json();
    const id = listBody.results[0].listing_id;

    const res = await fetch(`${baseUrl}/api/listings/${id}`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.listing_id, id);
  });

  it("GET /api/listings/:id/similar returns similar properties", async () => {
    const listRes = await fetch(`${baseUrl}/api/listings?limit=1`, {
      headers: { Cookie: authCookie }
    });
    const listBody = await listRes.json();
    const id = listBody.results[0].listing_id;

    const res = await fetch(`${baseUrl}/api/listings/${id}/similar?limit=3`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.results));
    assert.ok(body.results.length > 0);
  });

  it("GET /api/listings/:id returns 404 for nonexistent ID", async () => {
    const res = await fetch(`${baseUrl}/api/listings/non-existent-xyz`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 404);
  });

  it("GET /api/rentals returns paginated rental listings", async () => {
    const res = await fetch(`${baseUrl}/api/rentals?page=1&limit=5`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.results));
    assert.strictEqual(body.results.length, 5);
    assert.ok(body.total > 0);
  });

  it("GET /api/projects returns paginated projects catalog", async () => {
    const res = await fetch(`${baseUrl}/api/projects?page=1&limit=5`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.results));
    assert.strictEqual(body.results.length, 5);
    assert.ok(body.total > 0);
  });

  it("POST /api/saved and GET /api/saved manages user saved listings", async () => {
    // 1. Add saved
    const addRes = await fetch(`${baseUrl}/api/saved`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: authCookie },
      body: JSON.stringify({ listing_id: "MAG-4001518" })
    });
    assert.strictEqual(addRes.status, 201);
    const addBody = await addRes.json();
    assert.strictEqual(addBody.ok, true);

    // 2. Get saved
    const getRes = await fetch(`${baseUrl}/api/saved`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(getRes.status, 200);
    const getBody = await getRes.json();
    assert.ok(Array.isArray(getBody.results));
    assert.ok(getBody.results.some((l) => l.listing_id === "MAG-4001518"));

    // 3. Remove saved
    const delRes = await fetch(`${baseUrl}/api/saved/MAG-4001518`, {
      method: "DELETE",
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(delRes.status, 200);
    const delBody = await delRes.json();
    assert.strictEqual(delBody.ok, true);
  });

  it("GET /api/analytics/summary returns accurate statistical breakdown", async () => {
    const res = await fetch(`${baseUrl}/api/analytics/summary`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.total_listings, 4100);
    assert.strictEqual(body.active_listings, 3233);
    assert.ok(body.median_price > 0);
    assert.ok(body.median_price_per_sqft > 0);
    assert.ok(Array.isArray(body.listings_by_locality));
    assert.ok(Array.isArray(body.listings_by_bhk));
    assert.ok(Array.isArray(body.key_discoveries));
  });

  it("GET /api/insights returns all 10 assignment questions, findings, and verified hypotheses", async () => {
    const res = await fetch(`${baseUrl}/api/insights`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.reference, "2026-09-10T00:00:00+05:30");
    assert.strictEqual(body.assigned_locality, "anna nagar");
    assert.ok(body.answers);
    assert.strictEqual(body.answers.total_listing_records, 4100);
    assert.strictEqual(body.answers.unique_properties, 3222);
    assert.strictEqual(body.answers.active_listings, 3233);
    assert.strictEqual(body.answers.corrupt_listing_ids.length, 54);
    assert.strictEqual(body.answers.total_monthly_rent, 5330500);
    assert.strictEqual(body.answers.avg_price_per_sqft_2bhk, 16167.1);
    assert.strictEqual(body.answers.costliest_project.project_id, "P40224");
    assert.strictEqual(body.answers.costliest_project.price_max_inr, 37800000);
    assert.strictEqual(body.answers.listings_last_7_days, 122);
    assert.strictEqual(body.answers.fake_listing_ids.length, 18);
    assert.strictEqual(body.answers.projects_with_wrong_listing_count, 336);

    assert.ok(Array.isArray(body.questions));
    assert.strictEqual(body.questions.length, 10);
    assert.ok(Array.isArray(body.findings));
    assert.ok(body.findings.length > 0);
    assert.ok(Array.isArray(body.verified_correct));
    assert.ok(body.verified_correct.length > 0);
  });

  it("POST /api/auth/logout terminates session", async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(res.status, 200);

    // Subsequent call with old session should fail
    const checkRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: authCookie }
    });
    assert.strictEqual(checkRes.status, 401);
  });
});
