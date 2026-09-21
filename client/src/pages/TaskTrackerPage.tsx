import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { ArrowLeft, Plus, Trash2, Edit2, Check, Circle, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig: Record<string, { label: string; icon: any; cls: string }> = {
  todo: { label: 'To Do', icon: Circle, cls: 'bg-slate-100 text-slate-600' },
  'in-progress': { label: 'In Progress', icon: Clock, cls: 'bg-amber-100 text-amber-700' },
  done: { label: 'Done', icon: CheckCircle2, cls: 'bg-emerald-100 text-emerald-700' },
};

export default function TaskTrackerPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const load = async () => { setTasks(await api.get('/api/tasks')); };
  useEffect(() => { load(); }, []);

  const addTask = async () => {
    if (!input.trim()) return;
    await api.post('/api/tasks', { description: input });
    setInput(''); load();
  };

  const cycleStatus = async (id: number, current: string) => {
    const next = current === 'todo' ? 'in-progress' : current === 'in-progress' ? 'done' : 'todo';
    await api.put(`/api/tasks/${id}/status`, { status: next }); load();
  };

  const deleteTask = async (id: number) => { await api.delete(`/api/tasks/${id}`); load(); };

  const saveEdit = async (id: number) => {
    await api.put(`/api/tasks/${id}/description`, { description: editText });
    setEditing(null); load();
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"><ArrowLeft size={16} /> Kembali</Link>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Task Tracker</h1>

        <div className="flex gap-2 mb-6">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Tambahkan tugas baru..." />
          <button onClick={addTask} className="px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl text-sm hover:bg-indigo-700 flex items-center gap-2"><Plus size={16} /> Tambah</button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'todo', 'in-progress', 'done'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {s === 'all' ? 'Semua' : statusConfig[s]?.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(t => {
              const cfg = statusConfig[t.status] || statusConfig.todo;
              const Icon = cfg.icon;
              return (
                <motion.div key={t.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                  className={`bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 ${t.status === 'done' ? 'opacity-60' : ''}`}>
                  <button onClick={() => cycleStatus(t.id, t.status)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.cls}`}><Icon size={16} /></button>
                  {editing === t.id ? (
                    <div className="flex-1 flex gap-2">
                      <input value={editText} onChange={e => setEditText(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                      <button onClick={() => saveEdit(t.id)} className="px-3 py-2 bg-emerald-600 text-white rounded-lg"><Check size={14} /></button>
                    </div>
                  ) : (
                    <span className={`flex-1 text-sm ${t.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{t.description}</span>
                  )}
                  <button onClick={() => { setEditing(t.id); setEditText(t.description); }} className="text-slate-400 hover:text-indigo-600"><Edit2 size={14} /></button>
                  <button onClick={() => deleteTask(t.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">Tidak ada tugas.</p>}
        </div>
      </div>
    </PageWrapper>
  );
}
