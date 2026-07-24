import axios from 'axios';

const api = axios.create({
  // In development, '/api/v1' is caught by Vite's proxy (see vite.config.js) and
  // forwarded to the local backend. In production, there is no dev server to proxy
  // through, so VITE_API_URL must point directly at the deployed backend's URL
  // (e.g. https://your-backend.onrender.com/api/v1), set at build time.
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true, // sends httpOnly cookies (accessToken/refreshToken) with every request
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error) => {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingQueue = [];
};

/**
 * On a 401, attempt exactly one silent token refresh, then retry the original
 * request. If the refresh itself fails, redirect to login. Concurrent 401s
 * while a refresh is already in flight are queued and retried together once
 * the refresh resolves, to avoid firing multiple parallel refresh calls.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only the refresh call itself (and login/register, which never had a valid
    // session to begin with) should skip the retry-with-refresh flow. Other
    // /auth/* routes like /auth/me or /auth/update-password are protected
    // endpoints that legitimately need a silent refresh on token expiry.
    const isAuthBootstrapRoute =
      originalRequest.url.includes('/auth/refresh') ||
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/register');

    if (error.response?.status !== 401 || originalRequest._retry || isAuthBootstrapRoute) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post('/auth/refresh');
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      // Don't hard-redirect here. This code runs for ANY failed request on ANY
      // page — including the public landing page, where a logged-out visitor
      // has no session at all and a 401 from /auth/me is completely normal.
      // Just tell the app "the session is gone"; AuthContext clears the user,
      // and ProtectedRoute (routes/guards.jsx) reactively sends logged-in-only
      // pages to /login via React Router — without reloading public pages.
      window.dispatchEvent(new Event('auth:session-expired'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * Extracts a human-readable message from an API error response, falling back
 * to a generic message so the UI never shows "undefined" to the user.
 */
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';

export default api;