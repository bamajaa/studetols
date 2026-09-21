import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { ArrowLeft, Save, Edit3, Plus, X } from 'lucide-react';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [duties, setDuties] = useState<any[]>([]);
  const [editingSched, setEditingSched] = useState(false);
  const [editingDuty, setEditingDuty] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const todayIndex = new Date().getDay() - 1; // 0=Senin, 4=Jumat, -1/5/6=Weekend

  const load = async () => {
    setSchedule(await api.get('/api/schedule'));
    setDuties(await api.get('/api/schedule/duties'));
  };

  useEffect(() => { load(); }, []);

  const addSchedRow = (dayIdx: number) => {
    setSchedule([...schedule, { day_index: dayIdx, subject_name: '', time_slot: '', teacher_name: '', position: schedule.length }]);
  };
  const removeSchedRow = (idx: number) => {
    setSchedule(schedule.filter((_, i) => i !== idx));
  };
  const updateSched = (idx: number, field: string, val: string) => {
    const updated = [...schedule];
    updated[idx][field] = val;
    setSchedule(updated);
  };

  const addDutyRow = (dayIdx: number) => {
    setDuties([...duties, { day_index: dayIdx, student_name: '' }]);
  };
  const removeDutyRow = (idx: number) => {
    setDuties(duties.filter((_, i) => i !== idx));
  };
  const updateDuty = (idx: number, val: string) => {
    const updated = [...duties];
    updated[idx].student_name = val;
    setDuties(updated);
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      if (editingSched) await api.post('/api/schedule', { entries: schedule.filter(s => s.subject_name) });
      if (editingDuty) await api.post('/api/schedule/duties', { entries: duties.filter(d => d.student_name) });
      setEditingSched(false); setEditingDuty(false);
      load();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const renderSchedView = () => (
    <div className="grid md:grid-cols-5 gap-4">
      {DAYS.map((day, dIdx) => {
        const isToday = dIdx === todayIndex;
        const dayScheds = schedule.filter(s => s.day_index === dIdx);
        return (
          <div key={day} className={`bg-white border rounded-xl overflow-hidden ${isToday ? 'border-orange-400 ring-2 ring-orange-400/20 shadow-md' : 'border-slate-200'}`}>
            <div className={`p-3 text-center font-bold text-sm ${isToday ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-700 border-b border-slate-200'}`}>{day}</div>
            <div className="p-3 space-y-3">
              {dayScheds.length === 0 && <div className="text-xs text-center text-slate-400 py-4">Kosong</div>}
              {dayScheds.map((s, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-2 relative">
                  <div className="text-[10px] font-bold text-orange-600 bg-orange-100 w-fit px-1.5 py-0.5 rounded mb-1">{s.time_slot || '-'}</div>
                  <div className="text-sm font-bold text-slate-800 leading-tight">{s.subject_name}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.teacher_name}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderSchedEdit = () => (
    <div className="grid md:grid-cols-5 gap-4">
      {DAYS.map((day, dIdx) => (
        <div key={day} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-2 text-center font-bold text-sm bg-slate-200 text-slate-700">{day}</div>
          <div className="p-2 space-y-2">
            {schedule.map((s, idx) => s.day_index === dIdx && (
              <div key={idx} className="bg-white border border-slate-200 rounded-lg p-2 space-y-1.5 relative">
                <button onClick={() => removeSchedRow(idx)} className="absolute -top-1 -right-1 bg-red-100 text-red-500 rounded-full p-1"><X size={12} /></button>
                <input value={s.time_slot} onChange={e => updateSched(idx, 'time_slot', e.target.value)} placeholder="Jam (07:00)" className="w-full text-xs px-2 py-1 border border-slate-200 rounded outline-none" />
                <input value={s.subject_name} onChange={e => updateSched(idx, 'subject_name', e.target.value)} placeholder="Mata Pelajaran" className="w-full text-sm font-semibold px-2 py-1 border border-slate-200 rounded outline-none" />
                <input value={s.teacher_name} onChange={e => updateSched(idx, 'teacher_name', e.target.value)} placeholder="Nama Guru" className="w-full text-xs px-2 py-1 border border-slate-200 rounded outline-none" />
              </div>
            ))}
            <button onClick={() => addSchedRow(dIdx)} className="w-full py-1.5 border border-dashed border-slate-300 text-slate-500 rounded-lg text-xs hover:bg-slate-100 flex justify-center items-center gap-1"><Plus size={12} /> Tambah</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"><ArrowLeft size={16} /> Kembali</Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Jadwal & Piket</h1>
            <p className="text-slate-500">Jadwal pelajaran mingguan dan tugas kebersihan kelas.</p>
          </div>
          {(editingSched || editingDuty) && (
            <button onClick={saveAll} disabled={saving} className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm flex items-center gap-2 hover:bg-emerald-700 transition">
              <Save size={16} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          )}
        </div>

        {/* Schedule Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Jadwal Pelajaran</h2>
            {!editingSched && <button onClick={() => setEditingSched(true)} className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-orange-100"><Edit3 size={14} /> Edit Jadwal</button>}
          </div>
          {editingSched ? renderSchedEdit() : renderSchedView()}
        </section>

        {/* Duties Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Jadwal Piket Kebersihan</h2>
            {!editingDuty && <button onClick={() => setEditingDuty(true)} className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-orange-100"><Edit3 size={14} /> Edit Piket</button>}
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            {DAYS.map((day, dIdx) => (
              <div key={day} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-2 text-center font-bold text-xs bg-slate-100 text-slate-600 border-b border-slate-200">{day}</div>
                <div className="p-3">
                  {editingDuty ? (
                    <div className="space-y-2">
                      {duties.map((d, idx) => d.day_index === dIdx && (
                        <div key={idx} className="flex gap-1">
                          <input value={d.student_name} onChange={e => updateDuty(idx, e.target.value)} className="flex-1 text-xs px-2 py-1.5 border border-slate-200 rounded outline-none" placeholder="Nama siswa" />
                          <button onClick={() => removeDutyRow(idx)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => addDutyRow(dIdx)} className="w-full py-1 border border-dashed border-slate-300 text-slate-500 rounded text-xs hover:bg-slate-50"><Plus size={12} className="inline" /> Tambah</button>
                    </div>
                  ) : (
                    <ul className="list-disc pl-4 text-sm text-slate-700 space-y-1">
                      {duties.filter(d => d.day_index === dIdx).map((d, i) => (
                        <li key={i}>{d.student_name}</li>
                      ))}
                      {duties.filter(d => d.day_index === dIdx).length === 0 && <li className="text-slate-400 text-xs list-none -ml-4 text-center">Kosong</li>}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
