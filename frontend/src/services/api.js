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

    if (error.response?.status !== 401 || originalRequest._retry || originalRequest.url.includes('/auth/')) {
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
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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
