const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cryptotraderai-api.onrender.com';

// Helper to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Base fetch with auth
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: (email: string, password: string) =>
    fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () =>
    fetchWithAuth('/api/auth/profile'),
};

// Diary API
export const diaryAPI = {
  // Entries
  getEntries: (params?: { limit?: number; offset?: number; symbol?: string; status?: string }) => {
    const query = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    return fetchWithAuth(`/api/diary/entries${query ? `?${query}` : ''}`);
  },

  getEntry: (id: string) =>
    fetchWithAuth(`/api/diary/entries/${id}`),

  createEntry: (entry: any) =>
    fetchWithAuth('/api/diary/entries', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  updateEntry: (id: string, updates: any) =>
    fetchWithAuth(`/api/diary/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteEntry: (id: string) =>
    fetchWithAuth(`/api/diary/entries/${id}`, {
      method: 'DELETE',
    }),

  // Stats
  getStats: () =>
    fetchWithAuth('/api/diary/stats'),

  // Daily Journal
  getJournal: (date: string) =>
    fetchWithAuth(`/api/diary/journal/${date}`),

  saveJournal: (journal: any) =>
    fetchWithAuth('/api/diary/journal', {
      method: 'POST',
      body: JSON.stringify(journal),
    }),
};

export default { authAPI, diaryAPI };
