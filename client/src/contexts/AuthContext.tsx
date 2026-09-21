import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthState {
  token: string | null;
  role: string | null;
  label: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, label: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('studetols_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('studetols_role'));
  const [label, setLabel] = useState<string | null>(localStorage.getItem('studetols_profile'));
  const navigate = useNavigate();

  const isAuthenticated = !!token;

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login gagal');
    localStorage.setItem('studetols_token', data.token);
    localStorage.setItem('studetols_role', data.role);
    localStorage.setItem('studetols_profile', data.label);
    setToken(data.token);
    setRole(data.role);
    setLabel(data.label);
  };

  const register = async (username: string, password: string, userLabel: string): Promise<string> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, label: userLabel }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registrasi gagal');
    return 'Akun berhasil dibuat! Silakan masuk.';
  };

  const logout = () => {
    localStorage.removeItem('studetols_token');
    localStorage.removeItem('studetols_role');
    localStorage.removeItem('studetols_profile');
    setToken(null);
    setRole(null);
    setLabel(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ token, role, label, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
