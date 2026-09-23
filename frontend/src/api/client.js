const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (success) => {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
};

/**
 * Universal Fetch Client with:
 * 1. Automatic inclusion of httpOnly cookies (credentials: "include")
 * 2. CSRF Header on state-changing requests (X-Requested-With: bbb)
 * 3. Silent refresh on 401 Unauthorized (deduplicated across parallel calls)
 */
export const apiClient = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'bbb',
    ...(options.headers || {})
  };

  // If body is FormData, delete Content-Type so browser sets boundary automatically
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  let response = await fetch(url, config);

  // Handle Token Expiry & Silent Refresh
  if (response.status === 401 && !options._retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (isRefreshing) {
      // Wait for active refresh to finish
      const retrySuccess = await new Promise((resolve) => {
        subscribeTokenRefresh((success) => resolve(success));
      });

      if (retrySuccess) {
        return apiClient(endpoint, { ...options, _retry: true });
      } else {
        throw new Error('SESSION_EXPIRED');
      }
    }

    options._retry = true;
    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'bbb'
        },
        credentials: 'include'
      });

      if (refreshRes.ok) {
        isRefreshing = false;
        onRefreshed(true);
        return apiClient(endpoint, options);
      } else {
        isRefreshing = false;
        onRefreshed(false);
        window.dispatchEvent(new CustomEvent('bbb:session-expired'));
        throw new Error('SESSION_EXPIRED');
      }
    } catch (err) {
      isRefreshing = false;
      onRefreshed(false);
      window.dispatchEvent(new CustomEvent('bbb:session-expired'));
      throw err;
    }
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Request failed');
    error.code = data?.error?.code || 'REQUEST_FAILED';
    error.status = response.status;
    error.fields = data?.error?.fields;
    throw error;
  }

  return data;
};
