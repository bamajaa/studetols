import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const expenseCategories = ['Makanan & Minuman', 'Transportasi', 'Buku & Alat Tulis', 'Tugas & Fotokopi', 'Internet & Pulsa', 'Lain-lain'];
const incomeCategories = ['Uang Saku', 'Gaji / Magang', 'Hasil Jualan', 'Hadiah / Beasiswa', 'Lain-lain'];

const fmt = (n: number) => 'Rp ' + (Number(n) || 0).toLocaleString('id-ID');

export default function FinancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ totalIncome: 0, totalExpense: 0, balance: 0, categoryBreakdown: [] });
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(expenseCategories[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [list, sum] = await Promise.all([
        api.get('/api/finance'),
        api.get('/api/finance/summary')
      ]);
      setRecords(list);
      setSummary(sum);
    } catch (err) {
      console.error('Gagal memuat catatan keuangan:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setCategory(newType === 'expense' ? expenseCategories[0] : incomeCategories[0]);
  };

  const addRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Masukkan jumlah nominal yang valid');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/finance', {
        type,
        amount: Number(amount),
        category,
        description,
        date
      });
      setAmount('');
      setDescription('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: number) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      await api.delete(`/api/finance/${id}`);
      loadData();
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft size={14} /> Kembali ke Dashboard
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 mb-2">
            <Wallet size={13} /> FinTrack Bisnis & Pelajar
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buku Kas & Uang Saku</h1>
          <p className="text-xs text-slate-500 mt-0.5">Catat pemasukan, kontrol pengeluaran harian, dan pantau saldo bersih Anda.</p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saldo Kas Saat Ini</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {fmt(summary.balance)}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-800">
              {summary.balance >= 0 ? 'Kondisi keuangan sehat' : 'Pengeluaran melebihi pemasukan!'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pemasukan</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowDownLeft size={15} />
                </div>
              </div>
              <div className="text-xl font-black text-emerald-600 mt-1">
                {fmt(summary.totalIncome)}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
              Uang saku, beasiswa, dan hasil jualan
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight size={15} />
                </div>
              </div>
              <div className="text-xl font-black text-rose-600 mt-1">
                {fmt(summary.totalExpense)}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
              Total belanja, tugas, dan transportasi
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Transaction Form */}
          <div className="lg:col-span-1">
            <form onSubmit={addRecord} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                <Plus size={16} className="text-emerald-600" /> Catat Transaksi Baru
              </h3>

              {/* Type Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 25000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {(type === 'expense' ? expenseCategories : incomeCategories).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Keterangan / Catatan</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Beli makan siang di kantin"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 text-white font-bold rounded-xl text-xs transition shadow-sm ${
                    type === 'expense' 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {loading ? 'Menyimpan...' : `Simpan ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
                </button>
              </div>
            </form>

            {/* Category Breakdown */}
            {summary.categoryBreakdown.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-6">
                <h4 className="font-bold text-xs text-slate-900 mb-3 flex items-center gap-1.5">
                  <PieChart size={14} className="text-slate-500" /> Pengeluaran per Kategori
                </h4>
                <div className="space-y-2">
                  {summary.categoryBreakdown.map((item: any) => (
                    <div key={item.category} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">{item.category}</span>
                      <strong className="text-slate-800">{fmt(item.total)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transaction History List */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-4">Riwayat Transaksi Terakhir</h3>

              <div className="space-y-2.5">
                <AnimatePresence>
                  {records.map((r) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-3.5 border border-slate-100 rounded-xl hover:bg-slate-50/70 transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          r.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {r.type === 'income' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">
                            {r.description || r.category}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {r.category} • {r.date}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`font-black text-xs ${
                          r.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {r.type === 'income' ? '+' : '-'} {fmt(r.amount)}
                        </span>
                        <button
                          onClick={() => deleteRecord(r.id)}
                          title="Hapus catatan"
                          className="text-slate-300 hover:text-red-500 transition p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {records.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Belum ada transaksi yang dicatat.<br />
                    Mulai dengan mencatat uang saku atau pengeluaran pertama Anda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
