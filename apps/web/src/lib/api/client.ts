import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const apiClient = axios.create({
  baseURL: typeof window !== 'undefined'
    ? '/api/v1'  // Browser: same-origin proxy (avoids CORS)
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/v1', // SSR: direct
  withCredentials: true,
  timeout: 10000,
});

import axiosRetry from 'axios-retry';

// Configure exponential backoff retry logic (only for GET or 5xx/Network errors)
axiosRetry(apiClient, {
  retries: 3, // Number of retries
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  },
});

// Request Interceptor: Attach access token
apiClient.interceptors.request.use(
  (config) => {
    // In a real app, you might want to get the token from memory/store
    // We'll rely on Zustand store to inject it or handle it in components.
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle 401s and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add this request to the queue
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshUrl = typeof window !== 'undefined'
          ? '/api/v1/auth/refresh'
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/auth/refresh`;

        const { data } = await axios.post(
          refreshUrl,
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = data.data?.accessToken || data.accessToken;
        
        // Update the access token in store
        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        
        // Optionally redirect to login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
