import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { ArrowLeft, Plus, Trash2, Save, Download, Printer, FileText } from 'lucide-react';

export default function CornellNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const loadNotes = async () => {
    const data = await api.get('/api/cornell');
    setNotes(data);
  };
  
  useEffect(() => { loadNotes(); }, []);

  const createNote = async () => {
    const res = await api.post('/api/cornell', { title: 'Catatan Baru', note_date: new Date().toISOString().split('T')[0] });
    await loadNotes();
    const newNote = await api.get(`/api/cornell/${res.id}`);
    setActiveNote(newNote);
  };

  const deleteNote = async (id: number) => {
    if (!confirm('Hapus catatan ini?')) return;
    await api.delete(`/api/cornell/${id}`);
    if (activeNote?.id === id) setActiveNote(null);
    loadNotes();
  };

  const saveNote = async () => {
    if (!activeNote) return;
    setSaving(true);
    await api.put(`/api/cornell/${activeNote.id}`, activeNote);
    setSaving(false);
    loadNotes();
  };

  const exportTxt = () => {
    if (!activeNote) return;
    const content = `Judul: ${activeNote.title}\nMapel: ${activeNote.subject || '-'}\nTanggal: ${activeNote.note_date || '-'}\n\n=== CUES / KATA KUNCI ===\n${activeNote.cues || '-'}\n\n=== CATATAN UTAMA ===\n${activeNote.notes || '-'}\n\n=== KESIMPULAN ===\n${activeNote.summary || '-'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-4 no-print h-full">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft size={16} /> Kembali</Link>
          <div className="flex justify-between items-center mt-2">
            <h2 className="font-bold text-slate-900">Catatan Saya</h2>
            <button onClick={createNote} className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-200 transition"><Plus size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {notes.map(n => (
              <div key={n.id} onClick={() => setActiveNote(n)} className={`p-3 rounded-xl border cursor-pointer transition ${activeNote?.id === n.id ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                <h3 className="font-semibold text-sm text-slate-900 truncate">{n.title}</h3>
                <div className="text-xs text-slate-500 mt-1 flex justify-between"><span>{n.subject || 'Tanpa Mapel'}</span><span>{n.note_date}</span></div>
              </div>
            ))}
            {notes.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada catatan.</p>}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {activeNote ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-200 p-4 bg-slate-50 flex flex-wrap gap-4 items-start justify-between no-print">
                <div className="flex-1 space-y-3 min-w-[250px]">
                  <input value={activeNote.title} onChange={e => setActiveNote({...activeNote, title: e.target.value})} className="w-full bg-transparent text-xl font-bold text-slate-900 outline-none border-b border-transparent focus:border-slate-300 transition" placeholder="Judul Catatan" />
                  <div className="flex gap-4">
                    <input value={activeNote.subject} onChange={e => setActiveNote({...activeNote, subject: e.target.value})} className="flex-1 bg-transparent text-sm text-slate-600 outline-none border-b border-transparent focus:border-slate-300 transition" placeholder="Mata Pelajaran" />
                    <input type="date" value={activeNote.note_date} onChange={e => setActiveNote({...activeNote, note_date: e.target.value})} className="bg-transparent text-sm text-slate-600 outline-none border-b border-transparent focus:border-slate-300 transition" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveNote} className="px-3 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition">{saving ? 'Menyimpan...' : <><Save size={14} /> Simpan</>}</button>
                  <button onClick={exportTxt} className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-slate-200 transition"><Download size={14} /></button>
                  <button onClick={() => window.print()} className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-slate-200 transition"><Printer size={14} /></button>
                  <button onClick={() => deleteNote(activeNote.id)} className="px-3 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-red-100 transition"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Print Header */}
              <div className="hidden print:block p-8 border-b-2 border-black">
                <h1 className="text-2xl font-bold">{activeNote.title}</h1>
                <div className="flex justify-between mt-2 text-sm"><p>Mapel: {activeNote.subject}</p><p>Tanggal: {activeNote.note_date}</p></div>
              </div>

              {/* Cornell Grid */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 bg-white">
                <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-[300px]">
                  {/* Cues */}
                  <div className="w-full md:w-1/3 flex flex-col">
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Cues / Kata Kunci</h3>
                    <textarea value={activeNote.cues} onChange={e => setActiveNote({...activeNote, cues: e.target.value})} className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-emerald-500 text-sm print:border-black print:bg-white" placeholder="Tulis kata kunci, pertanyaan, atau ide pokok..." />
                  </div>
                  {/* Notes */}
                  <div className="w-full md:w-2/3 flex flex-col">
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Catatan Utama</h3>
                    <textarea value={activeNote.notes} onChange={e => setActiveNote({...activeNote, notes: e.target.value})} className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-emerald-500 text-sm print:border-black print:bg-white" placeholder="Tulis detail catatan, penjelasan, diagram..." />
                  </div>
                </div>
                {/* Summary */}
                <div className="flex flex-col min-h-[150px]">
                  <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Kesimpulan</h3>
                  <textarea value={activeNote.summary} onChange={e => setActiveNote({...activeNote, summary: e.target.value})} className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-emerald-500 text-sm print:border-black print:bg-white" placeholder="Tulis ringkasan singkat dari catatan di atas..." />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 no-print">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>Pilih catatan dari sidebar atau buat catatan baru.</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
