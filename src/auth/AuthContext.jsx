import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { user: null })
      .then(({ user }) => { setUser(user); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const login = () => { window.location.href = '/auth/login'; };
  const logout = () => { window.location.href = '/auth/logout'; };

  const updateProfile = async (data) => {
    const r = await fetch('/auth/profile', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error('Profile update failed');
    const { user } = await r.json();
    setUser(user);
    return user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
