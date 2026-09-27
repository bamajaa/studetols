import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, KeyRound, User, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regLabel, setRegLabel] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login gagal, periksa data Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const msg = await register(regUser, regPass, regLabel);
      setSuccess(msg);
      setTimeout(() => {
        setTab('login');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Full-Screen Video Background - 100% Sharp */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      >
        <source src="/animasi.mp4" type="video/mp4" />
      </video>
      
      {/* Light subtle vignette - zero haze */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-black/35 rounded-2xl shadow-2xl shadow-black/80 w-full max-w-md p-8 relative z-10 border border-white/25"
      >
        <div className="text-center mb-7">
          <img src="/logo.jpg" alt="STUDETOLS" className="w-14 h-14 rounded-xl shadow-lg mx-auto mb-3 object-cover border border-white/40" />
          <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">STUDETOLS</h1>
          <p className="text-xs font-medium text-slate-200 mt-1 drop-shadow-md">Platform Produktivitas & Manajemen Siswa</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-black/40 p-1 rounded-xl mb-6 relative border border-white/20">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 relative z-10 ${
              tab === 'login' ? 'bg-white/25 text-white shadow-sm border border-white/30' : 'text-slate-300 hover:text-white'
            }`}
          >
            <LogIn size={14} /> Masuk
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 relative z-10 ${
              tab === 'register' ? 'bg-indigo-600/80 text-white shadow-sm border border-indigo-400/40' : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserPlus size={14} /> Buat Akun
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                  <User size={13} className="text-slate-300" /> Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/30 focus:ring-2 focus:ring-white/40 focus:border-white outline-none transition text-sm bg-black/40 focus:bg-black/60 text-white font-medium placeholder:text-slate-400 shadow-inner"
                  placeholder="Masukkan username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                  <KeyRound size={13} className="text-slate-300" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/30 focus:ring-2 focus:ring-white/40 focus:border-white outline-none transition text-sm bg-black/40 focus:bg-black/60 text-white font-medium placeholder:text-slate-400 shadow-inner"
                  placeholder="Masukkan password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.99] font-extrabold py-3 rounded-xl transition duration-200 text-sm shadow-xl shadow-black/40 disabled:opacity-50 mt-2"
              >
                {loading ? 'Memverifikasi...' : 'Masuk ke Akun'}
              </button>

              {error && (
                <div className="text-xs text-center text-red-200 font-semibold bg-red-950/80 p-2.5 rounded-xl border border-red-500/50">
                  {error}
                </div>
              )}
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                  <User size={13} className="text-slate-300" /> Username Baru
                </label>
                <input
                  type="text"
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-white/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition text-sm bg-black/40 focus:bg-black/60 text-white font-medium placeholder:text-slate-400 shadow-inner"
                  placeholder="Pilih username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                  <KeyRound size={13} className="text-slate-300" /> Password
                </label>
                <input
                  type="password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-white/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition text-sm bg-black/40 focus:bg-black/60 text-white font-medium placeholder:text-slate-400 shadow-inner"
                  placeholder="Buat password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5 drop-shadow-sm">
                  <Sparkles size={13} className="text-indigo-300" /> Nama Lengkap / Panggilan
                </label>
                <input
                  type="text"
                  value={regLabel}
                  onChange={(e) => setRegLabel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/30 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition text-sm bg-black/40 focus:bg-black/60 text-white font-medium placeholder:text-slate-400 shadow-inner"
                  placeholder="Contoh: Ihsan Hafidz"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-extrabold py-3 rounded-xl transition duration-200 text-sm shadow-xl shadow-indigo-900/40 disabled:opacity-50 mt-2"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar Akun'}
              </button>

              {error && (
                <div className="text-xs text-center text-red-200 font-semibold bg-red-950/80 p-2.5 rounded-xl border border-red-500/50">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-xs text-center text-emerald-200 font-semibold bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-500/50">
                  {success}
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
