const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'mithira_auth_token';
const USER_KEY  = 'mithira_auth_user';

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function apiFetch(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

export async function loginAdmin({ email, password }) {
  const { ok, data } = await apiFetch('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (ok && data.token) {
    saveSession(data.token, data.user);
  }

  return { success: ok && data.success, message: data.message, user: data.user };
}

export async function verifySession() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const { ok, data } = await apiFetch('/api/auth/me');
    if (ok && data.success) {
      if (data.user?.role !== 'admin') {
        clearSession();
        return null;
      }
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    }
    clearSession();
    return null;
  } catch {
    clearSession();
    return null;
  }
}

export function logout() {
  clearSession();
}
