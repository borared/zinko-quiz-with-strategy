const getDynamicApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    return `http://${window.location.hostname}:5000`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};
const API_URL = getDynamicApiUrl();

function buildApiError(errorBody, statusText) {
  const base = errorBody?.error || `API Error: ${statusText}`;
  const details = Array.isArray(errorBody?.details)
    ? errorBody.details
      .map((issue) => issue.message || issue.path?.join('.'))
      .filter(Boolean)
      .join(' · ')
    : '';

  const extra = errorBody?.message && errorBody.message !== base ? errorBody.message : '';
  const message = [base, details, extra].filter(Boolean).join(': ');
  const err = new Error(message);
  err.status = errorBody?.status;
  err.details = errorBody?.details;
  return err;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('zinko_jwt');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

function buildNetworkError(error) {
  const message =
    error?.message === 'Failed to fetch'
      ? `Unable to reach the Zinko API at ${API_URL}. Check your internet connection and confirm the backend server is running.`
      : error?.message || 'Network request failed.';
  const err = new Error(message);
  err.isNetworkError = true;
  return err;
}

async function request(url, options = {}) {
  try {
    return await fetch(url, options);
  } catch (error) {
    throw buildNetworkError(error);
  }
}

const api = {
  get: async (endpoint) => {
    const response = await request(`${API_URL}${endpoint}`, {
      headers: { ...getAuthHeaders() },
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw buildApiError(error, response.statusText);
    }
    return response.json();
  },
  
  post: async (endpoint, data) => {
    const response = await request(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw buildApiError(error, response.statusText);
    }
    return response.json();
  },

  postForm: async (endpoint, formData) => {
    const response = await request(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw buildApiError(error, response.statusText);
    }
    return response.json();
  },

  put: async (endpoint, data) => {
    const response = await request(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw buildApiError(error, response.statusText);
    }
    return response.json();
  },

  patch: async (endpoint, data) => {
    const response = await request(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw buildApiError(error, response.statusText);
    }
    return response.json();
  },

  delete: async (endpoint) => {
    const response = await request(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw buildApiError(error, response.statusText);
    }
    return response.json();
  },
};

export default api;
