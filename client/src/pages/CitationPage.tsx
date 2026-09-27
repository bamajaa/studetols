import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { 
  ArrowLeft, 
  BookOpen, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  FileText, 
  Globe, 
  Book, 
  Share2,
  ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SourceType = 'book' | 'journal' | 'website';
type CitationStyle = 'APA' | 'MLA' | 'Harvard' | 'Chicago';

export default function CitationPage() {
  const [sourceType, setSourceType] = useState<SourceType>('book');
  const [style, setStyle] = useState<CitationStyle>('APA');
  
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [volume, setVolume] = useState('');
  const [url, setUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Saved citations list (saved in localStorage)
  const [savedList, setSavedList] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('studetols_citations');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('studetols_citations', JSON.stringify(savedList));
  }, [savedList]);

  // Format generator logic
  const generateCitation = (item: any, selectedStyle: CitationStyle) => {
    const a = item.author || 'Anonim';
    const y = item.year || 't.t.';
    const t = item.title || 'Tanpa Judul';
    const p = item.publisher || '';
    const v = item.volume ? ` ${item.volume}.` : '';
    const u = item.url ? ` ${item.url}` : '';

    if (selectedStyle === 'APA') {
      if (item.sourceType === 'book') return `${a}. (${y}). ${t}. ${p}.${u}`;
      if (item.sourceType === 'journal') return `${a}. (${y}). ${t}. ${p}${v}${u}`;
      return `${a}. (${y}). ${t}. Diakses dari ${item.url || '-'}`;
    } else if (selectedStyle === 'MLA') {
      if (item.sourceType === 'book') return `${a}. ${t}. ${p}, ${y}.${u}`;
      if (item.sourceType === 'journal') return `${a}. "${t}." ${p}${v} (${y}).${u}`;
      return `${a}. "${t}." Web. ${y}. <${item.url || ''}>.`;
    } else if (selectedStyle === 'Harvard') {
      if (item.sourceType === 'book') return `${a}, ${y}. ${t}. ${p}.${u}`;
      if (item.sourceType === 'journal') return `${a}, ${y}. '${t}', ${p}${v}${u}`;
      return `${a}, ${y}. ${t}, dilihat ${new Date().toLocaleDateString('id-ID')}, <${item.url || '-'}>.`;
    } else {
      // Chicago
      return `${a}. ${t}. ${p}, ${y}.${u}`;
    }
  };

  const previewText = generateCitation({ author, year, title, publisher, volume, url, sourceType }, style);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveCurrentCitation = () => {
    if (!title && !author) {
      alert('Isi minimal nama penulis atau judul karya');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      author: author || 'Anonim',
      year: year || new Date().getFullYear().toString(),
      title: title || 'Tanpa Judul',
      publisher,
      volume,
      url,
      sourceType,
      createdAt: new Date().toLocaleDateString('id-ID')
    };

    setSavedList([newEntry, ...savedList]);
    setAuthor('');
    setYear('');
    setTitle('');
    setPublisher('');
    setVolume('');
    setUrl('');
  };

  const deleteCitation = (id: string) => {
    setSavedList(savedList.filter(item => item.id !== id));
  };

  // Copy all bibliography sorted alphabetically A-Z
  const copyAllBibliography = () => {
    if (savedList.length === 0) return;
    const sorted = [...savedList].sort((a, b) => a.author.localeCompare(b.author));
    const fullText = sorted.map(item => generateCitation(item, style)).join('\n\n');
    copyToClipboard(fullText, 'all');
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft size={14} /> Kembali ke Dashboard
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-bold border border-sky-200 mb-2">
            <BookOpen size={13} /> Referensi & Akademik
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Generator Daftar Pustaka (Sitasi)</h1>
          <p className="text-xs text-slate-500 mt-0.5">Buat format kutipan dan daftar pustaka standar APA, MLA, Harvard, dan Chicago secara instan.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Form Input Area */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-4">1. Pilih Tipe Sumber</h3>
              
              {/* Source Type Selector */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {[
                  { id: 'book', label: 'Buku', icon: Book },
                  { id: 'journal', label: 'Jurnal Ilmiah', icon: FileText },
                  { id: 'website', label: 'Website / Artikel', icon: Globe },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSourceType(s.id as SourceType)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col items-center gap-1.5 text-center ${
                      sourceType === s.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <s.icon size={18} />
                    <span className="text-xs font-bold">{s.label}</span>
                  </button>
                ))}
              </div>

              <h3 className="font-bold text-sm text-slate-900 mb-4">2. Isi Detail Sumber</h3>
              
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Nama Penulis (contoh: Sugiyono atau John Doe)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nama belakang, Nama depan atau nama lengkap"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {sourceType === 'book' ? 'Judul Buku' : sourceType === 'journal' ? 'Judul Artikel Jurnal' : 'Judul Halaman Web'}
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Masukkan judul karya lengkap"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tahun Terbit</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2023"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {sourceType === 'book' ? 'Nama Penerbit' : sourceType === 'journal' ? 'Nama Jurnal' : 'Nama Website'}
                    </label>
                    <input
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="Contoh: Gramedia / IEEE / Wikipedia"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {sourceType === 'journal' ? 'Volume & Halaman' : 'Kota / Edisi (Opsional)'}
                    </label>
                    <input
                      type="text"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="Contoh: Vol. 4, No. 2, hlm. 45-50"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Tautan / URL / DOI (Opsional)</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Result & Style Selector Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-slate-900">Format Sitasi</h3>
                
                {/* Format Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {(['APA', 'MLA', 'Harvard', 'Chicago'] as CitationStyle[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStyle(s)}
                      className={`px-2 py-1 text-[10px] font-black rounded-md transition ${
                        style === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[90px] flex items-center mb-4">
                <p className="text-xs text-slate-800 italic leading-relaxed font-serif">
                  {author || title ? previewText : 'Ketik detail sumber di sebelah kiri untuk melihat hasil format sitasi.'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(previewText, 'preview')}
                  disabled={!author && !title}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  {copiedId === 'preview' ? <><Check size={14} /> Berhasil Disalin</> : <><Copy size={14} /> Salin Kutipan</>}
                </button>

                <button
                  type="button"
                  onClick={saveCurrentCitation}
                  disabled={!author && !title}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <Plus size={14} /> Simpan ke Daftar
                </button>
              </div>
            </div>

            {/* Saved Bibliography List */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Daftar Pustaka Saya ({savedList.length})</h3>
                  <span className="text-[10px] text-slate-400">Format saat ini: {style}</span>
                </div>

                {savedList.length > 0 && (
                  <button
                    onClick={copyAllBibliography}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 transition"
                    title="Urutkan A-Z dan salin semua sekaligus"
                  >
                    {copiedId === 'all' ? <Check size={12} className="text-emerald-600" /> : <ListOrdered size={12} />}
                    {copiedId === 'all' ? 'Tersalin Semua!' : 'Salin Semua (A-Z)'}
                  </button>
                )}
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {savedList.map((item) => {
                    const formatted = generateCitation(item, style);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition flex flex-col justify-between gap-2"
                      >
                        <p className="text-xs text-slate-800 leading-relaxed font-serif">
                          {formatted}
                        </p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-[10px]">
                          <span className="text-slate-400 font-medium">Tipe: {item.sourceType}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(formatted, item.id)}
                              className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1"
                            >
                              {copiedId === item.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                              {copiedId === item.id ? 'Disalin' : 'Salin'}
                            </button>
                            <button
                              onClick={() => deleteCitation(item.id)}
                              className="text-slate-400 hover:text-red-600 transition"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {savedList.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Belum ada sitasi yang disimpan ke daftar.<br />
                    Klik <strong>+ Simpan ke Daftar</strong> untuk menyusun daftar pustaka tugas Anda.
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
