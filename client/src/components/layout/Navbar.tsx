import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LogOut, 
  ChevronDown, 
  Menu, 
  X, 
  Store, 
  Calculator, 
  ListChecks, 
  BarChart3, 
  Layers, 
  Clock, 
  FileText, 
  Bookmark, 
  Calendar,
  LayoutDashboard,
  Wallet,
  BookOpen,
  Binary,
  Search,
  User,
  Users
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const allApps = [
  { to: '/kasir', label: 'Stude Bizz (Kasir)', icon: Store, color: 'text-emerald-600 bg-emerald-50' },
  { to: '/finance', label: 'FinTrack (Buku Kas)', icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
  { to: '/kalkulator', label: 'Kalkulator Nilai', icon: Calculator, color: 'text-amber-600 bg-amber-50' },
  { to: '/tasks', label: 'Task Tracker', icon: ListChecks, color: 'text-indigo-600 bg-indigo-50' },
  { to: '/statistik', label: 'Statistik Belajar', icon: BarChart3, color: 'text-teal-600 bg-teal-50' },
  { to: '/flashcards', label: 'Flashcard 3D', icon: Layers, color: 'text-purple-600 bg-purple-50' },
  { to: '/pomodoro', label: 'Pomodoro Timer', icon: Clock, color: 'text-rose-600 bg-rose-50' },
  { to: '/cornell', label: 'Cornell Notes', icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark, color: 'text-sky-600 bg-sky-50' },
  { to: '/citation', label: 'Sitasi & Pustaka', icon: BookOpen, color: 'text-sky-600 bg-sky-50' },
  { to: '/schedule', label: 'Jadwal & Piket', icon: Calendar, color: 'text-orange-600 bg-orange-50' },
  { to: '/converter', label: 'Rumus & Konverter', icon: Binary, color: 'text-indigo-600 bg-indigo-50' },
];

export default function Navbar() {
  const { token, label, role, avatar, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll unread messages count
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/friends/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setUnreadCount(Number(data.totalUnread) || 0);
        }
      } catch (e) {
        // silent
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, location.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAppsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <img src="/logo.jpg" alt="STUDETOLS" className="w-8 h-8 rounded-lg shadow-sm group-hover:scale-105 transition object-cover" />
            <div>
              <div className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">STUDETOLS</div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">Control Center</div>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/dashboard' 
                  ? 'text-slate-900 bg-slate-100' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={14} />
              Dashboard
            </Link>

            <Link
              to="/profile"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/profile' 
                  ? 'text-indigo-700 bg-indigo-50 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User size={14} />
              Profil
            </Link>

            <Link
              to="/friends"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/friends' 
                  ? 'text-purple-700 bg-purple-50 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users size={14} />
              <span>Teman</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/statistik"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/statistik' 
                  ? 'text-teal-700 bg-teal-50 font-bold' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 size={14} />
              Statistik
            </Link>

            {/* Apps Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setAppsOpen(!appsOpen)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  appsOpen || location.pathname !== '/dashboard'
                    ? 'text-indigo-600 bg-indigo-50/70'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers size={14} />
                Semua Modul
                <ChevronDown size={12} className={`transition-transform duration-200 ${appsOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {appsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 flex flex-col"
                  >
                    {/* Header & Search Bar */}
                    <div className="px-2 pt-1 pb-2">
                      <div className="flex items-center justify-between mb-1.5 px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          12 Modul Terintegrasi
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.2 rounded-full">
                          {allApps.filter(a => a.label.toLowerCase().includes(dropdownSearch.toLowerCase())).length}
                        </span>
                      </div>
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          value={dropdownSearch}
                          onChange={(e) => setDropdownSearch(e.target.value)}
                          placeholder="Cari modul..."
                          autoFocus
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Scrollable Compact Module List */}
                    <div className="max-h-64 overflow-y-auto pr-1 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                      {allApps
                        .filter((app) => app.label.toLowerCase().includes(dropdownSearch.toLowerCase()))
                        .map((app) => (
                          <Link
                            key={app.to}
                            to={app.to}
                            onClick={() => {
                              setAppsOpen(false);
                              setDropdownSearch('');
                            }}
                            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                              location.pathname === app.to 
                                ? 'bg-indigo-50/80 text-indigo-700 font-semibold' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center ${app.color}`}>
                              <app.icon size={13} />
                            </div>
                            <span className="truncate">{app.label}</span>
                          </Link>
                        ))}

                      {allApps.filter((app) => app.label.toLowerCase().includes(dropdownSearch.toLowerCase())).length === 0 && (
                        <div className="py-4 text-center text-xs text-slate-400">
                          Modul tidak ditemukan
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="hidden sm:flex items-center gap-2 bg-slate-100/80 hover:bg-slate-200/70 px-2.5 py-1.5 rounded-full border border-slate-200/60 transition group"
            title="Buka Pengaturan Profil"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-5 h-5 rounded-full object-cover shadow-sm ring-1 ring-white" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">{label}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200/80">
              {role}
            </span>
          </Link>

          <button
            onClick={logout}
            title="Keluar dari akun"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Keluar</span>
          </button>

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="md:hidden text-slate-700 p-1 rounded-lg hover:bg-slate-100"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-200 px-6 py-4 space-y-2 shadow-lg"
          >
            <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">Navigasi Utama</div>
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <User size={14} /> Profil & Pengaturan
            </Link>
            <Link
              to="/friends"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-2 text-xs font-semibold text-purple-600 hover:text-purple-800"
            >
              <div className="flex items-center gap-2">
                <Users size={14} />
                <span>Teman & Obrolan</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {unreadCount} pesan baru
                </span>
              )}
            </Link>
            <Link
              to="/statistik"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-2 text-xs font-semibold text-teal-600 hover:text-teal-800"
            >
              <BarChart3 size={14} /> Statistik Belajar & Produktivitas
            </Link>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">Semua Modul</div>
              <div className="grid grid-cols-2 gap-2">
                {allApps.map((app) => (
                  <Link
                    key={app.to}
                    to={app.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${app.color}`}>
                      <app.icon size={13} />
                    </div>
                    <span className="truncate">{app.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
