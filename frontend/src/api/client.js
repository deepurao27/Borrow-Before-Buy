import { mockEngine } from './mockEngine.js';

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
 * Handle in-browser fallback when remote API server is unreachable, sleeping, or in demo mode.
 */
const handleMockFallback = (endpoint, options) => {
  const method = (options.method || 'GET').toUpperCase();
  const [path, queryString] = endpoint.split('?');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  let body = {};
  if (options.body) {
    if (typeof options.body === 'string') {
      try {
        body = JSON.parse(options.body);
      } catch (e) {
        body = {};
      }
    } else if (options.body instanceof FormData) {
      body = {};
    }
  }

  let currentUser = null;
  if (typeof window !== 'undefined') {
    try {
      const u = localStorage.getItem('bbb_user');
      if (u) currentUser = JSON.parse(u);
    } catch {
      // Ignore localStorage parse error
    }
  }

  // 1. Auth: Send OTP
  if (cleanPath === '/auth/otp/send' && method === 'POST') {
    return mockEngine.sendOtp(body.email, body.name);
  }

  // 2. Auth: Verify OTP
  if (cleanPath === '/auth/otp/verify' && method === 'POST') {
    return mockEngine.verifyOtp(body.email, body.otp, body.name);
  }

  // 3. Auth: Password Login
  if (cleanPath === '/auth/login' && method === 'POST') {
    return mockEngine.loginPassword(body.collegeEmail, body.password);
  }

  // 3b. Auth: Register
  if (cleanPath === '/auth/register' && method === 'POST') {
    const newUser = {
      id: 'user-' + Date.now(),
      name: body.name || 'Campus Student',
      collegeEmail: body.collegeEmail,
      department: body.department || 'Student Community',
      year: body.year || 1,
      role: 'STUDENT',
      borrowerScore: 50,
      lenderScore: 50,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
    };
    return {
      data: {
        user: newUser,
        accessToken: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now()
      },
      message: 'Account created successfully!'
    };
  }

  // 3c. Auth: Demo Login
  if (cleanPath === '/auth/demo-login' && method === 'POST') {
    return mockEngine.demoLogin(body.userId);
  }

  // 4. Auth: Me
  if (cleanPath === '/auth/me') {
    if (currentUser) {
      return { data: { user: currentUser } };
    }
    const err = new Error('Not authenticated');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }

  // 5. Auth: Logout
  if (cleanPath === '/auth/logout' && method === 'POST') {
    return { success: true, message: 'Logged out successfully' };
  }

  // 6. Categories
  if (cleanPath === '/categories') {
    return mockEngine.getCategories();
  }

  // 7. Campus Points
  if (cleanPath === '/campus-points') {
    return mockEngine.getCampusPoints();
  }

  // 8. Public Stats
  if (cleanPath === '/public/stats') {
    return mockEngine.getStats();
  }

  // 8b. Student Dashboard
  if (cleanPath === '/users/me/dashboard') {
    return mockEngine.getDashboard(currentUser);
  }

  // 8c. Student Profile
  if (cleanPath === '/users/me/profile' || (cleanPath.startsWith('/users/') && cleanPath.endsWith('/profile'))) {
    const targetId = cleanPath === '/users/me/profile' ? 'me' : cleanPath.replace('/users/', '').replace('/profile', '');
    return mockEngine.getProfile(targetId, currentUser);
  }

  // 8d. Campus Leaderboard
  if (cleanPath === '/rewards/leaderboard') {
    return mockEngine.getLeaderboard();
  }

  // 9. Items List (Browse & Noticeboard)
  if (cleanPath === '/items' && method === 'GET') {
    return mockEngine.getItems(queryString || '');
  }

  // 10. Create Item (Lend Item flow)
  if (cleanPath === '/items' && method === 'POST') {
    return mockEngine.createItem(body, currentUser);
  }

  // 11. Photos upload
  if (cleanPath.startsWith('/items/') && cleanPath.endsWith('/photos') && method === 'POST') {
    const itemId = cleanPath.split('/')[2];
    return mockEngine.attachPhotos(itemId, ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80']);
  }

  // 12. Single Item Detail
  if (cleanPath.startsWith('/items/') && method === 'GET') {
    const id = cleanPath.replace('/items/', '');
    return mockEngine.getItemById(id);
  }

  // 13. Delete Item
  if (cleanPath.startsWith('/items/') && method === 'DELETE') {
    const id = cleanPath.replace('/items/', '');
    return mockEngine.deleteItem(id);
  }

  // 14. Create Borrow Request
  if (cleanPath.startsWith('/requests/items/') && method === 'POST') {
    const itemId = cleanPath.replace('/requests/items/', '');
    return mockEngine.createBorrowRequest(itemId, body, currentUser);
  }

  // 15. Get Requests
  if (cleanPath === '/requests' && method === 'GET') {
    const params = new URLSearchParams(queryString || '');
    return mockEngine.getRequests(params.get('type') || 'received', currentUser);
  }

  // 16. Accept / Reject / Cancel Request
  if (cleanPath.startsWith('/requests/') && method === 'PATCH') {
    const parts = cleanPath.split('/');
    const reqId = parts[2];
    const action = parts[3];
    if (action === 'accept') {
      return mockEngine.acceptRequest(reqId, currentUser);
    }
    return { success: true, message: `Request ${action}ed.` };
  }

  // 17. Transactions
  if (cleanPath === '/transactions' && method === 'GET') {
    return mockEngine.getTransactions(currentUser);
  }

  if (cleanPath.startsWith('/transactions/') && method === 'GET') {
    const txId = cleanPath.replace('/transactions/', '');
    return mockEngine.getTransactionById(txId);
  }

  if (cleanPath.startsWith('/transactions/') && (method === 'POST' || method === 'PATCH')) {
    return { success: true, message: 'Exchange update recorded successfully.' };
  }

  // Generic fallback
  return { data: null, message: 'Request processed' };
};

/**
 * Universal Fetch Client with:
 * 1. Automatic inclusion of httpOnly cookies (credentials: "include")
 * 2. Authorization Bearer header for cross-origin third-party cookie compatibility
 * 3. CSRF Header on state-changing requests (X-Requested-With: bbb)
 * 4. Silent refresh on 401 Unauthorized (deduplicated across parallel calls)
 * 5. Robust in-browser Mock Engine fallback when backend server is disconnected or cold-starting.
 */
export const apiClient = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('bbb_access_token') : null;
  let storedUser = null;
  if (typeof window !== 'undefined') {
    try {
      const u = localStorage.getItem('bbb_user');
      if (u) storedUser = JSON.parse(u);
    } catch {
      // Ignore localStorage parse error
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'bbb',
    ...(storedUser?.id ? { 'X-User-Id': storedUser.id } : {}),
    ...(storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {}),
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

  let response;
  let useFallback = false;

  try {
    // Add a 6-second timeout controller so requests don't hang indefinitely on cold-start Render backends
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    config.signal = controller.signal;

    response = await fetch(url, config);
    clearTimeout(timeoutId);

    // If server responds with 502/503/504 (cold start, database sleeping, or Render wake up error)
    if (response.status >= 502 && response.status <= 504) {
      console.warn(`[BBB API] Server status ${response.status} at ${endpoint}. Using active campus mock engine.`);
      useFallback = true;
    }
  } catch (netErr) {
    // Catch fetch network errors (e.g. ERR_CONNECTION_REFUSED, Failed to fetch, DNS failure, AbortError)
    console.warn(`[BBB API] Network unreachable for ${endpoint}. Falling back to in-browser engine:`, netErr.message);
    useFallback = true;
  }

  if (useFallback) {
    const mockData = handleMockFallback(endpoint, options);
    // Auto-save mock tokens
    if (mockData?.data?.user && typeof window !== 'undefined') {
      if (mockData.data.accessToken) {
        localStorage.setItem('bbb_access_token', mockData.data.accessToken);
      }
      if (mockData.data.user) {
        localStorage.setItem('bbb_user', JSON.stringify(mockData.data.user));
      }
    }
    return mockData;
  }

  // Handle Token Expiry & Silent Refresh
  if (response.status === 401 && !options._retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (isRefreshing) {
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
      const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('bbb_refresh_token') : null;
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'bbb',
          ...(storedToken ? { 'Authorization': `Bearer ${storedToken}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: storedRefreshToken })
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json().catch(() => null);
        const newAccessToken = refreshData?.data?.accessToken || refreshData?.accessToken;
        if (newAccessToken && typeof window !== 'undefined') {
          localStorage.setItem('bbb_access_token', newAccessToken);
        }
        isRefreshing = false;
        onRefreshed(true);
        return apiClient(endpoint, options);
      } else {
        isRefreshing = false;
        onRefreshed(false);
        // If refresh fails on a mock session or local preview, gracefully fallback to in-browser engine
        // so user draft/item posting is never blocked with SESSION_EXPIRED
        if (endpoint.includes('/auth/me')) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('bbb_access_token');
            localStorage.removeItem('bbb_refresh_token');
            localStorage.removeItem('bbb_user');
          }
          window.dispatchEvent(new CustomEvent('bbb:session-expired'));
          throw new Error('SESSION_EXPIRED');
        }

        console.warn(`[BBB API] Server 401 refresh unverified on ${endpoint}. Processing with active campus mock engine.`);
        return handleMockFallback(endpoint, options);
      }
    } catch (err) {
      isRefreshing = false;
      onRefreshed(false);
      if (endpoint.includes('/auth/me')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bbb_access_token');
          localStorage.removeItem('bbb_refresh_token');
        }
        window.dispatchEvent(new CustomEvent('bbb:session-expired'));
        throw err;
      }
      console.warn(`[BBB API] Server auth error on ${endpoint}. Processing with in-browser mock engine.`);
      return handleMockFallback(endpoint, options);
    }
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  // Automatically save returned access token & refresh token
  if (response.ok && isJson && typeof window !== 'undefined') {
    const newAccessToken = data?.data?.accessToken || data?.accessToken;
    const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;
    const user = data?.data?.user || data?.user;
    if (newAccessToken) {
      localStorage.setItem('bbb_access_token', newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('bbb_refresh_token', newRefreshToken);
    }
    if (user) {
      localStorage.setItem('bbb_user', JSON.stringify(user));
    }
  }

  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Request failed');
    error.code = data?.error?.code || 'REQUEST_FAILED';
    error.status = response.status;
    error.fields = data?.error?.fields;
    throw error;
  }

  return data;
};
