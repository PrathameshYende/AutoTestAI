import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
export const api = axios.create({ baseURL: API_BASE, timeout: 300000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('autotestai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('autotestai_token');
      localStorage.removeItem('autotestai_user');
      if (!['/login', '/register'].includes(window.location.pathname)) window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async register({ name, email, password }) {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },
  async login({ email, password }) {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);
    const { data } = await api.post('/auth/login', body, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    return data;
  },
};

export const dashboardApi = { async get() { const { data } = await api.get('/dashboard'); return data; } };
export const projectsApi = {
  async list() { const { data } = await api.get('/projects/'); return Array.isArray(data) ? data : (data?.items || data?.projects || []); },
  async create(payload) { const { data } = await api.post('/projects/', payload); return data; },
  async get(id) { const { data } = await api.get(`/projects/${id}`); return data; },
  async update(id, payload) { const { data } = await api.put(`/projects/${id}`, payload); return data; },
  async remove(id) { const { data } = await api.delete(`/projects/${id}`); return data; },
};

export function errorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((x) => x.msg).join(', ');
  if (typeof detail === 'string') return detail;
  return error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
}


// Video and test-case routes confirmed in the existing FastAPI backend.
export const videosApi = {
  async listForProject(projectId) {
    const { data } = await api.get(`/videos/project/${projectId}`);
    return Array.isArray(data) ? data : (data?.items || data?.videos || []);
  },
  async process(videoId) {
    const { data } = await api.post(`/videos/${videoId}/process`);
    return data;
  },
};

export const analysisApi = {
  async ocr(videoId) { const { data } = await api.get(`/analysis/ocr/${videoId}`, { timeout: 300000 }); return data; },
  async frames(videoId) { const { data } = await api.get(`/analysis/frames/${videoId}`, { timeout: 300000 }); return data; },
  async changes(videoId) { const { data } = await api.get(`/analysis/changes/${videoId}`, { timeout: 300000 }); return data; },
};

export const testCasesApi = {
  async list(videoId) {
    const { data } = await api.get(`/analysis/test-cases/${videoId}`);
    return data;
  },
  async generate(videoId) {
    const { data } = await api.post(`/analysis/test-cases/${videoId}`);
    return data;
  },
};


// Automation code-generation endpoint (requires the backend patch in backend_patch/).
export const automationApi = {
  async generate(videoId, payload) { const { data } = await api.post(`/automation/generate/${videoId}`, payload, { timeout: 300000 }); return data; }
};