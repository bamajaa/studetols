import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { useToast } from '../contexts/ToastContext';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Circle, 
  Clock, 
  CheckCircle2, 
  ListChecks, 
  Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig: Record<string, { label: string; icon: any; cls: string; border: string }> = {
  todo: { label: 'To Do', icon: Circle, cls: 'bg-slate-100 text-slate-500', border: 'border-slate-200' },
  'in-progress': { label: 'In Progress', icon: Clock, cls: 'bg-amber-50 text-amber-600', border: 'border-amber-200' },
  done: { label: 'Done', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200' },
};

export default function TaskTrackerPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const { showToast } = useToast();

  const load = async () => { 
    try {
      const data = await api.get('/api/tasks');
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  const addTask = async () => {
    if (!input.trim()) return;
    try {
      await api.post('/api/tasks', { description: input.trim() });
      setInput('');
      showToast('Tugas baru berhasil ditambahkan!', 'success');
      load();
    } catch (err: any) {
      showToast(err.message || 'Gagal menambahkan tugas', 'error');
    }
  };

  const cycleStatus = async (id: number, current: string) => {
    const next = current === 'todo' ? 'in-progress' : current === 'in-progress' ? 'done' : 'todo';
    try {
      await api.put(`/api/tasks/${id}/status`, { status: next });
      if (next === 'done') {
        showToast('Selamat! Tugas telah selesai.', 'success');
      }
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => { 
    try {
      await api.delete(`/api/tasks/${id}`);
      showToast('Tugas dihapus.', 'info');
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const saveEdit = async (id: number) => {
    if (!editText.trim()) return;
    try {
      await api.put(`/api/tasks/${id}/description`, { description: editText.trim() });
      setEditing(null);
      showToast('Deskripsi tugas diperbarui', 'success');
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const completedCount = tasks.filter(t => t.status === 'done').length;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft size={14} /> Kembali ke Dashboard
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200 mb-2">
              <ListChecks size={13} /> Manajemen Tugas MySQL
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Task Tracker</h1>
            <p className="text-xs text-slate-500 mt-0.5">Kelola to-do list harian dan pantau progress belajar Anda.</p>
          </div>

          {tasks.length > 0 && (
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase text-slate-400">Penyelesaian</div>
                <div className="text-xs font-black text-slate-900">{completedCount} / {tasks.length} Selesai</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                {Math.round((completedCount / tasks.length) * 100)}%
              </div>
            </div>
          )}
        </div>

        {/* Add Input Bar with subtle shadow & spring button */}
        <div className="flex gap-2.5 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && addTask()} 
            className="flex-1 px-4 py-2.5 bg-transparent text-xs font-medium outline-none" 
            placeholder="Ketik tugas baru lalu tekan Enter..." 
          />
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={addTask} 
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus size={15} /> Tambah
          </motion.button>
        </div>

        {/* Animated Sliding Filter Pills */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80 w-fit">
          {[
            { id: 'all', label: `Semua (${tasks.length})` },
            { id: 'todo', label: `To Do (${tasks.filter(t => t.status === 'todo').length})` },
            { id: 'in-progress', label: `In Progress (${tasks.filter(t => t.status === 'in-progress').length})` },
            { id: 'done', label: `Selesai (${completedCount})` },
          ].map(s => {
            const isActive = filter === s.id;
            return (
              <button 
                key={s.id} 
                onClick={() => setFilter(s.id)} 
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors z-10 ${
                  isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTaskPill"
                    className="absolute inset-0 bg-slate-900 rounded-xl shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Task Items List with Spring Entrance and Exit */}
        <div className="space-y-2.5">
          <AnimatePresence>
            {filtered.map(t => {
              const cfg = statusConfig[t.status] || statusConfig.todo;
              const Icon = cfg.icon;
              return (
                <motion.div 
                  key={t.id} 
                  layout
                  initial={{ opacity: 0, y: 12 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                  whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400 } }}
                  className={`bg-white border rounded-2xl p-4 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all ${
                    t.status === 'done' ? 'border-slate-200/60 bg-slate-50/50' : 'border-slate-200'
                  }`}
                >
                  <motion.button 
                    whileTap={{ scale: 0.85 }}
                    onClick={() => cycleStatus(t.id, t.status)} 
                    title="Klik untuk ubah status tugas"
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${cfg.cls} ${cfg.border}`}
                  >
                    <Icon size={16} />
                  </motion.button>

                  {editing === t.id ? (
                    <div className="flex-1 flex gap-2">
                      <input 
                        value={editText} 
                        onChange={e => setEditText(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && saveEdit(t.id)}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 font-medium" 
                        autoFocus
                      />
                      <button 
                        onClick={() => saveEdit(t.id)} 
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <span 
                        onClick={() => cycleStatus(t.id, t.status)}
                        className={`text-xs font-medium cursor-pointer transition select-none ${
                          t.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 hover:text-slate-900'
                        }`}
                      >
                        {t.description}
                      </span>
                    </div>
                  )}

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline ${cfg.cls} ${cfg.border}`}>
                    {cfg.label}
                  </span>

                  <button 
                    onClick={() => { setEditing(t.id); setEditText(t.description); }} 
                    className="text-slate-400 hover:text-slate-700 p-1 transition"
                    title="Edit teks tugas"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    onClick={() => deleteTask(t.id)} 
                    className="text-slate-400 hover:text-red-600 p-1 transition"
                    title="Hapus tugas"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Tidak ada tugas pada filter ini.
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
