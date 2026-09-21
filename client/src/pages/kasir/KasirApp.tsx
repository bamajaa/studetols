import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Home, BarChart3, Calculator, Shield, LogOut, Plus, Trash2, Menu, X, Edit2 } from 'lucide-react';

const authH = () => ({ Authorization: 'Bearer ' + localStorage.getItem('kasir_token'), 'Content-Type': 'application/json' });
const fmt = (n: number) => 'Rp' + n.toLocaleString('id-ID');

export default function KasirApp() {
  const [page, setPage] = useState('dashboard');
  const [sideOpen, setSideOpen] = useState(false);
  const [label, setLabel] = useState(localStorage.getItem('label') || 'Toko');
  const [role] = useState(localStorage.getItem('role') || 'user');
  const [reportId, setReportId] = useState<number | null>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [modalMakanan, setModalMakanan] = useState(0);
  const [modalMinuman, setModalMinuman] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [arsip, setArsip] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const loadReport = useCallback(async () => {
    try {
      const res = await fetch('/api/reports', { method: 'POST', headers: authH(), body: JSON.stringify({ date: today }) });
      const data = await res.json();
      setReportId(data.id);
      setModalMakanan(data.modal_makanan || 0);
      setModalMinuman(data.modal_minuman || 0);
      if (data.id) {
        const sRes = await fetch(`/api/sales/report/${data.id}`, { headers: authH() });
        setSales(await sRes.json());
      }
    } catch {}
  }, [today]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const addSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    await fetch('/api/sales', { method: 'POST', headers: authH(), body: JSON.stringify({ report_id: reportId, product_name: fd.get('name'), category: fd.get('cat'), qty: Number(fd.get('qty')), price: Number(fd.get('price')) }) });
    form.reset();
    setShowAdd(false);
    loadReport();
  };

  const deleteSale = async (id: number) => { await fetch(`/api/sales/${id}`, { method: 'DELETE', headers: authH() }); loadReport(); };

  const updateModal = async () => {
    if (reportId) await fetch(`/api/reports/${reportId}/modal`, { method: 'PUT', headers: authH(), body: JSON.stringify({ modal_makanan: modalMakanan, modal_minuman: modalMinuman }) });
  };

  const omzetMakanan = sales.filter(s => s.category === 'Makanan').reduce((a, s) => a + s.total, 0);
  const omzetMinuman = sales.filter(s => s.category === 'Minuman').reduce((a, s) => a + s.total, 0);
  const omzetTotal = omzetMakanan + omzetMinuman;

  const loadArsip = async () => { const res = await fetch('/api/arsip', { headers: authH() }); setArsip(await res.json()); };
  const loadUsers = async () => { const res = await fetch('/api/admin/users', { headers: authH() }); setUsers(await res.json()); };

  useEffect(() => { if (page === 'grafik') loadArsip(); if (page === 'admin') loadUsers(); }, [page]);

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'grafik', icon: BarChart3, label: 'Grafik & Arsip' },
    { id: 'kalkulator', icon: Calculator, label: 'Kalkulator' },
    ...(role === 'admin' ? [{ id: 'admin', icon: Shield, label: 'Admin Panel' }] : []),
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform lg:translate-x-0 lg:static ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-slate-800 flex items-center gap-2">
          <h3 className="font-bold text-lg">{label}</h3>
        </div>
        <nav className="py-4">
          {menuItems.map(m => (
            <button key={m.id} onClick={() => { setPage(m.id); setSideOpen(false); }} className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition ${page === m.id ? 'bg-white/10 text-white border-l-4 border-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <m.icon size={18} /> {m.label}
            </button>
          ))}
          <Link to="/dashboard" className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-white/5 mt-4 border-t border-slate-800 pt-4">
            <LogOut size={18} /> Kembali
          </Link>
        </nav>
      </aside>

      {sideOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <div className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
          <span className="font-bold">{label}</span>
          <button onClick={() => setSideOpen(!sideOpen)}>{sideOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>

        <div className="p-6 max-w-5xl mx-auto">
          {page === 'dashboard' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Dashboard: {today}</h2>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Profit Makanan</h4>
                  <p className="text-lg font-bold text-indigo-600">{fmt(omzetMakanan)}</p>
                  <div className="mt-2"><label className="text-xs text-slate-500">Modal:</label><input type="number" value={modalMakanan} onChange={e => setModalMakanan(Number(e.target.value))} onBlur={updateModal} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                  <p className="mt-2 text-sm font-bold text-emerald-600">Profit: {fmt(omzetMakanan - modalMakanan)}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Profit Minuman</h4>
                  <p className="text-lg font-bold text-indigo-600">{fmt(omzetMinuman)}</p>
                  <div className="mt-2"><label className="text-xs text-slate-500">Modal:</label><input type="number" value={modalMinuman} onChange={e => setModalMinuman(Number(e.target.value))} onBlur={updateModal} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                  <p className="mt-2 text-sm font-bold text-emerald-600">Profit: {fmt(omzetMinuman - modalMinuman)}</p>
                </div>
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Keseluruhan</h4>
                  <p className="text-sm text-slate-600">Omzet: <span className="font-bold text-slate-900">{fmt(omzetTotal)}</span></p>
                  <p className="text-sm text-slate-600">Modal: <span className="font-bold text-slate-900">{fmt(modalMakanan + modalMinuman)}</span></p>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-2">{fmt(omzetTotal - modalMakanan - modalMinuman)}</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-bold text-slate-900 mb-4">Rincian Penjualan</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-slate-500 border-b"><th className="pb-2">Produk</th><th className="pb-2">Kategori</th><th className="pb-2">Qty</th><th className="pb-2">Total</th><th className="pb-2">Aksi</th></tr></thead>
                    <tbody>
                      {sales.map(s => (
                        <tr key={s.id} className="border-b border-slate-100">
                          <td className="py-2">{s.product_name}</td><td>{s.category}</td><td>{s.qty}</td><td className="font-medium">{fmt(s.total)}</td>
                          <td><button onClick={() => deleteSale(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button></td>
                        </tr>
                      ))}
                      {sales.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-slate-400">Belum ada penjualan</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <button onClick={() => setShowAdd(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 transition"><Plus size={24} /></button>

              {showAdd && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-bold mb-4">Tambah Penjualan</h3>
                    <form onSubmit={addSale} className="space-y-3">
                      <input name="name" required placeholder="Nama Produk" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                      <div className="flex gap-3">
                        <select name="cat" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm"><option>Makanan</option><option>Minuman</option></select>
                        <input name="qty" type="number" required placeholder="Qty" className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <input name="price" type="number" required placeholder="Harga Satuan" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" />
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm">Batal</button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl text-sm">Simpan</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {page === 'grafik' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Grafik & Arsip</h2>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-slate-500 border-b"><th className="pb-2">Tanggal</th><th className="pb-2">Total Omzet</th><th className="pb-2">Total Modal</th><th className="pb-2">Profit</th></tr></thead>
                    <tbody>
                      {arsip.map(a => (
                        <tr key={a.id} className="border-b border-slate-100">
                          <td className="py-2">{a.date}</td><td>{fmt(a.omzet_total)}</td><td>{fmt((a.modal_makanan || 0) + (a.modal_minuman || 0))}</td>
                          <td className="font-medium text-emerald-600">{fmt(a.omzet_total - (a.modal_makanan || 0) - (a.modal_minuman || 0))}</td>
                        </tr>
                      ))}
                      {arsip.length === 0 && <tr><td colSpan={4} className="text-center py-6 text-slate-400">Belum ada arsip</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {page === 'kalkulator' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Kalkulator</h2>
              <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm">
                <CalcWidget />
              </div>
            </>
          )}

          {page === 'admin' && (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Admin Panel</h2>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-slate-500 border-b"><th className="pb-2">Key</th><th className="pb-2">Label</th><th className="pb-2">Status</th><th className="pb-2">Aksi</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-slate-100">
                          <td className="py-2 font-mono text-xs">{u.access_key}</td><td>{u.label}</td>
                          <td><span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'aktif' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{u.status}</span></td>
                          <td className="flex gap-2 py-2">
                            <button onClick={async () => { await fetch(`/api/admin/users/${u.id}/status`, { method: 'PUT', headers: authH(), body: JSON.stringify({ status: u.status === 'aktif' ? 'nonaktif' : 'aktif' }) }); loadUsers(); }} className="text-xs text-indigo-600 hover:underline">Toggle</button>
                            <button onClick={async () => { if(confirm('Hapus?')) { await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE', headers: authH() }); loadUsers(); } }} className="text-xs text-red-600 hover:underline">Hapus</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
      <div className="bg-slate-900 text-white text-right text-2xl font-mono p-4 rounded-xl mb-3 min-h-[60px] flex items-center justify-end">{display}</div>
      <div className="grid grid-cols-4 gap-2">
        {btns.map(b => (
          <button key={b} onClick={() => click(b)} className={`py-3 rounded-lg font-semibold text-sm transition ${b === '=' ? 'bg-indigo-600 text-white col-span-1' : b === 'C' ? 'bg-red-100 text-red-600' : b === '0' ? 'col-span-2 bg-slate-100' : '+-*/%'.includes(b) || b === 'DEL' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-900'} hover:opacity-80`}>
            {b === '/' ? '÷' : b}
          </button>
        ))}
      </div>
    </div>
  );
}
