import axios from 'axios';
import { Alert } from 'react-native';

// To connect to a local backend from an Android emulator, you typically use 10.0.2.2.
// From an iOS simulator, localhost works. 
// For a physical device on the same local network, you need the host machine's local IP address (e.g., 192.168.1.x:3000).
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// ─── Toast helper ──────────────────────────────────────────
let lastToastTime = 0;
const TOAST_COOLDOWN = 4000; // 4 seconds between toasts

function showErrorToast(title, message) {
  const now = Date.now();
  if (now - lastToastTime < TOAST_COOLDOWN) return; // throttle
  lastToastTime = now;
  Alert.alert(title, message);
}

// ─── Response interceptor ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      showErrorToast('Request Timeout', 'The server took too long to respond. Please check your connection.');
    } else if (error.message === 'Network Error') {
      showErrorToast('Server Unreachable', 'Cannot connect to the CricCast server. Make sure the backend is running.');
    } else if (error.response && error.response.status >= 500) {
      showErrorToast('Server Error', `Something went wrong on the server (${error.response.status}). Please try again.`);
    }
    // Always log for debugging
    console.error('[API Error]', error?.response?.status, error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ─── Retry wrapper for idempotent requests ─────────────────
/**
 * Wraps an async API call with automatic retry on failure.
 * @param {() => Promise} fn - async function to execute (e.g. () => api.get('/api/matches'))
 * @param {number} retries - number of retries (default 2)
 * @param {number} delayMs - delay between retries (default 1000ms)
 * @returns {Promise}
 */
export async function apiWithRetry(fn, retries = 2, delayMs = 1000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}
