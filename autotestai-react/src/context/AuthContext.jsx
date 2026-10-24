import { createContext, useContext, useState } from 'react';
import { authApi } from '../lib/api.js';
const AuthContext = createContext(null);
function readUser() { try { return JSON.parse(localStorage.getItem('autotestai_user') || 'null'); } catch { return null; } }
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [loading, setLoading] = useState(false);
  async function login(credentials) {
    setLoading(true);
    try {
      const data = await authApi.login(credentials);
      const token = data.access_token || data.token;
      if (token) localStorage.setItem('autotestai_token', token);
      const nextUser = data.user || { name: credentials.email.split('@')[0], email: credentials.email };
      localStorage.setItem('autotestai_user', JSON.stringify(nextUser)); setUser(nextUser); return data;
    } finally { setLoading(false); }
  }
  async function register(values) {
    setLoading(true);
    try { const data = await authApi.register(values); return data; }
    finally { setLoading(false); }
  }
  function logout() { localStorage.removeItem('autotestai_token'); localStorage.removeItem('autotestai_user'); setUser(null); }
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
