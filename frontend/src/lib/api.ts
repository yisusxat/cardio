import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: inject access token
api.interceptors.request.use((config) => {
  // Lazy-import to avoid circular dependency
  const stored = localStorage.getItem('cardiocenter-auth');
  if (stored) {
    try {
      const state = JSON.parse(stored);
      const token = state?.state?.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // ignore
    }
  }
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config) & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      try {
        const stored = localStorage.getItem('cardiocenter-auth');
        if (!stored) throw new Error('No stored auth');

        const state = JSON.parse(stored);
        const refreshToken = state?.state?.refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken } = res.data.data;

        // Update stored token
        state.state.accessToken = accessToken;
        localStorage.setItem('cardiocenter-auth', JSON.stringify(state));

        original.headers!.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('cardiocenter-auth');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
