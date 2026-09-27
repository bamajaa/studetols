import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  Calculator, 
  Shield, 
  LogOut, 
  Plus, 
  Trash2, 
  Menu, 
  X, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  Download,
  Store,
  TrendingUp,
  Edit3,
  Check,
  Coffee,
  UtensilsCrossed,
  Wallet,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Pencil,
  Percent,
  Copy,
  CheckCheck
} from 'lucide-react';

const authH = () => ({ 
  Authorization: 'Bearer ' + (localStorage.getItem('kasir_token') || localStorage.getItem('studetols_token')), 
  'Content-Type': 'application/json' 
});

const fmt = (n: number) => 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');

// ─── Animated Counter Component ───
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => 'Rp ' + Math.round(v).toLocaleString('id-ID'));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 0.6, ease: 'easeOut' });
    return controls.stop;
  }, [value, motionVal]);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [rounded]);

  return <span ref={ref} className={className}>{fmt(value)}</span>;
}

// ─── Cartoon Study Objects (CSS animated SVGs) ───
function FloatingBook({ delay = 0, left = '10%', size = 28 }: { delay?: number; left?: string; size?: number }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ position: 'absolute', left, bottom: '20%' }}
      animate={{ y: [-4, 6, -4], rotate: [-3, 3, -3] }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      <rect x="8" y="12" width="48" height="40" rx="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <rect x="12" y="12" width="4" height="40" fill="#f59e0b" />
      <line x1="22" y1="22" x2="48" y2="22" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="30" x2="44" y2="30" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="22" y1="36" x2="40" y2="36" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </motion.svg>
  );
}

function FloatingPencil({ delay = 0, right = '15%', size = 24 }: { delay?: number; right?: string; size?: number }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ position: 'absolute', right, top: '30%' }}
      animate={{ y: [0, -8, 0], rotate: [10, -5, 10] }}
      transition={{ duration: 3.5, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      <rect x="26" y="6" width="12" height="44" rx="2" fill="#fb923c" stroke="#ea580c" strokeWidth="1.5" transform="rotate(15 32 32)" />
      <polygon points="29,48 35,48 32,58" fill="#fde68a" stroke="#f59e0b" strokeWidth="1" transform="rotate(15 32 32)" />
      <rect x="26" y="6" width="12" height="8" rx="2" fill="#f472b6" stroke="#ec4899" strokeWidth="1" transform="rotate(15 32 32)" />
      <circle cx="32" cy="54" r="1.5" fill="#1e293b" transform="rotate(15 32 32)" />
    </motion.svg>
  );
}

function FloatingRuler({ delay = 0, left = '60%', size = 30 }: { delay?: number; left?: string; size?: number }) {
  return (
    <motion.svg
      viewBox="0 0 80 24"
      width={size * 1.6}
      height={size * 0.5}
      style={{ position: 'absolute', left, bottom: '40%' }}
      animate={{ y: [-3, 5, -3], rotate: [-2, 2, -2] }}
      transition={{ duration: 5, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      <rect x="2" y="2" width="76" height="20" rx="3" fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5" />
      {[12, 22, 32, 42, 52, 62].map((x, i) => (
        <line key={i} x1={x} y1="2" x2={x} y2={i % 2 === 0 ? 10 : 7} stroke="#fff" strokeWidth="1.5" />
      ))}
    </motion.svg>
  );
}

function FloatingStar({ delay = 0, top = '15%', right = '20%', size = 16 }: { delay?: number; top?: string; right?: string; size?: number }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ position: 'absolute', top, right }}
      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5], rotate: [0, 20, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      <polygon
        points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9"
        fill="#fbbf24"
        stroke="#f59e0b"
        strokeWidth="1"
      />
    </motion.svg>
  );
}

function FloatingGlobe({ delay = 0, left = '70%', size = 22 }: { delay?: number; left?: string; size?: number }) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      style={{ position: 'absolute', left, top: '60%' }}
      animate={{ y: [-5, 5, -5], rotate: [0, 360] }}
      transition={{ y: { duration: 4, repeat: Infinity, delay, ease: 'easeInOut' }, rotate: { duration: 20, repeat: Infinity, ease: 'linear' } }}
    >
      <circle cx="24" cy="24" r="20" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="10" ry="20" fill="none" stroke="#0ea5e9" strokeWidth="1.5" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="#0ea5e9" strokeWidth="1" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="#0ea5e9" strokeWidth="1" />
      <path d="M10,14 C18,12 30,12 38,14" fill="none" stroke="#bae6fd" strokeWidth="1" />
      <path d="M10,34 C18,36 30,36 38,34" fill="none" stroke="#bae6fd" strokeWidth="1" />
    </motion.svg>
  );
}

// ─── Stagger Container Variants ───
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.15 } }
};

// ─── Main Component ───
export default function KasirApp() {
  const [page, setPage] = useState('dashboard');
  const [sideOpen, setSideOpen] = useState(false);
  const [label, setLabel] = useState(localStorage.getItem('label') || 'Toko');
  const [role] = useState(localStorage.getItem('role') || 'user');
  
  // Rename state
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(label);
  const editRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [reportId, setReportId] = useState<number | null>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [modalMakanan, setModalMakanan] = useState(0);
  const [modalMinuman, setModalMinuman] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBagiPersenModal, setShowBagiPersenModal] = useState(false);
  const [kalkulatorTab, setKalkulatorTab] = useState<'persen' | 'standar'>('persen');
  const [arsip, setArsip] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // ─── Rename Business Handler ───
  const startRename = () => {
    setEditLabel(label);
    setIsEditing(true);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const saveRename = async () => {
    const trimmed = editLabel.trim();
    if (!trimmed || trimmed === label) {
      setIsEditing(false);
      return;
    }
    try {
      const res = await fetch('/api/kasir/store-name', {
        method: 'PUT',
        headers: authH(),
        body: JSON.stringify({ new_label: trimmed })
      });
      const data = await res.json();
      if (data.success) {
        setLabel(trimmed);
        localStorage.setItem('label', trimmed);
      }
    } catch (err) {
      console.error('Gagal rename:', err);
    }
    setIsEditing(false);
  };

  // ─── Load Report ───
  const loadReport = useCallback(async (dateToLoad = selectedDate) => {
    try {
      const res = await fetch('/api/reports', { 
        method: 'POST', 
        headers: authH(), 
        body: JSON.stringify({ date: dateToLoad }) 
      });
      const data = await res.json();
      setReportId(data.id);
      setModalMakanan(data.modal_makanan || 0);
      setModalMinuman(data.modal_minuman || 0);
      if (data.id) {
        const sRes = await fetch(`/api/sales/report/${data.id}`, { headers: authH() });
        const salesData = await sRes.json();
        setSales(salesData);
      } else {
        setSales([]);
      }
    } catch (err) {
      console.error('Gagal memuat laporan:', err);
    }
  }, [selectedDate]);

  useEffect(() => { 
    loadReport(selectedDate); 
  }, [selectedDate, loadReport]);

  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const addSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    await fetch('/api/sales', { 
      method: 'POST', 
      headers: authH(), 
      body: JSON.stringify({ 
        report_id: reportId, 
        product_name: fd.get('name'), 
        category: fd.get('cat'), 
        qty: Number(fd.get('qty')), 
        price: Number(fd.get('price')) 
      }) 
    });
    form.reset();
    setShowAdd(false);
    loadReport(selectedDate);
  };

  const deleteSale = async (id: number) => { 
    await fetch(`/api/sales/${id}`, { method: 'DELETE', headers: authH() }); 
    loadReport(selectedDate); 
  };

  const updateModal = async () => {
    if (reportId) {
      await fetch(`/api/reports/${reportId}/modal`, { 
        method: 'PUT', 
        headers: authH(), 
        body: JSON.stringify({ modal_makanan: modalMakanan, modal_minuman: modalMinuman }) 
      });
    }
  };

  const omzetMakanan = sales.filter(s => s.category === 'Makanan').reduce((a, s) => a + Number(s.total), 0);
  const omzetMinuman = sales.filter(s => s.category === 'Minuman').reduce((a, s) => a + Number(s.total), 0);
  const omzetTotal = omzetMakanan + omzetMinuman;
  const totalModal = Number(modalMakanan) + Number(modalMinuman);
  const labaBersih = omzetTotal - totalModal;

  const loadArsip = async () => { 
    const res = await fetch('/api/arsip', { headers: authH() }); 
    setArsip(await res.json()); 
  };

  const loadUsers = async () => { 
    const res = await fetch('/api/admin/users', { headers: authH() }); 
    setUsers(await res.json()); 
  };

  useEffect(() => { 
    if (page === 'grafik') loadArsip(); 
    if (page === 'admin') loadUsers(); 
  }, [page]);

  // ─── EXPORT EXCEL (unchanged logic) ───
  const exportDailyExcel = () => {
    const fileName = `Laporan_Kasir_${label.replace(/\s+/g, '_')}_${selectedDate}.xls`;
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th { background-color: #0f172a; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          td { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 12px; }
          .title { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
          .subtitle { font-size: 11px; color: #64748b; margin-bottom: 16px; }
          .summary-header { background-color: #f1f5f9; font-weight: bold; }
          .positive { color: #16a34a; font-weight: bold; }
          .bold { font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        <div class="title">LAPORAN PENJUALAN HARIAN - ${label.toUpperCase()}</div>
        <div class="subtitle">Tanggal: ${selectedDate} | Waktu Ekspor: ${new Date().toLocaleString('id-ID')}</div>
        <h3>1. Ringkasan Keuangan</h3>
        <table>
          <tr class="summary-header"><th>Kategori</th><th>Omzet Penjualan</th><th>Modal Bahan</th><th>Profit Bersih</th></tr>
          <tr><td>Makanan</td><td class="text-right">${fmt(omzetMakanan)}</td><td class="text-right">${fmt(modalMakanan)}</td><td class="text-right positive">${fmt(omzetMakanan - modalMakanan)}</td></tr>
          <tr><td>Minuman</td><td class="text-right">${fmt(omzetMinuman)}</td><td class="text-right">${fmt(modalMinuman)}</td><td class="text-right positive">${fmt(omzetMinuman - modalMinuman)}</td></tr>
          <tr class="summary-header"><td><strong>TOTAL</strong></td><td class="text-right"><strong>${fmt(omzetTotal)}</strong></td><td class="text-right"><strong>${fmt(totalModal)}</strong></td><td class="text-right positive"><strong>${fmt(labaBersih)}</strong></td></tr>
        </table>
        <h3>2. Rincian Transaksi</h3>
        <table>
          <thead><tr><th class="text-center" style="width:40px">No</th><th>Nama Produk</th><th>Kategori</th><th class="text-center" style="width:60px">Qty</th><th class="text-right">Harga Satuan</th><th class="text-right">Total</th></tr></thead>
          <tbody>`;
    if (sales.length === 0) {
      html += `<tr><td colspan="6" class="text-center" style="color:#94a3b8">Belum ada item penjualan.</td></tr>`;
    } else {
      sales.forEach((s, idx) => {
        html += `<tr><td class="text-center">${idx+1}</td><td class="bold">${s.product_name}</td><td>${s.category}</td><td class="text-center">${s.qty}</td><td class="text-right">${fmt(s.price)}</td><td class="text-right bold">${fmt(s.total)}</td></tr>`;
      });
    }
    html += `</tbody></table><br><br>
        <table><tr><td style="border:none" class="text-center">Kasir Bertugas,<br><br><br><strong>(${label})</strong></td><td style="border:none" class="text-center">Pemilik Toko,<br><br><br><strong>(____________________)</strong></td></tr></table>
      </body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = fileName; link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const exportArchiveExcel = async () => {
    const res = await fetch('/api/arsip', { headers: authH() });
    const archiveData = await res.json();
    const fileName = `Rekap_Arsip_Bulanan_${label.replace(/\s+/g, '_')}.xls`;
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <style>body{font-family:Arial}table{border-collapse:collapse;width:100%;margin-bottom:20px}th{background:#0f172a;color:#fff;font-weight:bold;border:1px solid #cbd5e1;padding:8px;text-align:left}td{border:1px solid #e2e8f0;padding:6px 8px;font-size:12px}.title{font-size:16px;font-weight:bold;color:#0f172a}.positive{color:#16a34a;font-weight:bold}.bold{font-weight:bold}.text-right{text-align:right}.text-center{text-align:center}</style>
      </head><body>
      <div class="title">REKAPITULASI ARSIP PENJUALAN - ${label.toUpperCase()}</div>
      <p>Total Arsip Hari: ${archiveData.length} Hari | Dicetak: ${new Date().toLocaleString('id-ID')}</p>
      <table><thead><tr><th class="text-center">No</th><th>Tanggal</th><th class="text-right">Total Omzet</th><th class="text-right">Total Modal</th><th class="text-right">Profit</th><th class="text-center">Margin</th></tr></thead><tbody>`;
    let tO = 0, tM = 0;
    archiveData.forEach((a: any, idx: number) => {
      const omzet = Number(a.omzet_total) || 0;
      const modal = (Number(a.modal_makanan) || 0) + (Number(a.modal_minuman) || 0);
      const profit = omzet - modal;
      const margin = omzet > 0 ? Math.round((profit / omzet) * 100) : 0;
      tO += omzet; tM += modal;
      html += `<tr><td class="text-center">${idx+1}</td><td class="bold">${a.date}</td><td class="text-right">${fmt(omzet)}</td><td class="text-right">${fmt(modal)}</td><td class="text-right positive">${fmt(profit)}</td><td class="text-center">${margin}%</td></tr>`;
    });
    const tP = tO - tM;
    html += `<tr style="background:#f8fafc;font-weight:bold"><td colspan="2" class="text-center"><strong>TOTAL</strong></td><td class="text-right"><strong>${fmt(tO)}</strong></td><td class="text-right"><strong>${fmt(tM)}</strong></td><td class="text-right positive"><strong>${fmt(tP)}</strong></td><td class="text-center"><strong>${tO>0?Math.round((tP/tO)*100):0}%</strong></td></tr></tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = fileName; link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard Penjualan' },
    { id: 'grafik', icon: BarChart3, label: 'Grafik & Arsip' },
    { id: 'kalkulator', icon: Calculator, label: 'Kalkulator' },
    ...(role === 'admin' ? [{ id: 'admin', icon: Shield, label: 'Admin Panel' }] : []),
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* ══════ SIDEBAR ══════ */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transform transition-transform lg:translate-x-0 lg:static ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header with rename */}
        <div className="relative p-5 border-b border-slate-800 overflow-hidden">
          {/* Subtle floating objects in sidebar */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
            <FloatingStar delay={0} top="10%" right="10%" size={14} />
            <FloatingStar delay={1.2} top="70%" right="60%" size={10} />
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-emerald-500/25 flex-shrink-0"
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              SB
            </motion.div>
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                    <input
                      ref={editRef}
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setIsEditing(false); }}
                      className="bg-slate-800 text-white text-sm font-bold px-2 py-1 rounded-lg border border-emerald-500/50 outline-none w-full focus:ring-1 focus:ring-emerald-400"
                      maxLength={30}
                    />
                    <button onClick={saveRename} className="p-1 text-emerald-400 hover:text-emerald-300 transition flex-shrink-0">
                      <Check size={14} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm tracking-tight text-white truncate">{label}</h3>
                      <button 
                        onClick={startRename} 
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-emerald-400 transition"
                        title="Ubah nama toko"
                      >
                        <Pencil size={11} />
                      </button>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Stude Bizz Kasir</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="py-4 space-y-0.5 px-2">
          {menuItems.map(m => {
            const active = page === m.id;
            return (
              <motion.button 
                key={m.id} 
                onClick={() => { setPage(m.id); setSideOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-colors relative ${
                  active 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/10 rounded-xl border-l-[3px] border-emerald-400"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <m.icon size={16} className="relative z-10" /> 
                <span className="relative z-10">{m.label}</span>
              </motion.button>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-slate-800">
            <Link 
              to="/dashboard" 
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <LogOut size={16} /> Kembali ke Menu Utama
            </Link>
          </div>
        </nav>

        {/* Sidebar decoration */}
        <div className="relative mt-auto p-4 opacity-20 pointer-events-none" style={{ height: 120 }}>
          <FloatingBook delay={0} left="10%" size={26} />
          <FloatingPencil delay={0.8} right="10%" size={22} />
          <FloatingRuler delay={1.5} left="25%" size={24} />
        </div>
      </aside>

      {sideOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* ══════ MAIN CONTENT ══════ */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-emerald-400" />
            <span className="font-bold text-sm">{label}</span>
          </div>
          <button onClick={() => setSideOpen(!sideOpen)}>{sideOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>

        <div className="p-6 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {/* ══════ DASHBOARD ══════ */}
            {page === 'dashboard' && (
              <motion.div key="dashboard" initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} variants={stagger}>
                {/* Hero Header with floating decorations */}
                <motion.div variants={fadeUp} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm overflow-hidden">
                  {/* Subtle decorations */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
                    <FloatingBook delay={0.2} left="75%" size={40} />
                    <FloatingGlobe delay={1} left="85%" size={30} />
                  </div>
                  
                  <div className="relative z-10">
                    <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-500" />
                      Dashboard Penjualan
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola transaksi, modal, dan unduh laporan kasir.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 relative z-10">
                    {/* Date Selector */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                      <motion.button 
                        onClick={() => changeDateByDays(-1)} 
                        title="Hari Sebelumnya"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
                        whileTap={{ scale: 0.85 }}
                      >
                        <ChevronLeft size={14} />
                      </motion.button>
                      <div className="flex items-center gap-1.5 px-2">
                        <Calendar size={13} className="text-emerald-600" />
                        <input 
                          type="date" 
                          value={selectedDate} 
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                        />
                      </div>
                      <motion.button 
                        onClick={() => changeDateByDays(1)} 
                        title="Hari Berikutnya"
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition"
                        whileTap={{ scale: 0.85 }}
                      >
                        <ChevronRight size={14} />
                      </motion.button>
                    </div>

                    {selectedDate !== todayStr && (
                      <motion.button
                        onClick={() => setSelectedDate(todayStr)}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl border border-emerald-200 transition"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        Hari Ini
                      </motion.button>
                    )}

                    {/* Quick Bagi Persen Button */}
                    <motion.button
                      onClick={() => setShowBagiPersenModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      title="Kalkulator Hitung Angka Dibagi Persen"
                    >
                      <Percent size={13} className="text-indigo-600" />
                      Hitung Bagi Persen
                    </motion.button>

                    <motion.button
                      onClick={() => setShowExportModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-600/20 transition"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FileSpreadsheet size={14} />
                      Ekspor Excel
                    </motion.button>
                  </div>
                </motion.div>

                {/* Status Bar */}
                <motion.div variants={fadeUp} className="flex items-center justify-between mb-5 px-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <motion.span 
                      className="w-2 h-2 rounded-full bg-emerald-500"
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span>Laporan: <strong className="text-slate-900">{selectedDate}</strong></span>
                    {selectedDate === todayStr ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Clock size={9} /> Hari Ini
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">Arsip Tanggal</span>
                    )}
                  </div>
                </motion.div>

                {/* ─── Summary Cards ─── */}
                <motion.div variants={stagger} className="grid sm:grid-cols-3 gap-4 mb-6">
                  {/* Profit Makanan */}
                  <motion.div variants={fadeUp} className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-full opacity-60" />
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                          <UtensilsCrossed size={15} />
                        </div>
                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Profit Makanan</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        Omzet: {fmt(omzetMakanan)}
                      </span>
                    </div>
                    <div className="space-y-3 relative z-10">
                      <div>
                        <label className="text-[11px] text-slate-500 font-medium">Input Modal:</label>
                        <input 
                          type="number" 
                          value={modalMakanan} 
                          onChange={e => setModalMakanan(Number(e.target.value))} 
                          onBlur={updateModal} 
                          className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-400 outline-none transition" 
                          placeholder="0"
                        />
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          {omzetMakanan - modalMakanan >= 0 ? <ArrowUpRight size={12} className="text-emerald-500" /> : <ArrowDownRight size={12} className="text-red-500" />}
                          Laba Bersih:
                        </span>
                        <AnimatedNumber value={omzetMakanan - modalMakanan} className={`text-base font-extrabold ${omzetMakanan - modalMakanan >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Profit Minuman */}
                  <motion.div variants={fadeUp} className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-sky-50 to-transparent rounded-bl-full opacity-60" />
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                          <Coffee size={15} />
                        </div>
                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Profit Minuman</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        Omzet: {fmt(omzetMinuman)}
                      </span>
                    </div>
                    <div className="space-y-3 relative z-10">
                      <div>
                        <label className="text-[11px] text-slate-500 font-medium">Input Modal:</label>
                        <input 
                          type="number" 
                          value={modalMinuman} 
                          onChange={e => setModalMinuman(Number(e.target.value))} 
                          onBlur={updateModal} 
                          className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-sky-400 outline-none transition" 
                          placeholder="0"
                        />
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          {omzetMinuman - modalMinuman >= 0 ? <ArrowUpRight size={12} className="text-emerald-500" /> : <ArrowDownRight size={12} className="text-red-500" />}
                          Laba Bersih:
                        </span>
                        <AnimatedNumber value={omzetMinuman - modalMinuman} className={`text-base font-extrabold ${omzetMinuman - modalMinuman >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Total Profit Card */}
                  <motion.div variants={fadeUp} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
                    {/* Animated accent line */}
                    <motion.div 
                      className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"
                      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute top-2 right-3 opacity-10">
                      <Wallet size={48} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <TrendingUp size={15} />
                        </div>
                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total Keuntungan</h4>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Total Omzet:</span>
                          <strong className="text-white">{fmt(omzetTotal)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Modal:</span>
                          <strong className="text-white">{fmt(totalModal)}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Profit Bersih Akhir:</span>
                      <div className="text-2xl font-black text-emerald-400 mt-0.5">
                        <AnimatedNumber value={labaBersih} className="text-2xl font-black text-emerald-400" />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* ─── Sales Table ─── */}
                <motion.div variants={fadeUp} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Package size={15} className="text-slate-400" />
                        Rincian Penjualan 
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{sales.length} item</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Produk terjual pada {selectedDate}.</p>
                    </div>
                    <motion.button 
                      onClick={() => setShowAdd(true)} 
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus size={14} /> Tambah Transaksi
                    </motion.button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-slate-400 uppercase font-bold border-b border-slate-100 text-[10px]">
                          <th className="pb-2.5">Produk</th>
                          <th className="pb-2.5">Kategori</th>
                          <th className="pb-2.5">Qty</th>
                          <th className="pb-2.5">Harga</th>
                          <th className="pb-2.5">Total</th>
                          <th className="pb-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <AnimatePresence>
                          {sales.map((s, idx) => (
                            <motion.tr 
                              key={s.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.03 } }}
                              exit={{ opacity: 0, x: 10, transition: { duration: 0.15 } }}
                              className="hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="py-2.5 font-bold text-slate-800">{s.product_name}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.category === 'Makanan' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-sky-50 text-sky-700 border border-sky-100'
                                }`}>
                                  {s.category}
                                </span>
                              </td>
                              <td className="font-semibold text-slate-700">{s.qty}</td>
                              <td className="text-slate-600">{fmt(s.price)}</td>
                              <td className="font-bold text-slate-900">{fmt(s.total)}</td>
                              <td className="text-right">
                                <motion.button 
                                  onClick={() => deleteSale(s.id)} 
                                  title="Hapus baris"
                                  className="text-slate-300 hover:text-red-500 p-1 transition"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.8 }}
                                >
                                  <Trash2 size={13} />
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                        {sales.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-400">
                              <div className="flex flex-col items-center gap-3">
                                <div className="relative w-16 h-16">
                                  <FloatingBook delay={0} left="20%" size={30} />
                                  <FloatingStar delay={0.5} top="0" right="5%" size={14} />
                                </div>
                                <div className="mt-4">
                                  <p className="font-semibold text-slate-500">Belum ada catatan penjualan</p>
                                  <p className="text-[11px] mt-0.5">Klik <strong>+ Tambah Transaksi</strong> untuk mulai mencatat.</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* ─── Add Transaction Modal ─── */}
                <AnimatePresence>
                  {showAdd && (
                    <motion.div 
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowAdd(false)}
                    >
                      <motion.div 
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100"
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                              <Plus size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Tambah Penjualan ({selectedDate})</h3>
                          </div>
                          <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
                        </div>
                        <form onSubmit={addSale} className="space-y-3.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Nama Produk / Minuman</label>
                            <input name="name" required placeholder="Contoh: Nasi Bakar / Es Teh" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-400 font-medium transition" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Kategori</label>
                              <select name="cat" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-400 font-medium transition">
                                <option value="Makanan">Makanan</option>
                                <option value="Minuman">Minuman</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Jumlah (Qty)</label>
                              <input name="qty" type="number" min="1" defaultValue="1" required className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-400 font-medium transition" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Harga Satuan (Rp)</label>
                            <input name="price" type="number" step="100" required placeholder="Contoh: 5000" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-400 font-medium transition" />
                          </div>
                          <div className="flex gap-2.5 pt-3">
                            <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition">Batal</button>
                            <motion.button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm" whileTap={{ scale: 0.95 }}>
                              Simpan Transaksi
                            </motion.button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ─── Export Excel Modal ─── */}
                <AnimatePresence>
                  {showExportModal && (
                    <motion.div 
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowExportModal(false)}
                    >
                      <motion.div 
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100"
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                              <FileSpreadsheet size={16} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900">Auto Export Excel</h3>
                          </div>
                          <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
                        </div>

                        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                          Pilih format unduhan (.xls) yang siap dibuka di Microsoft Excel atau Google Sheets:
                        </p>

                        <div className="space-y-3">
                          <motion.button
                            onClick={exportDailyExcel}
                            className="w-full p-4 text-left border border-slate-200 hover:border-emerald-400 rounded-xl hover:bg-emerald-50/50 transition group flex items-start gap-3"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                              <Download size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition">
                                Unduh Laporan Tanggal {selectedDate}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Rekap omzet, modal, laba bersih, dan tabel item produk.
                              </div>
                            </div>
                          </motion.button>

                          <motion.button
                            onClick={exportArchiveExcel}
                            className="w-full p-4 text-left border border-slate-200 hover:border-indigo-400 rounded-xl hover:bg-indigo-50/50 transition group flex items-start gap-3"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                              <BarChart3 size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-700 transition">
                                Unduh Rekap Seluruh Arsip
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Riwayat rekapitulasi harian, total omzet, total modal, dan margin.
                              </div>
                            </div>
                          </motion.button>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 text-right">
                          <button onClick={() => setShowExportModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition">
                            Tutup
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ─── MODAL HITUNG BAGI PERSEN ─── */}
                <AnimatePresence>
                  {showBagiPersenModal && (
                    <motion.div 
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowBagiPersenModal(false)}
                    >
                      <motion.div 
                        className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto"
                        variants={scaleIn}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                              <Percent size={18} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">Kalkulator Bagi Persen & Bisnis</h3>
                              <p className="text-[11px] text-slate-400">Hitung nilai dibagi persen (misal: Rp 20.000 ÷ 50% = Rp 40.000)</p>
                            </div>
                          </div>
                          <button onClick={() => setShowBagiPersenModal(false)} className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-xl hover:bg-slate-100">
                            <X size={18} />
                          </button>
                        </div>

                        <BagiPersenCalculator isModal onClose={() => setShowBagiPersenModal(false)} />

                        <div className="mt-5 pt-3 border-t border-slate-100 text-right">
                          <button
                            onClick={() => setShowBagiPersenModal(false)}
                            className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
                          >
                            Tutup
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ══════ GRAFIK & ARSIP ══════ */}
            {page === 'grafik' && (
              <motion.div key="grafik" initial="hidden" animate="visible" variants={stagger}>
                <motion.div variants={fadeUp} className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <BarChart3 size={18} className="text-indigo-500" />
                      Grafik & Arsip Penjualan
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Histori omzet dan profit seluruh tanggal operasional.</p>
                  </div>
                  <motion.button
                    onClick={exportArchiveExcel}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileSpreadsheet size={14} />
                    Ekspor Seluruh Arsip
                  </motion.button>
                </motion.div>

                <motion.div variants={fadeUp} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-slate-400 uppercase font-bold border-b border-slate-100 text-[10px]">
                          <th className="pb-2.5">Tanggal</th>
                          <th className="pb-2.5">Total Omzet</th>
                          <th className="pb-2.5">Total Modal</th>
                          <th className="pb-2.5">Profit Bersih</th>
                          <th className="pb-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <AnimatePresence>
                          {arsip.map((a, idx) => {
                            const omzet = Number(a.omzet_total) || 0;
                            const modal = (Number(a.modal_makanan) || 0) + (Number(a.modal_minuman) || 0);
                            const profit = omzet - modal;
                            return (
                              <motion.tr 
                                key={a.id} 
                                className="hover:bg-slate-50/80 transition-colors"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.04 } }}
                              >
                                <td className="py-2.5 font-bold text-slate-800">{a.date}</td>
                                <td className="font-semibold text-slate-700">{fmt(omzet)}</td>
                                <td className="text-slate-600">{fmt(modal)}</td>
                                <td className={`font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  <span className="flex items-center gap-1">
                                    {profit >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                                    {fmt(profit)}
                                  </span>
                                </td>
                                <td className="text-right">
                                  <motion.button
                                    onClick={() => { setSelectedDate(a.date); setPage('dashboard'); }}
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Buka →
                                  </motion.button>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                        {arsip.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-10 text-slate-400">
                              <div className="flex flex-col items-center gap-2">
                                <BarChart3 size={28} className="text-slate-300" />
                                <p className="font-semibold">Belum ada arsip tersimpan.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ══════ KALKULATOR ══════ */}
            {page === 'kalkulator' && (
              <motion.div key="kalkulator" initial="hidden" animate="visible" variants={stagger}>
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 mb-0.5 flex items-center gap-2">
                      <Calculator size={18} className="text-indigo-600" />
                      Kalkulator & Analisis Kasir
                    </h2>
                    <p className="text-xs text-slate-500">Hitung bagi persen bisnis, markup harga, serta kembalian belanja.</p>
                  </div>

                  {/* Sub-Tabs Switcher */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setKalkulatorTab('persen')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        kalkulatorTab === 'persen'
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Percent size={13} className="text-indigo-600" />
                      Bagi Persen & Bisnis
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-black">Baru</span>
                    </button>
                    <button
                      onClick={() => setKalkulatorTab('standar')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        kalkulatorTab === 'standar'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Calculator size={13} />
                      Kalkulator Standar
                    </button>
                  </div>
                </motion.div>

                {kalkulatorTab === 'persen' ? (
                  <motion.div variants={fadeUp} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm max-w-3xl">
                    <BagiPersenCalculator />
                  </motion.div>
                ) : (
                  <motion.div variants={fadeUp} className="bg-white border border-slate-200/80 rounded-2xl p-6 max-w-sm shadow-sm">
                    <CalcWidget />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ══════ ADMIN ══════ */}
            {page === 'admin' && (
              <motion.div key="admin" initial="hidden" animate="visible" variants={stagger}>
                <motion.div variants={fadeUp}>
                  <h2 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
                    <Shield size={18} className="text-rose-500" />
                    Admin Panel Pengguna
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">Kelola akun kasir dan access key.</p>
                </motion.div>
                <motion.div variants={fadeUp} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-slate-400 uppercase font-bold border-b border-slate-100 text-[10px]">
                          <th className="pb-2.5">Access Key</th>
                          <th className="pb-2.5">Nama Toko</th>
                          <th className="pb-2.5">Status</th>
                          <th className="pb-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        <AnimatePresence>
                          {users.map((u, idx) => (
                            <motion.tr 
                              key={u.id} 
                              className="hover:bg-slate-50/80 transition-colors"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.04 } }}
                            >
                              <td className="py-2.5 font-mono text-xs font-bold text-slate-800">{u.access_key}</td>
                              <td className="font-semibold text-slate-800">{u.label}</td>
                              <td>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  u.status === 'aktif' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                                }`}>
                                  {u.status}
                                </span>
                              </td>
                              <td className="text-right space-x-2 py-2">
                                <motion.button 
                                  onClick={async () => { 
                                    await fetch(`/api/admin/users/${u.id}/status`, { 
                                      method: 'PUT', 
                                      headers: authH(), 
                                      body: JSON.stringify({ status: u.status === 'aktif' ? 'nonaktif' : 'aktif' }) 
                                    }); 
                                    loadUsers(); 
                                  }} 
                                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                                  whileTap={{ scale: 0.9 }}
                                >
                                  Toggle
                                </motion.button>
                                <motion.button 
                                  onClick={async () => { 
                                    if (confirm('Hapus akun kasir ini?')) { 
                                      await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE', headers: authH() }); 
                                      loadUsers(); 
                                    } 
                                  }} 
                                  className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline"
                                  whileTap={{ scale: 0.9 }}
                                >
                                  Hapus
                                </motion.button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Kalkulator Bagi Persen & Kalkulasi Bisnis ───
function BagiPersenCalculator({ isModal, onClose }: { isModal?: boolean; onClose?: () => void }) {
  const [angka, setAngka] = useState<string>('20000');
  const [persen, setPersen] = useState<string>('50');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ angka: number; persen: number; hasil: number; time: string }>>([
    { angka: 20000, persen: 50, hasil: 40000, time: 'Contoh' }
  ]);

  const numAngka = Math.max(0, Number(angka) || 0);
  const numPersen = Number(persen) || 0;

  // Rumus utama: Angka dibagi berapa persen (contoh 20000 / 50% = 40000)
  const hasilBagiPersen = numPersen > 0 ? numAngka / (numPersen / 100) : 0;
  
  // Analisis porsi & harga terkait
  const nilaiPorsi = numAngka * (numPersen / 100);
  const hargaMarkup = numAngka + nilaiPorsi;
  const hargaDiskon = Math.max(0, numAngka - nilaiPorsi);

  const copyVal = (val: number, key: string) => {
    navigator.clipboard.writeText(String(Math.round(val)));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleSimpanRiwayat = () => {
    if (numAngka <= 0 || numPersen <= 0) return;
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setHistory(prev => [{ angka: numAngka, persen: numPersen, hasil: hasilBagiPersen, time: timeStr }, ...prev.slice(0, 4)]);
  };

  const presets = [5, 10, 15, 20, 25, 30, 40, 50, 70, 75, 100];

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <div className="grid sm:grid-cols-2 gap-3.5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Nominal Angka / Biaya (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
            <input
              type="number"
              value={angka}
              onChange={(e) => setAngka(e.target.value)}
              placeholder="20000"
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
            Nilai awal: <strong className="text-slate-700">{fmt(numAngka)}</strong>
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Persen Pembagi (%)
            </label>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Dibagi: {numPersen}%
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              value={persen}
              onChange={(e) => setPersen(e.target.value)}
              placeholder="50"
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">%</span>
          </div>
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1 mt-2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPersen(String(p))}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  numPersen === p
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Result Card (Hasil Bagi Persen) */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden border border-indigo-900/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                <Percent size={11} /> HASIL BAGI PERSEN (Nilai ÷ %)
              </span>
            </div>
            <div className="text-2xl sm:text-4xl font-black text-emerald-400 tracking-tight">
              {fmt(hasilBagiPersen)}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-2 flex flex-wrap items-center gap-2">
              <span className="text-slate-400">Rumus:</span>
              <code className="bg-white/10 px-2 py-0.5 rounded-md font-mono text-emerald-300 text-xs font-bold">
                {numAngka.toLocaleString('id-ID')} ÷ {numPersen}% = {Math.round(hasilBagiPersen).toLocaleString('id-ID')}
              </code>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => copyVal(hasilBagiPersen, 'bagi')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              {copiedKey === 'bagi' ? <CheckCheck size={14} /> : <Copy size={14} />}
              <span>{copiedKey === 'bagi' ? 'Tersalin!' : 'Salin Hasil'}</span>
            </motion.button>
            <button
              onClick={handleSimpanRiwayat}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-bold rounded-lg transition"
            >
              + Simpan Riwayat
            </button>
          </div>
        </div>

        {/* Business Insight Note */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed bg-white/5 rounded-xl p-3">
          <strong className="text-white">Penjelasan Bisnis:</strong>{' '}
          Jika nilai modal/biaya <strong className="text-emerald-300">{fmt(numAngka)}</strong> adalah{' '}
          <strong className="text-emerald-300">{numPersen}%</strong> dari omzet yang ditargetkan, maka target omzet
          atau patokan 100% adalah <strong className="text-emerald-300">{fmt(hasilBagiPersen)}</strong>.
        </div>
      </div>

      {/* Secondary Cards Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wider">
          Kalkulasi Terkait Lainnya (Sekali Input)
        </h4>
        <div className="grid sm:grid-cols-3 gap-3">
          {/* Card 1: Nilai Porsi */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Nilai Porsi ({numPersen}% × Nilai)
            </span>
            <div className="text-base font-extrabold text-slate-900">
              {fmt(nilaiPorsi)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
              <span className="text-slate-400">Porsi {numPersen}%</span>
              <button
                onClick={() => copyVal(nilaiPorsi, 'porsi')}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                {copiedKey === 'porsi' ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          </div>

          {/* Card 2: Markup */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Harga + Markup (+{numPersen}%)
            </span>
            <div className="text-base font-extrabold text-indigo-600">
              {fmt(hargaMarkup)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
              <span className="text-slate-400">Nilai + {numPersen}%</span>
              <button
                onClick={() => copyVal(hargaMarkup, 'markup')}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                {copiedKey === 'markup' ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          </div>

          {/* Card 3: Diskon */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Harga Setelah Diskon (-{numPersen}%)
            </span>
            <div className="text-base font-extrabold text-amber-600">
              {fmt(hargaDiskon)}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
              <span className="text-slate-400">Nilai - {numPersen}%</span>
              <button
                onClick={() => copyVal(hargaDiskon, 'diskon')}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
              >
                {copiedKey === 'diskon' ? 'Tersalin' : 'Salin'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-600">Riwayat Hitungan Sesi Ini</span>
            <span className="text-[10px] text-slate-400">{history.length} catatan</span>
          </div>
          <div className="space-y-1.5">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs bg-white px-3 py-2 rounded-lg border border-slate-200/60"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">{h.time}</span>
                  <span className="font-semibold text-slate-800">
                    {fmt(h.angka)} ÷ {h.persen}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600">{fmt(h.hasil)}</span>
                  <button
                    onClick={() => {
                      setAngka(String(h.angka));
                      setPersen(String(h.persen));
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                  >
                    Gunakan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Calculator Widget ───
function CalcWidget() {
  const [display, setDisplay] = useState('0');
  
  const safeCalculate = (expr: string) => {
    try {
      const sanitized = expr.replace(/%/g, '*0.01');
      if (!/^[0-9+\-*/. ]+$/.test(sanitized)) return 'Error';
      const result = new Function(`return (${sanitized})`)();
      return isFinite(result) ? String(Math.round(result * 1000) / 1000) : 'Error';
    } catch {
      return 'Error';
    }
  };

  const click = (v: string) => {
    if (v === 'C') { setDisplay('0'); return; }
    if (v === 'DEL') { setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0'); return; }
    if (v === '=') { setDisplay(safeCalculate(display)); return; }
    setDisplay(d => d === '0' || d === 'Error' ? v : d + v);
  };

  const btns = ['C', 'DEL', '%', '/', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'];
  
  return (
    <div>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white text-right text-2xl font-mono p-4 rounded-xl mb-3 min-h-[60px] flex items-center justify-end font-bold shadow-inner">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {btns.map(b => (
          <motion.button 
            key={b} 
            onClick={() => click(b)} 
            className={`py-3 rounded-xl font-bold text-xs transition ${
              b === '=' 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 col-span-1 shadow-sm' 
                : b === 'C' 
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' 
                : b === '0' 
                ? 'col-span-2 bg-slate-100 text-slate-800 hover:bg-slate-200' 
                : '+-*/%'.includes(b) || b === 'DEL' 
                ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300' 
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
            whileTap={{ scale: 0.9 }}
          >
            {b === '/' ? '÷' : b}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
