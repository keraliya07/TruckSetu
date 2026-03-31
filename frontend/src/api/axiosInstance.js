// === frontend/src/api/axiosInstance.js ===
// Purpose: Configured axios instance with base URL, JWT interceptor, and error handling
// Dependencies: axios, ../store/authStore

// import axios from 'axios';           // TODO: uncomment
// import { useAuthStore } from '../store/authStore';  // TODO: uncomment (for getState)

/**
 * TODO: Create and configure axios instance
 *
 * const api = axios.create({
 *   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
 *   timeout: 15000,
 *   headers: { 'Content-Type': 'application/json' },
 * });
 */

/**
 * TODO: Add request interceptor
 *
 * Purpose: Attach JWT token to every outgoing request
 *
 * Steps:
 *   1. Get token from authStore.getState().token
 *   2. If token exists, set Authorization header: `Bearer ${token}`
 *   3. Return modified config
 *
 * api.interceptors.request.use((config) => {
 *   // TODO: Attach JWT
 * });
 */

/**
 * TODO: Add response interceptor
 *
 * Purpose: Handle 401 responses (token expired) and other errors globally
 *
 * Steps:
 *   1. On success: return response.data (unwrap axios response)
 *   2. On 401 error: clear auth store, redirect to /login
 *   3. On 403 error: show "Access denied" toast
 *   4. On 500 error: show "Server error" toast
 *   5. On network error: show "Connection lost" toast
 *
 * api.interceptors.response.use(
 *   (response) => response.data,
 *   (error) => { /* TODO: handle errors */ }
 * );
 */

// export default api;
