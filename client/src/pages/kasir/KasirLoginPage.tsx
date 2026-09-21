import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowLeft, LogIn, UserPlus } from 'lucide-react';

export default function KasirLoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [accessKey, setAccessKey] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (tab === 'register') {
      if (!storeName || !accessKey) { setError('Nama toko dan key wajib diisi'); return; }
      try {
        const res = await fetch('/api/kasir/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: accessKey, label: storeName }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTab('login'); setError('');
      } catch (err: any) { setError(err.message); }
      return;
    }
    try {
      const res = await fetch('/api/kasir/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ access_key: accessKey }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('kasir_token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('label', data.label);
      navigate('/kasir/app');
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 border border-slate-200">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-3"><Store size={22} /></div>
          <h2 className="text-xl font-bold text-slate-900">Akun Stude Bizz</h2>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button onClick={() => setTab('login')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><LogIn size={14} /> Login</button>
          <button onClick={() => setTab('register')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><UserPlus size={14} /> Buat Akun</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nama Toko</label>
              <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Masukkan nama toko" />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Access Token</label>
            <input type="password" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="Masukkan token" />
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-600/25 transition text-sm">
            {tab === 'login' ? 'Masuk & Buka Toko' : 'Daftar Akun Baru'}
          </button>
          {error && <p className="text-xs text-center text-red-500 font-medium">{error}</p>}
        </form>
        <Link to="/dashboard" className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 hover:text-slate-700 transition"><ArrowLeft size={14} /> Kembali ke Dashboard</Link>
      </div>
    </div>
  );
}
