const API_BASE_URL = process.env.IVY_BASE_URL;
const API_KEY = process.env.IVY_API_KEY;

let accessToken = null;

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

  if (!response.ok) {
    throw new Error(data.detail || "Ivy login failed");
  }

  accessToken = data.access_token;

  return accessToken;
}

async function getListings(page = 1, limit = 20) {
  if (!accessToken) {
    await login();
  }

  const url = `${API_BASE_URL}/v1/listings?page=${page}&limit=${limit}`;

  const response = await fetch(url, {
    headers: {
      "X-API-Key": API_KEY,
      "Authorization": `Bearer ${accessToken}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch listings");
  }

  return data;
}

module.exports = {
  login,
  getListings
};