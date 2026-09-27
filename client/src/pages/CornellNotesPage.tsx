import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { ArrowLeft, Plus, Trash2, Save, Download, Printer, FileText, Check, AlertCircle } from 'lucide-react';

export default function CornellNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  const loadNotes = async () => {
    try {
      const data = await api.get('/api/cornell');
      setNotes(data);
      // If no active note is selected but notes exist, auto-select the first one
      if (data.length > 0 && !activeNote) {
        setActiveNote({
          ...data[0],
          title: data[0].title || '',
          subject: data[0].subject || '',
          note_date: data[0].note_date || '',
          cues: data[0].cues || '',
          notes: data[0].notes || '',
          summary: data[0].summary || '',
        });
      }
    } catch (err: any) {
      console.error(err);
    }
  };
  
  useEffect(() => { 
    loadNotes(); 
  }, []);

  const createNote = async () => {
    try {
      setErrorMessage(null);
      const today = new Date().toISOString().split('T')[0];
      const res = await api.post('/api/cornell', { 
        title: 'Catatan Baru', 
        subject: '',
        note_date: today,
        cues: '',
        notes: '',
        summary: ''
      });
      const newNote = {
        id: res.id,
        title: 'Catatan Baru',
        subject: '',
        note_date: today,
        cues: '',
        notes: '',
        summary: ''
      };
      setActiveNote(newNote);
      await loadNotes();
      setSavedStatus('Catatan baru dibuat!');
      setTimeout(() => setSavedStatus(null), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat catatan');
    }
  };

  const deleteNote = async (id: number) => {
    if (!confirm('Hapus catatan ini?')) return;
    try {
      await api.delete(`/api/cornell/${id}`);
      if (activeNote?.id === id) setActiveNote(null);
      await loadNotes();
    } catch (err: any) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const saveNote = async (noteToSave = activeNote) => {
    if (!noteToSave || !noteToSave.id) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      const payload = {
        title: (noteToSave.title && noteToSave.title.trim()) || 'Catatan Tanpa Judul',
        subject: noteToSave.subject || '',
        note_date: noteToSave.note_date || new Date().toISOString().split('T')[0],
        cues: noteToSave.cues || '',
        notes: noteToSave.notes || '',
        summary: noteToSave.summary || ''
      };
      await api.put(`/api/cornell/${noteToSave.id}`, payload);
      setSavedStatus('Tersimpan!');
      setTimeout(() => setSavedStatus(null), 2000);
      // Refresh list to update title/subject on sidebar
      const list = await api.get('/api/cornell');
      setNotes(list);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan catatan');
    } finally {
      setSaving(false);
    }
  };

  // Debounced Auto-save when user types
  const handleFieldChange = (field: string, value: string) => {
    if (!activeNote) return;
    const updated = { ...activeNote, [field]: value };
    setActiveNote(updated);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveNote(updated);
    }, 1200);
  };

  const selectNote = (n: any) => {
    setActiveNote({
      ...n,
      title: n.title || '',
      subject: n.subject || '',
      note_date: n.note_date || '',
      cues: n.cues || '',
      notes: n.notes || '',
      summary: n.summary || '',
    });
    setErrorMessage(null);
  };

  const exportTxt = () => {
    if (!activeNote) return;
    const content = `Judul: ${activeNote.title || 'Catatan'}\nMapel: ${activeNote.subject || '-'}\nTanggal: ${activeNote.note_date || '-'}\n\n=== CUES / KATA KUNCI ===\n${activeNote.cues || '-'}\n\n=== CATATAN UTAMA ===\n${activeNote.notes || '-'}\n\n=== KESIMPULAN ===\n${activeNote.summary || '-'}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title || 'Catatan'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-4 no-print h-full flex-shrink-0">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </Link>
          
          <div className="flex justify-between items-center mt-1">
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">Koleksi Catatan</h2>
            <button 
              onClick={createNote} 
              className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition shadow-sm"
              title="Buat catatan baru"
            >
              <Plus size={13} /> Baru
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {notes.map(n => (
              <div 
                key={n.id} 
                onClick={() => selectNote(n)} 
                className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                  activeNote?.id === n.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <h3 className={`font-bold text-xs truncate ${activeNote?.id === n.id ? 'text-white' : 'text-slate-900'}`}>
                  {n.title || 'Tanpa Judul'}
                </h3>
                <div className={`text-[11px] mt-1 flex justify-between ${activeNote?.id === n.id ? 'text-slate-300' : 'text-slate-400'}`}>
                  <span className="truncate max-w-[100px]">{n.subject || 'Tanpa Mapel'}</span>
                  <span>{n.note_date}</span>
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada catatan.<br />Klik <strong>+ Baru</strong> untuk membuat.
              </div>
            )}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {activeNote ? (
            <>
              {/* Header Toolbar */}
              <div className="border-b border-slate-200 p-4 bg-slate-50/80 flex flex-wrap gap-4 items-center justify-between no-print">
                <div className="flex-1 space-y-2 min-w-[240px]">
                  <input 
                    value={activeNote.title || ''} 
                    onChange={e => handleFieldChange('title', e.target.value)} 
                    className="w-full bg-transparent text-lg font-black text-slate-900 outline-none border-b border-transparent focus:border-slate-300 transition" 
                    placeholder="Judul Catatan (contoh: Biologi Sel)" 
                  />
                  <div className="flex gap-4">
                    <input 
                      value={activeNote.subject || ''} 
                      onChange={e => handleFieldChange('subject', e.target.value)} 
                      className="flex-1 bg-transparent text-xs text-slate-600 outline-none border-b border-transparent focus:border-slate-300 transition font-medium" 
                      placeholder="Mata Pelajaran (contoh: IPA)" 
                    />
                    <input 
                      type="date" 
                      value={activeNote.note_date || ''} 
                      onChange={e => handleFieldChange('note_date', e.target.value)} 
                      className="bg-transparent text-xs text-slate-600 outline-none border-b border-transparent focus:border-slate-300 transition font-medium" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {savedStatus && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 animate-fade-in">
                      <Check size={12} /> {savedStatus}
                    </span>
                  )}

                  <button 
                    onClick={() => saveNote()} 
                    disabled={saving}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Save size={14} />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>

                  <button 
                    onClick={exportTxt} 
                    title="Ekspor ke teks (.txt)"
                    className="px-2.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Ekspor TXT</span>
                  </button>

                  <button 
                    onClick={() => window.print()} 
                    title="Cetak format Cornell (PDF)"
                    className="px-2.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Printer size={14} />
                    <span className="hidden sm:inline">Cetak</span>
                  </button>

                  <button 
                    onClick={() => deleteNote(activeNote.id)} 
                    title="Hapus catatan ini"
                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={14} />
                  {errorMessage}
                </div>
              )}

              {/* Print Header for standard Paper */}
              <div className="hidden print:block p-6 border-b-2 border-slate-900">
                <h1 className="text-2xl font-black">{activeNote.title || 'Catatan'}</h1>
                <div className="flex justify-between mt-1 text-xs text-slate-600">
                  <p>Mata Pelajaran: <strong>{activeNote.subject || '-'}</strong></p>
                  <p>Tanggal: <strong>{activeNote.note_date || '-'}</strong></p>
                </div>
              </div>

              {/* Cornell 3-Zone Layout */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-white">
                <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-[300px]">
                  {/* Left Column: Cues / Keywords (30%) */}
                  <div className="w-full md:w-1/3 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        Cues / Kata Kunci & Pertanyaan
                      </h3>
                    </div>
                    <textarea 
                      value={activeNote.cues || ''} 
                      onChange={e => handleFieldChange('cues', e.target.value)} 
                      className="flex-1 w-full p-4 bg-slate-50/70 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-xs leading-relaxed transition print:border-black print:bg-white" 
                      placeholder="• Istilah penting&#10;• Pertanyaan evaluasi&#10;• Rumus kunci" 
                    />
                  </div>

                  {/* Right Column: Main Notes (70%) */}
                  <div className="w-full md:w-2/3 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                        Catatan Utama (Notes)
                      </h3>
                    </div>
                    <textarea 
                      value={activeNote.notes || ''} 
                      onChange={e => handleFieldChange('notes', e.target.value)} 
                      className="flex-1 w-full p-4 bg-slate-50/70 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-xs leading-relaxed transition print:border-black print:bg-white" 
                      placeholder="Catat penjelasan guru, poin penting, langkah penyelesaian, uraian materi..." 
                    />
                  </div>
                </div>

                {/* Bottom Zone: Summary */}
                <div className="flex flex-col min-h-[140px] pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      Kesimpulan Singkat (Summary)
                    </h3>
                  </div>
                  <textarea 
                    value={activeNote.summary || ''} 
                    onChange={e => handleFieldChange('summary', e.target.value)} 
                    className="flex-1 w-full p-4 bg-slate-50/70 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-xs leading-relaxed transition print:border-black print:bg-white" 
                    placeholder="Tuliskan intisari keseluruhan catatan dalam 2-3 kalimat ringkas..." 
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center no-print">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <FileText size={28} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1">Belum Ada Catatan Aktif</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-5">Pilih catatan dari daftar di sebelah kiri atau buat catatan baru dengan metode Cornell.</p>
              <button
                onClick={createNote}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-slate-800 transition"
              >
                <Plus size={14} /> Buat Catatan Baru
              </button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
