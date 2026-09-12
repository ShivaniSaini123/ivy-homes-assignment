require("dotenv").config();

const API_BASE_URL = process.env.IVY_BASE_URL;
const API_KEY = process.env.IVY_API_KEY;

async function login() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY
    },
    body: JSON.stringify({
      email: "demo1@ivy.homes",
      password: "305dc2b341"
    })
  });

  const data = await response.json();

  console.log("Login status:", response.status);
  console.log(JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}

async function testListings(token) {
  const url = `${API_BASE_URL}/v1/listings?page=1&limit=5`;

  const response = await fetch(url, {
    headers: {
      "X-API-Key": API_KEY,
      "Authorization": `Bearer ${token}`
    }
  });

  console.log("Listings status:", response.status);

  const data = await response.json();

  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  try {
    const loginData = await login();

    const token =
      loginData.access_token ||
      loginData.token ||
      loginData.accessToken;

    if (!token) {
      throw new Error("No access token returned by login");
    }

    await testListings(token);
  } catch (error) {
    console.error("Request failed:", error.message);
  }
}

main();