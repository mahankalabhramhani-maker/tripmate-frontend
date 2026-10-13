/**
 * AI TRIPMATE - CENTRALIZED API SERVICE
 * Communicates with the deployed Spring Boot REST backend on Render.
 * Incorporates robust response parsing to safely handle JSON, HTML, and plain-text errors.
 */

const DEFAULT_BACKEND_URL = 'https://tripmate-backend-gl4s.onrender.com/api';

/**
 * Resolves the active backend API Base URL.
 * Priority:
 * 1. Valid custom URL saved in localStorage ('tm_api_base_url')
 * 2. Vite environment variable import.meta.env.VITE_API_BASE_URL
 * 3. Default deployed Render backend URL
 */
export function getApiBaseUrl() {
  const custom = localStorage.getItem('tm_api_base_url');
  if (custom && custom.trim()) {
    const cleaned = custom.trim().replace(/\/+$/, '');
    // Ignore stale relative '/api' or self-referential vercel URLs from previous sessions
    if (cleaned !== '/api' && !cleaned.includes('vercel.app') && (cleaned.startsWith('http://') || cleaned.startsWith('https://'))) {
      return cleaned;
    }
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    const cleaned = envUrl.trim().replace(/\/+$/, '');
    if (!cleaned.includes('vercel.app')) {
      return cleaned;
    }
  }

  // Local development fallback if on localhost
  if (typeof window !== 'undefined') {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocal && !envUrl) {
      return 'http://localhost:8081/api';
    }
  }

  return DEFAULT_BACKEND_URL;
}

/**
 * Sets a custom API Base URL into localStorage
 */
export function setCustomApiBaseUrl(url) {
  if (url && url.trim()) {
    const cleaned = url.trim().replace(/\/+$/, '');
    localStorage.setItem('tm_api_base_url', cleaned);
  } else {
    localStorage.removeItem('tm_api_base_url');
  }
}

/**
 * Resets the API Base URL to default
 */
export function resetCustomApiBaseUrl() {
  localStorage.removeItem('tm_api_base_url');
}

/**
 * Robust response parser.
 * Safely reads response as text, checks Content-Type, and parses JSON.
 * Avoids crashing with "Unexpected token 'T', 'The page c'... is not valid JSON".
 */
async function parseResponse(res, defaultErrorMsg = 'Request failed') {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const isJson = contentType.includes('application/json');
  let rawText = '';

  try {
    rawText = await res.text();
  } catch (e) {
    rawText = '';
  }

  let parsedData = null;
  if (rawText && (isJson || rawText.trim().startsWith('{') || rawText.trim().startsWith('['))) {
    try {
      parsedData = JSON.parse(rawText);
    } catch (e) {
      parsedData = null;
    }
  }

  if (!res.ok) {
    let errMsg = '';
    if (parsedData && (parsedData.message || parsedData.error)) {
      errMsg = parsedData.message || parsedData.error;
    } else if (res.status === 404) {
      errMsg = 'Endpoint not found (404). Please ensure the backend is running and the API URL is correct.';
    } else if (res.status === 502 || res.status === 503 || res.status === 504) {
      errMsg = `Backend gateway error (${res.status}). The Render service may be starting up (cold start). Please retry in 30 seconds.`;
    } else if (res.status === 401) {
      errMsg = 'Authentication failed. Please check your credentials or log in again.';
    } else if (res.status === 403) {
      errMsg = 'Access denied. You do not have permission to perform this action.';
    } else if (rawText && !rawText.trim().startsWith('<') && rawText.trim().length < 200) {
      errMsg = rawText.trim();
    } else {
      errMsg = `${defaultErrorMsg} (HTTP ${res.status})`;
    }
    throw new Error(errMsg);
  }

  return parsedData !== null ? parsedData : rawText;
}

/**
 * Centralized fetch helper attaching authentication headers and JSON headers.
 */
async function request(endpoint, options = {}, defaultErrorMsg = 'Operation failed') {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  // Automatically attach Content-Type: application/json if sending a body and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Automatically attach Bearer token if available
  const token = localStorage.getItem('tm_token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  return parseResponse(res, defaultErrorMsg);
}

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

export const api = {
  // Authentication
  auth: {
    register: (name, email, password) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }, 'Registration failed'),

    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, 'Login failed'),
  },

  // Destinations
  destinations: {
    getAll: () => request('/destinations', { method: 'GET' }, 'Failed to load destinations'),
    getById: (id) => request(`/destinations/${id}`, { method: 'GET' }, 'Failed to load destination details'),
    search: (name) => request(`/destinations/search?name=${encodeURIComponent(name || '')}`, { method: 'GET' }, 'Failed to search destinations'),
  },

  // Tourist Places
  places: {
    getAll: () => request('/places', { method: 'GET' }, 'Failed to load places'),
    getById: (id) => request(`/places/${id}`, { method: 'GET' }, 'Failed to load place details'),
    getByDestination: (destId) => request(`/places/destination/${destId}`, { method: 'GET' }, 'Failed to load destination places'),
    getByCategory: (category) => request(`/places/category/${encodeURIComponent(category)}`, { method: 'GET' }, 'Failed to load places by category'),
  },

  // Trip Management (Protected)
  trips: {
    getAll: () => request('/trips', { method: 'GET' }, 'Failed to load user trips'),
    getById: (id) => request(`/trips/${id}`, { method: 'GET' }, 'Failed to load trip details'),
    create: (tripData) =>
      request('/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
      }, 'Failed to create trip'),
    update: (id, tripData) =>
      request(`/trips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tripData),
      }, 'Failed to update trip'),
    delete: (id) =>
      request(`/trips/${id}`, {
        method: 'DELETE',
      }, 'Failed to delete trip'),
    addPlace: (tripId, placeData) =>
      request(`/trips/${tripId}/places`, {
        method: 'POST',
        body: JSON.stringify(placeData),
      }, 'Failed to add place to trip'),
    removePlace: (tripId, tripPlaceId) =>
      request(`/trips/${tripId}/places/${tripPlaceId}`, {
        method: 'DELETE',
      }, 'Failed to remove place from trip'),
  },

  // Rule-based Recommendation Engine
  recommendations: {
    get: (data) =>
      request('/recommendations', {
        method: 'POST',
        body: JSON.stringify(data),
      }, 'Failed to generate recommendations'),
  },

  // AI Itinerary Planner
  ai: {
    generatePlan: (data) =>
      request('/ai/travel-plan', {
        method: 'POST',
        body: JSON.stringify(data),
      }, 'Failed to generate AI travel plan'),
  },

  // User Profile (Protected)
  users: {
    getMe: () => request('/users/me', { method: 'GET' }, 'Failed to load user profile'),
    getById: (id) => request(`/users/${id}`, { method: 'GET' }, 'Failed to load user details'),
    update: (id, data) =>
      request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, 'Failed to update user profile'),
    delete: (id) =>
      request(`/users/${id}`, {
        method: 'DELETE',
      }, 'Failed to delete account'),
  },

  // Backend Health
  health: {
    check: () => request('/health', { method: 'GET' }, 'Health check failed'),
  },
};

export default api;
