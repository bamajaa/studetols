import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthState {
  token: string | null;
  role: string | null;
  label: string | null;
  avatar: string | null;
  bio: string | null;
  favoriteSubject: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, label: string) => Promise<string>;
  updateUserContext: (newData: { label?: string; avatar?: string; bio?: string; favoriteSubject?: string; token?: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('studetols_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('studetols_role'));
  const [label, setLabel] = useState<string | null>(localStorage.getItem('studetols_profile'));
  const [avatar, setAvatar] = useState<string | null>(localStorage.getItem('studetols_avatar'));
  const [bio, setBio] = useState<string | null>(localStorage.getItem('studetols_bio'));
  const [favoriteSubject, setFavoriteSubject] = useState<string | null>(localStorage.getItem('studetols_fav_subject'));
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
    if (data.avatar) localStorage.setItem('studetols_avatar', data.avatar);
    if (data.bio) localStorage.setItem('studetols_bio', data.bio);
    if (data.favorite_subject) localStorage.setItem('studetols_fav_subject', data.favorite_subject);
    
    setToken(data.token);
    setRole(data.role);
    setLabel(data.label);
    setAvatar(data.avatar || null);
    setBio(data.bio || null);
    setFavoriteSubject(data.favorite_subject || null);
  };

  const updateUserContext = (newData: { label?: string; avatar?: string; bio?: string; favoriteSubject?: string; token?: string }) => {
    try {
      if (newData.token) {
        localStorage.setItem('studetols_token', newData.token);
        setToken(newData.token);
      }
      if (newData.label !== undefined) {
        localStorage.setItem('studetols_profile', newData.label);
        setLabel(newData.label);
      }
      if (newData.avatar !== undefined) {
        try {
          localStorage.setItem('studetols_avatar', newData.avatar);
        } catch (e) {
          console.warn('Could not store full avatar in localStorage (quota exceeded)', e);
        }
        setAvatar(newData.avatar);
      }
      if (newData.bio !== undefined) {
        localStorage.setItem('studetols_bio', newData.bio);
        setBio(newData.bio);
      }
      if (newData.favoriteSubject !== undefined) {
        localStorage.setItem('studetols_fav_subject', newData.favoriteSubject);
        setFavoriteSubject(newData.favoriteSubject);
      }
    } catch (e) {
      console.warn('Error updating storage:', e);
    }
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
    localStorage.removeItem('studetols_avatar');
    localStorage.removeItem('studetols_bio');
    localStorage.removeItem('studetols_fav_subject');
    setToken(null);
    setRole(null);
    setLabel(null);
    setAvatar(null);
    setBio(null);
    setFavoriteSubject(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      role, 
      label, 
      avatar, 
      bio, 
      favoriteSubject, 
      isAuthenticated, 
      login, 
      register, 
      updateUserContext, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
