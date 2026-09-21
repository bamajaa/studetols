import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { ArrowLeft, Plus, Trash2, ExternalLink, Bookmark as BookmarkIcon, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const load = async () => {
    const query = activeFilter ? `?category=${encodeURIComponent(activeFilter)}` : '';
    setBookmarks(await api.get(`/api/bookmarks${query}`));
    setCategories(await api.get('/api/bookmarks/categories'));
  };

  useEffect(() => { load(); }, [activeFilter]);

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url || !category) return;
    try {
      await api.post('/api/bookmarks', { title, url, category });
      setTitle(''); setUrl(''); setCategory('');
      load();
    } catch (err: any) { alert(err.message); }
  };

  const deleteBookmark = async (id: number) => {
    if (!confirm('Hapus bookmark ini?')) return;
    await api.delete(`/api/bookmarks/${id}`);
    load();
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"><ArrowLeft size={16} /> Kembali</Link>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Bookmark Manager</h1>
        <p className="text-slate-500 mb-8">Simpan dan organisir link materi, referensi, dan website belajar.</p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <form onSubmit={addBookmark} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BookmarkIcon size={18} className="text-sky-500" /> Tambah Bookmark</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Judul</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Contoh: Modul Fisika Kuantum" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">URL / Link</label>
                  <input type="url" value={url} onChange={e => setUrl(e.target.value)} required className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                  <input list="category-list" value={category} onChange={e => setCategory(e.target.value)} required className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Contoh: Fisika, Referensi" />
                  <datalist id="category-list">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <button type="submit" className="w-full py-2.5 bg-sky-600 text-white font-semibold rounded-lg text-sm hover:bg-sky-700 flex items-center justify-center gap-2"><Plus size={16} /> Simpan</button>
              </div>
            </form>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Filter size={18} className="text-slate-400" /> Filter Kategori</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActiveFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${activeFilter === '' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>Semua</button>
                {categories.map(c => (
                  <button key={c} onClick={() => setActiveFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${activeFilter === c ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 h-fit">
            <AnimatePresence>
              {bookmarks.map(b => (
                <motion.div key={b.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">{b.category}</span>
                    <button onClick={() => deleteBookmark(b.id)} className="text-slate-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                  </div>
                  <h3 className="font-bold text-slate-900 line-clamp-2 flex-1 mb-3">{b.title}</h3>
                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition">
                    <ExternalLink size={14} /> Buka Link
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
            {bookmarks.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                <BookmarkIcon size={48} className="mx-auto mb-3 opacity-20" />
                <p>Belum ada bookmark yang tersimpan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
