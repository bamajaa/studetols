import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { ArrowLeft, Play, Square, Timer, Pen, Trash2, Save } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const fmtMin = (m: number) => { const h = Math.floor(m / 60); const mm = Math.round(m % 60); return h > 0 ? `${h} jam ${mm} menit` : `${mm} menit`; };

export default function StatistikPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [timerSubject, setTimerSubject] = useState('');
  const [timerSec, setTimerSec] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<any>(null);
  const [manualSubject, setManualSubject] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualH, setManualH] = useState(0);
  const [manualM, setManualM] = useState(30);

  const load = async () => {
    const [s, sum] = await Promise.all([api.get('/api/study-sessions'), api.get('/api/statistics/summary')]);
    setSessions(s); setSummary(sum);
  };
  useEffect(() => { load(); }, []);

  const startTimer = () => {
    if (!timerSubject) { alert('Isi nama mapel!'); return; }
    setTimerSec(0); setRunning(true);
    intervalRef.current = setInterval(() => setTimerSec(s => s + 1), 1000);
  };

  const stopTimer = async () => {
    clearInterval(intervalRef.current); setRunning(false);
    const dur = Math.max(1, Math.round(timerSec / 60));
    await api.post('/api/study-sessions', { subject_name: timerSubject, duration_minutes: dur, date: new Date().toISOString().split('T')[0], source: 'timer' });
    setTimerSec(0); load();
  };

  const submitManual = async () => {
    if (!manualSubject) { alert('Isi mapel!'); return; }
    const total = manualH * 60 + manualM;
    if (total <= 0) { alert('Durasi harus > 0!'); return; }
    await api.post('/api/study-sessions', { subject_name: manualSubject, duration_minutes: total, date: manualDate, source: 'manual' });
    setManualSubject(''); setManualH(0); setManualM(30); load();
  };

  const deleteSession = async (id: number) => { if (confirm('Hapus?')) { await api.delete(`/api/study-sessions/${id}`); load(); } };

  const hh = String(Math.floor(timerSec / 3600)).padStart(2, '0');
  const mm = String(Math.floor((timerSec % 3600) / 60)).padStart(2, '0');
  const ss = String(timerSec % 60).padStart(2, '0');

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"><ArrowLeft size={16} /> Kembali</Link>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Statistik Belajar</h1>
        <p className="text-slate-500 mb-8">Catat waktu belajar dan pantau tren performamu.</p>

        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-4"><div className="text-xs text-slate-500 mb-1">Total waktu belajar</div><div className="text-lg font-bold text-teal-600">{fmtMin(summary.total_minutes)}</div></div>
            <div className="bg-white border border-slate-200 rounded-xl p-4"><div className="text-xs text-slate-500 mb-1">Mapel paling kuat</div><div className="text-lg font-bold text-emerald-600">{summary.insight.best_subject?.subject_name || '-'}</div><div className="text-xs text-slate-400">{summary.insight.best_subject ? `Nilai ${summary.insight.best_subject.nilai_akhir}` : 'Belum ada data'}</div></div>
            <div className="bg-white border border-slate-200 rounded-xl p-4"><div className="text-xs text-slate-500 mb-1">Perlu perhatian</div><div className="text-lg font-bold text-red-600">{summary.insight.worst_subject?.subject_name || '-'}</div><div className="text-xs text-slate-400">{summary.insight.worst_subject ? `Nilai ${summary.insight.worst_subject.nilai_akhir}` : 'Belum ada data'}</div></div>
            <div className="bg-white border border-slate-200 rounded-xl p-4"><div className="text-xs text-slate-500 mb-1">Paling sering dipelajari</div><div className="text-lg font-bold text-slate-900">{summary.insight.most_studied?.subject_name || '-'}</div><div className="text-xs text-slate-400">{summary.insight.most_studied ? fmtMin(summary.insight.most_studied.total_minutes) : 'Belum ada'}</div></div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1"><Timer size={18} className="text-teal-600" /> Timer Belajar</h3>
            <p className="text-xs text-slate-500 mb-4">Pilih mapel, tekan mulai saat belajar.</p>
            <input value={timerSubject} onChange={e => setTimerSubject(e.target.value)} disabled={running} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm mb-4" placeholder="Nama mapel" />
            <div className="text-4xl font-bold text-teal-600 text-center py-6 font-mono tracking-wider">{hh}:{mm}:{ss}</div>
            <div className="flex gap-3">
              <button onClick={startTimer} disabled={running} className="flex-1 py-3 bg-teal-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"><Play size={16} /> Mulai</button>
              <button onClick={stopTimer} disabled={!running} className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"><Square size={16} /> Berhenti & Simpan</button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1"><Pen size={18} className="text-teal-600" /> Input Manual</h3>
            <p className="text-xs text-slate-500 mb-4">Catat belajar yang sudah dilakukan.</p>
            <input value={manualSubject} onChange={e => setManualSubject(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm mb-3" placeholder="Nama mapel" />
            <input type="date" value={manualDate} onChange={e => setManualDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm mb-3" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="text-xs text-slate-500">Jam</label><input type="number" min={0} value={manualH} onChange={e => setManualH(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
              <div><label className="text-xs text-slate-500">Menit</label><input type="number" min={0} max={59} value={manualM} onChange={e => setManualM(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
            </div>
            <button onClick={submitManual} className="w-full py-3 bg-teal-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"><Save size={16} /> Simpan Sesi</button>
          </div>
        </div>

        {summary && summary.daily.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-slate-900 mb-4">Tren Waktu Belajar Harian</h3>
            <div className="h-64"><Line data={{ labels: summary.daily.map((d: any) => d.date), datasets: [{ label: 'Jam', data: summary.daily.map((d: any) => Math.round((d.total_minutes / 60) * 10) / 10), borderColor: '#0E7490', backgroundColor: 'rgba(14,116,144,0.1)', fill: true, tension: 0.3, pointRadius: 3 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
          </div>
        )}

        {summary && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {summary.by_subject.filter((s: any) => s.nilai_akhir !== null).length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Nilai per Mapel</h3>
                <div className="h-64"><Bar data={{ labels: summary.by_subject.filter((s: any) => s.nilai_akhir !== null).map((s: any) => s.subject_name), datasets: [{ label: 'Nilai', data: summary.by_subject.filter((s: any) => s.nilai_akhir !== null).map((s: any) => s.nilai_akhir), backgroundColor: '#4F46E5', borderRadius: 6 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} /></div>
              </div>
            )}
            {summary.by_subject.filter((s: any) => s.total_minutes > 0).length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">Jam Belajar per Mapel</h3>
                <div className="h-64"><Bar data={{ labels: summary.by_subject.filter((s: any) => s.total_minutes > 0).map((s: any) => s.subject_name), datasets: [{ label: 'Jam', data: summary.by_subject.filter((s: any) => s.total_minutes > 0).map((s: any) => Math.round((s.total_minutes / 60) * 10) / 10), backgroundColor: '#0E7490', borderRadius: 6 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} /></div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Riwayat Sesi Belajar</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-slate-500 border-b"><th className="pb-2">Tanggal</th><th className="pb-2">Mapel</th><th className="pb-2">Sumber</th><th className="pb-2 text-right">Durasi</th><th className="pb-2 text-right">Aksi</th></tr></thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="py-2">{s.date}</td><td>{s.subject_name}</td>
                    <td><span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-600">{s.source === 'timer' ? 'Timer' : 'Manual'}</span></td>
                    <td className="text-right">{fmtMin(s.duration_minutes)}</td>
                    <td className="text-right"><button onClick={() => deleteSession(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
                {sessions.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-slate-400">Belum ada sesi belajar.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
