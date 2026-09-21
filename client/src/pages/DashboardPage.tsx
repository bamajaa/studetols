import { useState } from 'react';
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
  Zap
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
    tag: 'Belajar',
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
    tag: 'Belajar',
    badge: 'Print & TXT',
    accent: 'hover:border-emerald-500/60 hover:shadow-emerald-500/5',
    iconColor: 'text-emerald-600 bg-emerald-50'
  },
  { 
    to: '/bookmarks', 
    icon: Bookmark, 
    title: 'Resource Bookmarks', 
    desc: 'Koleksi link referensi belajar, modul PDF, dan website penting dengan filter kategori instan.', 
    tag: 'Referensi',
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
];

const categories = ['Semua', 'Akademik', 'Produktivitas', 'Belajar', 'Bisnis', 'Referensi'];

export default function DashboardPage() {
  const { label } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('Semua');

  const filteredApps = apps.filter((app) => {
    const matchesSearch = 
      app.title.toLowerCase().includes(search.toLowerCase()) || 
      app.desc.toLowerCase().includes(search.toLowerCase()) ||
      app.badge.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'Semua' || app.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <PageWrapper>
      {/* Hero Banner with Modern Clean Typography */}
      <header className="relative bg-white border-b border-slate-200/80 pt-10 pb-16 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        />
        
        <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 mb-6"
          >
            <Sparkles size={13} className="text-indigo-600" />
            <span>Workspace Aktif: <strong className="text-slate-900">{label}</strong></span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5"
          >
            Platform Alat Belajar & Bisnis <br className="hidden sm:inline" />
            <span className="text-slate-900 underline decoration-indigo-500/50 underline-offset-8">
              Terintegrasi Penuh.
            </span>
          </motion.h1>

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
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium pt-2"
          >
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
              <Database size={14} className="text-emerald-600" />
              <span>MySQL Database Terhubung</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
              <Layers size={14} className="text-indigo-600" />
              <span>9 Modul Lengkap</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
              <Zap size={14} className="text-amber-500" />
              <span>React SPA Responsif</span>
            </div>
          </motion.div>
        </div>
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

            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedTag(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedTag === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Apps Grid with Smooth Card Transitions */}
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredApps.map((app, idx) => (
              <motion.div
                key={app.to}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className={`group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${app.accent}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${app.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                      <app.icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
                      {app.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                    {app.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-6 font-normal">
                    {app.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Kategori: <span className="text-slate-700">{app.tag}</span>
                  </span>
                  <Link
                    to={app.to}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors"
                  >
                    Buka Modul
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
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
