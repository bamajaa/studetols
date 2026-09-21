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
  LayoutDashboard
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const allApps = [
  { to: '/kasir', label: 'Stude Bizz', icon: Store, color: 'text-emerald-600 bg-emerald-50' },
  { to: '/kalkulator', label: 'Kalkulator Nilai', icon: Calculator, color: 'text-amber-600 bg-amber-50' },
  { to: '/tasks', label: 'Task Tracker', icon: ListChecks, color: 'text-indigo-600 bg-indigo-50' },
  { to: '/statistik', label: 'Statistik Belajar', icon: BarChart3, color: 'text-teal-600 bg-teal-50' },
  { to: '/flashcards', label: 'Flashcard 3D', icon: Layers, color: 'text-purple-600 bg-purple-50' },
  { to: '/pomodoro', label: 'Pomodoro Timer', icon: Clock, color: 'text-rose-600 bg-rose-50' },
  { to: '/cornell', label: 'Cornell Notes', icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark, color: 'text-sky-600 bg-sky-50' },
  { to: '/schedule', label: 'Jadwal & Piket', icon: Calendar, color: 'text-orange-600 bg-orange-50' },
];

export default function Navbar() {
  const { label, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition">
              ST
            </div>
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
                    className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 grid grid-cols-1 gap-1 z-50"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      9 Modul Belajar & Kasir
                    </div>
                    {allApps.map((app) => (
                      <Link
                        key={app.to}
                        to={app.to}
                        onClick={() => setAppsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                          location.pathname === app.to 
                            ? 'bg-slate-100 text-slate-900 font-semibold' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${app.color}`}>
                          <app.icon size={15} />
                        </div>
                        {app.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">{label}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200/80">
              {role}
            </span>
          </div>

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
