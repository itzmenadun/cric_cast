import axios from 'axios';

// To connect to a local backend from an Android emulator, you typically use 10.0.2.2.
// From an iOS simulator, localhost works. 
// For a physical device on the same local network, you need the host machine's local IP address (e.g., 192.168.1.x:3000).
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

// We'll intercept responses here if needed (e.g., auth tokens in a real auth setup).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);
