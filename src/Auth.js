// src/auth.js
const KEY = "webdav_basic_auth";

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export function setBasicAuth(username, password) {
  // Basic base64(user:pass)
  const token = btoa(`${username}:${password}`);
  localStorage.setItem(KEY, token);
}

export function getBasicAuthToken() {
  return localStorage.getItem(KEY);
}

export function isLoggedIn() {
  return !!getBasicAuthToken();
}

export function logout() {
  localStorage.removeItem(KEY);
}

export async function authFetch(url, options = {}) {
  const token = getBasicAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Basic ${token}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    throw new AuthError("401 Unauthorized");
  }
  return res;
}

/**
 * Untuk upload yang pakai XMLHttpRequest (punya onprogress).
 * Kita buat wrapper yang bentuknya mirip `xhrFetch` di project Anda.
 */
export function authXhrFetch(url, { method = "PUT", headers = {}, body, onprogress } = {}) {
  const token = getBasicAuthToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    // set headers
    Object.entries(headers || {}).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    if (token) xhr.setRequestHeader("Authorization", `Basic ${token}`);

    if (typeof onprogress === "function") {
      xhr.upload.onprogress = onprogress;
    }

    xhr.onload = () => {
      // xhr.status = 0 kalau network error
      if (xhr.status === 401) return reject(new AuthError("401 Unauthorized"));
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        // minimal kompatibel: jika Anda butuh text/json, bisa ditambah
        text: async () => xhr.responseText,
      });
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(body);
  });
}
