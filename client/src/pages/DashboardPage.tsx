import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, 
  Calculator, 
  ListChecks, 
  BarChart3, 
  Layers, 
  Clock, 
  FileText, 
  Bookmark, 
  Calendar, 
  ArrowUpRight, 
  Search,
  Database, 
  Activity, 
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  Zap,
  Wallet,
  BookOpen,
  Binary
} from 'lucide-react';

const apps = [
  { 
    to: '/kasir', 
    icon: Store, 
    title: 'Stude Bizz (Kasir)', 
    desc: 'Pencatatan transaksi harian, modal bahan, keuntungan bersih, dan arsip penjualan.', 
    tag: 'Bisnis',
    badge: 'Kasir & POS',
    accent: 'hover:border-emerald-500/60 hover:shadow-emerald-500/5',
    iconColor: 'text-emerald-600 bg-emerald-50'
  },
  { 
    to: '/kalkulator', 
    icon: Calculator, 
    title: 'Kalkulator Nilai', 
    desc: 'Kalkulasi nilai akhir dengan bobot persentase, rata-rata, dan simulasi target kelulusan.', 
    tag: 'Akademik',
    badge: 'Simulasi Nilai',
    accent: 'hover:border-amber-500/60 hover:shadow-amber-500/5',
    iconColor: 'text-amber-600 bg-amber-50'
  },
  { 
    to: '/tasks', 
    icon: ListChecks, 
    title: 'Task Tracker', 
    desc: 'Manajemen to-do harian dengan status progres terorganisir langsung di database MySQL.', 
    tag: 'Produktivitas',
    badge: 'MySQL Tasks',
    accent: 'hover:border-indigo-500/60 hover:shadow-indigo-500/5',
    iconColor: 'text-indigo-600 bg-indigo-50'
  },
  { 
    to: '/statistik', 
    icon: BarChart3, 
    title: 'Statistik Belajar', 
    desc: 'Stopwatch belajar real-time, pencatatan durasi manual, dan grafik tren performa mata pelajaran.', 
    tag: 'Akademik',
    badge: 'Timer & Insight',
    accent: 'hover:border-teal-500/60 hover:shadow-teal-500/5',
    iconColor: 'text-teal-600 bg-teal-50'
  },
  { 
    to: '/flashcards', 
    icon: Layers, 
    title: 'Flashcard 3D', 
    desc: 'Kartu hafalan interaktif dengan efek balik 3D halus untuk mengasah daya ingat istilah & rumus.', 
    tag: 'Akademik',
    badge: 'Efek 3D Flip',
    accent: 'hover:border-purple-500/60 hover:shadow-purple-500/5',
    iconColor: 'text-purple-600 bg-purple-50'
  },
  { 
    to: '/pomodoro', 
    icon: Clock, 
    title: 'Pomodoro Timer', 
    desc: 'Teknik interval fokus 25/5 menit dilengkapi suara alam (hujan & white noise) sintetis browser.', 
    tag: 'Produktivitas',
    badge: 'Ambient Sound',
    accent: 'hover:border-rose-500/60 hover:shadow-rose-500/5',
    iconColor: 'text-rose-600 bg-rose-50'
  },
  { 
    to: '/cornell', 
    icon: FileText, 
    title: 'Cornell Note-Taking', 
    desc: 'Format catatan ringkas 3-area (Cues, Notes, Summary) yang siap diekspor teks atau cetak PDF.', 
    tag: 'Akademik',
    badge: 'Print & TXT',
    accent: 'hover:border-emerald-500/60 hover:shadow-emerald-500/5',
    iconColor: 'text-emerald-600 bg-emerald-50'
  },
  { 
    to: '/bookmarks', 
    icon: Bookmark, 
    title: 'Resource Bookmarks', 
    desc: 'Koleksi link referensi belajar, modul PDF, dan website penting dengan filter kategori instan.', 
    tag: 'Produktivitas',
    badge: 'Katalog Link',
    accent: 'hover:border-sky-500/60 hover:shadow-sky-500/5',
    iconColor: 'text-sky-600 bg-sky-50'
  },
  { 
    to: '/schedule', 
    icon: Calendar, 
    title: 'Jadwal & Piket', 
    desc: 'Tabel jadwal mata pelajaran mingguan otomatis highlight hari ini dan pembagian tugas piket kelas.', 
    tag: 'Akademik',
    badge: 'Hari Ini Highlight',
    accent: 'hover:border-orange-500/60 hover:shadow-orange-500/5',
    iconColor: 'text-orange-600 bg-orange-50'
  },
  { 
    to: '/finance', 
    icon: Wallet, 
    title: 'FinTrack (Buku Kas)', 
    desc: 'Catatan uang saku, pendapatan magang/jualan, pengeluaran harian, dan monitoring saldo bersih.', 
    tag: 'Bisnis',
    badge: 'Uang Saku & Kas',
    accent: 'hover:border-emerald-500/60 hover:shadow-emerald-500/5',
    iconColor: 'text-emerald-600 bg-emerald-50'
  },
  { 
    to: '/citation', 
    icon: BookOpen, 
    title: 'Sitasi & Daftar Pustaka', 
    desc: 'Generator otomatis format APA, MLA, Harvard, dan Chicago untuk tugas makalah & karya ilmiah.', 
    tag: 'Produktivitas',
    badge: 'APA / MLA / Harvard',
    accent: 'hover:border-sky-500/60 hover:shadow-sky-500/5',
    iconColor: 'text-sky-600 bg-sky-50'
  },
  { 
    to: '/converter', 
    icon: Binary, 
    title: 'Rumus & Konverter Satuan', 
    desc: 'Kalkulator instan rumus fisika, matematika, dan konversi multi-satuan suhu, panjang, dan massa.', 
    tag: 'Akademik',
    badge: 'Kalkulator Eksakta',
    accent: 'hover:border-indigo-500/60 hover:shadow-indigo-500/5',
    iconColor: 'text-indigo-600 bg-indigo-50'
  },
];

const categories = ['Semua', 'Akademik', 'Produktivitas', 'Bisnis'];

// ─── Cartoon Living Study Mascot with Animated Blinking Eyes ───
function BlinkingCartoonMascot() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.85, opacity: 0, y: -10, filter: 'blur(3px)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2"
    >
      {/* Animated Mascot Character */}
      <motion.div
        animate={{ y: [-5, 5, -5], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex-shrink-0"
      >
        {/* Floating Twinkling Stars */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], rotate: [0, 20, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-3 -right-2 z-20 text-amber-400"
        >
          <Sparkles size={20} />
        </motion.div>
        
        <motion.div
          animate={{ y: [-3, 3, -3], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 0.6, ease: 'easeInOut' }}
          className="absolute -bottom-1 -left-3 z-20 text-indigo-400"
        >
          <Sparkles size={16} />
        </motion.div>

        {/* Mascot SVG (Living Smart Book with Graduation Cap & Blinking Eyes) */}
        <svg viewBox="0 0 160 140" width="135" height="118" className="drop-shadow-md select-none">
          {/* Graduation Cap */}
          <g transform="translate(48, 4)">
            <polygon points="32,0 64,12 32,24 0,12" fill="#1e1b4b" stroke="#312e81" strokeWidth="2" />
            <polygon points="12,17 12,28 52,28 52,17" fill="#312e81" />
            <circle cx="32" cy="12" r="3" fill="#f59e0b" />
            <path d="M32,12 Q48,16 52,32" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <circle cx="52" cy="33" r="2.5" fill="#f59e0b" />
          </g>

          {/* Book Spine / Cover Shadow */}
          <rect x="18" y="36" width="12" height="88" rx="6" fill="#4f46e5" />

          {/* Book Body (Clean Modern Study Concept) */}
          <rect x="24" y="32" width="114" height="96" rx="18" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2.5" />
          <rect x="28" y="36" width="106" height="88" rx="14" fill="#ffffff" />
          
          {/* Page Lines (Subtle Concept) */}
          <line x1="38" y1="46" x2="60" y2="46" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          <line x1="38" y1="52" x2="52" y2="52" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

          {/* Ribbon Bookmark */}
          <polygon points="110,32 120,32 120,58 115,53 110,58" fill="#10b981" />

          {/* Rosy Cheeks */}
          <circle cx="48" cy="88" r="7.5" fill="#fda4af" opacity="0.65" />
          <circle cx="112" cy="88" r="7.5" fill="#fda4af" opacity="0.65" />

          {/* Eyebrows */}
          <path d="M50,62 Q59,57 68,61" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M92,61 Q101,57 110,62" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />

          {/* Blinking Left Eye */}
          <motion.g
            animate={{ scaleY: [1, 1, 0.08, 1, 1, 1, 0.08, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.44, 0.47, 0.51, 0.72, 0.88, 0.91, 0.95] }}
            style={{ transformOrigin: '59px 75px' }}
          >
            <ellipse cx="59" cy="75" rx="7.5" ry="10" fill="#0f172a" />
            <circle cx="57" cy="71" r="3" fill="#ffffff" />
            <circle cx="62" cy="77" r="1.5" fill="#ffffff" />
          </motion.g>

          {/* Blinking Right Eye */}
          <motion.g
            animate={{ scaleY: [1, 1, 0.08, 1, 1, 1, 0.08, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.44, 0.47, 0.51, 0.72, 0.88, 0.91, 0.95] }}
            style={{ transformOrigin: '101px 75px' }}
          >
            <ellipse cx="101" cy="75" rx="7.5" ry="10" fill="#0f172a" />
            <circle cx="99" cy="71" r="3" fill="#ffffff" />
            <circle cx="104" cy="77" r="1.5" fill="#ffffff" />
          </motion.g>

          {/* Happy Smile Mouth */}
          <path d="M72,85 Q80,95 88,85" fill="none" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />

          {/* Little Cute Hands */}
          <rect x="8" y="78" width="12" height="18" rx="6" fill="#4f46e5" />
          <rect x="140" y="78" width="12" height="18" rx="6" fill="#4f46e5" />
        </svg>
      </motion.div>

      {/* Mascot Speech Bubble */}
      <div className="text-left bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 max-w-sm relative">
        <div className="flex items-center gap-2 text-xs font-black text-indigo-600 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>StudeBot Siap Menemani!</span>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">Maskot Pintar</span>
        </div>
        <p className="text-xs font-bold text-slate-800 leading-relaxed">
          "Hai! Akses seluruh alat belajar, hitung nilai & kelola kasir bisnismu di sini!"
        </p>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
          <span>📚 12 Alat Siap Pakai</span>
          <span>•</span>
          <span>⚡ MySQL Realtime</span>
        </div>
      </div>
    </motion.div>
  );
}

function HeroDynamicTitle({ onCycleComplete }: { onCycleComplete?: () => void }) {
  const [mode, setMode] = useState<'typing' | 'cartoon'>('typing');
  const [charCount, setCharCount] = useState(0);

  const line1Full = "Platform Alat Belajar & Bisnis";
  const line2Full = "Terintegrasi Penuh.";
  const totalChars = line1Full.length + line2Full.length;

  useEffect(() => {
    let timer: any;

    if (mode === 'typing') {
      if (charCount < totalChars) {
        timer = setTimeout(() => {
          setCharCount(prev => prev + 1);
        }, 38);
      } else {
        // Typing is complete: hold for 3.5s then switch to cartoon
        timer = setTimeout(() => {
          setMode('cartoon');
        }, 3500);
      }
    } else {
      // In cartoon mode: show for 4.5s then call onCycleComplete or restart typing
      timer = setTimeout(() => {
        setCharCount(0);
        setMode('typing');
        if (onCycleComplete) {
          onCycleComplete();
        }
      }, 4500);
    }

    return () => clearTimeout(timer);
  }, [mode, charCount, totalChars, onCycleComplete]);

  const visibleLine1 = line1Full.slice(0, Math.min(charCount, line1Full.length));
  const visibleLine2 = charCount > line1Full.length 
    ? line2Full.slice(0, charCount - line1Full.length) 
    : '';
  const isTypingDone = charCount >= totalChars;

  return (
    <div className="min-h-[140px] sm:min-h-[165px] flex items-center justify-center mb-5">
      <AnimatePresence mode="wait">
        {mode === 'typing' ? (
          <motion.h1
            key="title-typing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(3px)' }}
            transition={{ duration: 0.28 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.18] text-center"
          >
            <span>{visibleLine1}</span>
            {charCount <= line1Full.length && (
              <span className="inline-block w-1 sm:w-1.5 h-7 sm:h-11 bg-indigo-600 ml-1.5 align-middle animate-pulse rounded-full" />
            )}
            <br className="hidden sm:inline" />
            {charCount > line1Full.length && (
              <span className={`text-slate-900 ${isTypingDone ? 'underline decoration-indigo-500/50 underline-offset-8 transition-all' : ''}`}>
                {' '}{visibleLine2}
              </span>
            )}
            {charCount > line1Full.length && !isTypingDone && (
              <span className="inline-block w-1 sm:w-1.5 h-7 sm:h-11 bg-indigo-600 ml-1.5 align-middle animate-pulse rounded-full" />
            )}
          </motion.h1>
        ) : (
          <BlinkingCartoonMascot key="title-mascot" />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage() {
  const { label } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('Semua');
  const [displayMode, setDisplayMode] = useState<'video' | 'title'>('video');
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredApps = apps.filter((app) => {
    const matchesSearch = 
      app.title.toLowerCase().includes(search.toLowerCase()) || 
      app.desc.toLowerCase().includes(search.toLowerCase()) ||
      app.badge.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'Semua' || app.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  // When video ends, transition to UI mode
  const handleVideoEnded = () => {
    setDisplayMode('title');
  };

  // When title/mascot finishes cycle, go back to video mode
  const handleTitleCycleComplete = () => {
    setDisplayMode('video');
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <PageWrapper>
      {/* Hero Banner Fullscreen with Dynamic Video Showcase & Seamless Gradient Fades */}
      <header className={`relative w-full h-[calc(100vh-4rem)] min-h-[560px] flex items-center justify-center overflow-hidden transition-colors duration-700 ${
        displayMode === 'video' ? 'bg-slate-950' : 'bg-slate-50/60 border-b border-slate-200/80'
      }`}>
        <AnimatePresence mode="wait">
          {displayMode === 'video' ? (
            <motion.div
              key="hero-video-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
              transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 w-full h-full flex items-center justify-center"
            >
              {/* Fullscreen Video Element */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                className="w-full h-full object-cover object-center"
              >
                <source src="/animasi3.mp4" type="video/mp4" />
              </video>

              {/* Gradient Blends: Top and Bottom Seamless Transition with Slate-50 Page */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-50 pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-slate-900/80 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent pointer-events-none" />

              {/* Status Badge & Skip to Main UI Button */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-semibold shadow-lg pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Pratinjau Animasi Studetols</span>
              </div>

              <button
                onClick={() => setDisplayMode('title')}
                className="absolute bottom-8 right-8 z-20 px-4 py-2 bg-white/90 hover:bg-white text-slate-900 text-xs font-bold rounded-xl shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 border border-white/40"
              >
                Lewati ke Menu Utama &rarr;
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="hero-ui-mode"
              initial={{ opacity: 0, y: 70, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, filter: 'blur(8px)' }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 text-center"
            >
              {/* Semi-transparent White Background with Smooth Top & Bottom Gradients */}
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm pointer-events-none -z-10" />
              <div className="absolute -top-16 inset-x-0 h-28 bg-gradient-to-b from-white/80 via-white/50 to-transparent pointer-events-none -z-10" />
              <div className="absolute -bottom-16 inset-x-0 h-32 bg-gradient-to-t from-slate-50 via-white/50 to-transparent pointer-events-none -z-10" />
              
              {/* Subtle Ambient Video in Background */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 -top-24 w-full h-[150%] object-cover opacity-35 pointer-events-none -z-20"
              >
                <source src="/animasi.mp4" type="video/mp4" />
              </video>

              {/* Workspace Active Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 mb-6"
              >
                <img src="/logo.jpg" alt="STUDETOLS" className="w-10 h-10 rounded-xl shadow-md object-cover" />
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                  <Sparkles size={13} className="text-indigo-600" />
                  <span>Workspace Aktif: <strong className="text-slate-900">{label}</strong></span>
                </div>
              </motion.div>

              {/* Animated Typwriter & Cartoon Mascot Title */}
              <HeroDynamicTitle onCycleComplete={handleTitleCycleComplete} />

              <motion.p 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed font-normal"
              >
                Akses seluruh kebutuhan produktivitas akademik mulai dari kalkulasi nilai, catatan Cornell,
                timer fokus, kartu hafalan hingga pembukuan kasir dalam satu kontrol terpusat.
              </motion.p>

              {/* Quick Metrics Bar */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-600 font-medium pt-2"
              >
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-slate-200/90 shadow-sm">
                  <Database size={14} className="text-emerald-600" />
                  <span>MySQL Database Terhubung</span>
                </div>
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-slate-200/90 shadow-sm">
                  <Layers size={14} className="text-indigo-600" />
                  <span>12 Modul Terintegrasi</span>
                </div>
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-slate-200/90 shadow-sm">
                  <Zap size={14} className="text-amber-500" />
                  <span>React SPA Responsif</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Apps Catalog */}
      <section className="max-w-7xl mx-auto px-6 py-12" id="aplikasi">
        {/* Search and Category Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Katalog Modul</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pilih aplikasi yang ingin Anda gunakan hari ini.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari modul atau fungsi..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none transition"
              />
            </div>

            {/* Animated Sliding Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              {categories.map((cat) => {
                const isActive = selectedTag === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedTag(cat)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors z-10 ${
                      isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryPill"
                        className="absolute inset-0 bg-slate-900 rounded-xl shadow-sm -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Apps Grid with Compact Cards */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <AnimatePresence>
            {filteredApps.map((app) => {
              const [textColor, bgColor] = app.iconColor.split(' '); // e.g., 'text-emerald-600', 'bg-emerald-50'
              const colorName = textColor.replace('text-', '').replace('-600', ''); // e.g. emerald, amber, indigo, teal, purple, rose, sky, orange

              // Map each color to vibrant glow shadow classes on hover
              const glowClassMap: Record<string, string> = {
                emerald: 'hover:shadow-[0_0_22px_rgba(16,185,129,0.55)] hover:border-emerald-300',
                amber: 'hover:shadow-[0_0_22px_rgba(245,158,11,0.55)] hover:border-amber-300',
                indigo: 'hover:shadow-[0_0_22px_rgba(99,102,241,0.55)] hover:border-indigo-300',
                teal: 'hover:shadow-[0_0_22px_rgba(20,184,166,0.55)] hover:border-teal-300',
                purple: 'hover:shadow-[0_0_22px_rgba(168,85,247,0.55)] hover:border-purple-300',
                rose: 'hover:shadow-[0_0_22px_rgba(244,63,94,0.55)] hover:border-rose-300',
                sky: 'hover:shadow-[0_0_22px_rgba(14,165,233,0.55)] hover:border-sky-300',
                orange: 'hover:shadow-[0_0_22px_rgba(249,115,22,0.55)] hover:border-orange-300',
              };
              const glowClass = glowClassMap[colorName] || 'hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]';

              return (
                <Link
                  key={app.to}
                  to={app.to}
                  className="flex flex-col items-center group relative text-center focus:outline-none"
                  aria-label={app.title}
                >
                  {/* Icon Container with Custom Hover Animations (Scale + Glow) */}
                  <div className="relative group/icon flex items-center justify-center">
                    <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${bgColor} ${textColor} border border-slate-200/80 shadow-sm transition-all duration-300 ease-out group-hover/icon:scale-115 group-hover/icon:-translate-y-1 ${glowClass} cursor-pointer`}>
                      <app.icon size={26} className="transition-transform duration-300 group-hover/icon:rotate-3" />
                    </div>

                    {/* Hover Card Penjelasan: Muncul HANYA saat icon di-hover & pointer-events-none agar tidak menghalangi */}
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3.5 rounded-xl shadow-xl border border-white/40 opacity-0 group-hover/icon:opacity-100 group-hover/icon:scale-100 scale-95 pointer-events-none transition-all duration-200 ${bgColor} bg-opacity-95 text-slate-900 z-30`}>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-xs text-slate-900">{app.title}</h3>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/70 text-slate-700">
                          {app.badge}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600">{app.desc}</p>
                      
                      {/* Tooltip arrow pointing down */}
                      <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-${colorName}-100`} />
                    </div>
                  </div>

                  {/* Title below icon */}
                  <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors w-24 truncate block" title={app.title}>
                    {app.title}
                  </span>
                </Link>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredApps.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center my-6">
            <Compass size={36} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-800 text-sm mb-1">Modul tidak ditemukan</h3>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau pilih kategori lain.</p>
          </div>
        )}
      </section>

      {/* Modern High-Clarity Workflow Section */}
      <section className="bg-white border-t border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Cara Kerja Sistem</h2>
            <p className="text-xs text-slate-500 mt-1">Alur data terenkripsi dan tersimpan di database lokal MySQL Anda.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Autentikasi Akun', desc: 'Login aman menggunakan JWT token berbasis peran pengguna.' },
              { num: '02', title: 'Pilih Modul Belajar', desc: 'Navigasi cepat ke 9 modul produktivitas yang tersedia.' },
              { num: '03', title: 'Interaksi & Input Data', desc: 'Simpan tugas, hitung nilai, atau catat transaksi kasir.' },
              { num: '04', title: 'Sinkronisasi Otomatis', desc: 'Semua perubahan tersimpan permanen per pengguna di MySQL.' },
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                <div className="text-xs font-black text-indigo-600 mb-2 font-mono">{step.num}</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </PageWrapper>
  );
}
