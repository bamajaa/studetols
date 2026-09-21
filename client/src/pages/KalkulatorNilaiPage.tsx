import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { ArrowLeft, Plus, X, CloudUpload, Target } from 'lucide-react';

export default function KalkulatorNilaiPage() {
  const [subjectName, setSubjectName] = useState('');
  const [mode, setMode] = useState('bobot');
  const [rows, setRows] = useState([{ id: 1, name: 'Tugas', score: '80', weight: '20' }, { id: 2, name: 'UTS', score: '', weight: '30' }, { id: 3, name: 'UAS', score: '', weight: '50' }]);
  const [nextId, setNextId] = useState(4);
  const [target, setTarget] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addRow = () => { setRows([...rows, { id: nextId, name: '', score: '', weight: '' }]); setNextId(nextId + 1); };
  const removeRow = (id: number) => setRows(rows.filter(r => r.id !== id));
  const updateRow = (id: number, field: string, value: string) => setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));

  const totalWeight = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
  let finalScore = 0;
  if (mode === 'bobot') {
    finalScore = rows.reduce((s, r) => s + (parseFloat(r.score) || 0) * ((parseFloat(r.weight) || 0) / 100), 0);
  } else {
    const valid = rows.filter(r => r.score !== '');
    finalScore = valid.length > 0 ? valid.reduce((s, r) => s + (parseFloat(r.score) || 0), 0) / valid.length : 0;
  }

  let predicate = '-';
  if (finalScore >= 90) predicate = 'Sangat Memuaskan (A)';
  else if (finalScore >= 80) predicate = 'Baik Sekali (B)';
  else if (finalScore >= 70) predicate = 'Cukup (C)';
  else if (finalScore > 0) predicate = 'Perlu Peningkatan (D)';

  let targetText = '';
  if (target && mode === 'bobot') {
    const t = parseFloat(target);
    let current = 0, missing = 0;
    rows.forEach(r => {
      const w = parseFloat(r.weight) || 0;
      if (r.score !== '') current += (parseFloat(r.score) || 0) * (w / 100);
      else missing += w;
    });
    if (missing === 0) targetText = `Semua nilai sudah terisi. Hasil akhirmu: ${current.toFixed(1)}`;
    else {
      const needed = ((t - current) / (missing / 100)).toFixed(1);
      if (Number(needed) > 100) targetText = `Butuh nilai ${needed} di sisa penilaian (${missing}% bobot). Mustahil jika max 100!`;
      else if (Number(needed) <= 0) targetText = 'Target sudah tercapai!';
      else targetText = `Butuh rata-rata ${needed} di sisa penilaian (${missing}% bobot) untuk mencapai target ${t}.`;
    }
  }

  const saveGrades = async () => {
    if (!subjectName) { alert('Isi nama mapel!'); return; }
    setSaving(true);
    try {
      const data_nilai = rows.filter(r => r.score !== '').map(r => ({ name: r.name || 'Tanpa Nama', score: parseFloat(r.score), weight: mode === 'bobot' ? parseFloat(r.weight) || 0 : null }));
      if (data_nilai.length === 0) { alert('Belum ada nilai!'); return; }
      await api.post('/api/grades', { subject_name: subjectName, mode, data_nilai });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"><ArrowLeft size={16} /> Kembali</Link>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Kalkulator Nilai</h1>
        <p className="text-slate-500 mb-8">Hitung nilai akhir, simulasikan target, dan simpan historimu.</p>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-bold text-lg text-slate-900 mb-4">Komponen Nilai</h2>
            {mode === 'bobot' && totalWeight !== 100 && totalWeight !== 0 && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">Total bobot harus 100%! Saat ini: {totalWeight}%</div>
            )}
            <div className="mb-4"><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nama Mata Pelajaran</label><input value={subjectName} onChange={e => setSubjectName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contoh: Matematika" /></div>
            <div className="mb-4"><label className="block text-xs font-bold uppercase text-slate-500 mb-1">Sistem Penilaian</label><select value={mode} onChange={e => setMode(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm"><option value="bobot">Sistem Bobot</option><option value="rata">Rata-Rata Biasa</option></select></div>
            <div className="space-y-2">
              {rows.map(r => (
                <div key={r.id} className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                  <input value={r.name} onChange={e => updateRow(r.id, 'name', e.target.value)} className="flex-[2] px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Nama" />
                  <input type="number" value={r.score} onChange={e => updateRow(r.id, 'score', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Nilai" />
                  {mode === 'bobot' && <input type="number" value={r.weight} onChange={e => updateRow(r.id, 'weight', e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Bobot %" />}
                  <button onClick={() => removeRow(r.id)} className="w-9 h-9 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 flex items-center justify-center"><X size={16} /></button>
                </div>
              ))}
            </div>
            <button onClick={addRow} className="w-full mt-3 py-2.5 border border-dashed border-indigo-300 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 flex items-center justify-center gap-2"><Plus size={16} /> Tambah Komponen</button>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-bold text-slate-900 mb-3">Hasil Akhir</h2>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center mb-4">
                <div className="text-xs font-bold uppercase text-slate-500 mb-1">Estimasi Nilai</div>
                <div className="text-5xl font-extrabold text-indigo-600">{finalScore.toFixed(1)}</div>
                <div className="text-sm text-indigo-500 font-medium mt-1">{predicate}</div>
              </div>
              <button onClick={saveGrades} disabled={saving} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition">
                <CloudUpload size={16} /> {saving ? 'Menyimpan...' : 'Simpan ke Statistik'}
              </button>
              {saved && <div className="mt-2 text-xs text-emerald-600 text-center font-medium bg-emerald-50 p-2 rounded-lg">Berhasil disimpan!</div>}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="font-bold text-slate-900 mb-1 flex items-center gap-2"><Target size={16} /> Simulasi Target</h2>
              <p className="text-xs text-slate-500 mb-3">Butuh nilai berapa untuk mencapai target?</p>
              <input type="number" value={target} onChange={e => setTarget(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm mb-3" placeholder="Target: 85" />
              {targetText && <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg">{targetText}</div>}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
