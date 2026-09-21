import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, Brain } from 'lucide-react';

export default function PomodoroPage() {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [totalSec, setTotalSec] = useState(25 * 60);
  const [secLeft, setSecLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [rainOn, setRainOn] = useState(false);
  const [noiseOn, setNoiseOn] = useState(false);
  const intervalRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rainNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRainRef = useRef<GainNode | null>(null);
  const gainNoiseRef = useRef<GainNode | null>(null);

  const getCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    return audioCtxRef.current;
  };

  const playBeep = () => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.8);
  };

  const createNoiseBuffer = (ctx: AudioContext, brown: boolean) => {
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      if (brown) { last = (last + (0.02 * white)) / 1.02; data[i] = last * 3.5; }
      else data[i] = white;
    }
    return buf;
  };

  const toggleRain = () => {
    if (rainOn) { rainNodeRef.current?.stop(); rainNodeRef.current = null; setRainOn(false); return; }
    const ctx = getCtx();
    const buf = createNoiseBuffer(ctx, true);
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const gain = ctx.createGain(); gain.gain.value = 0.4;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 400;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    rainNodeRef.current = src; gainRainRef.current = gain;
    setRainOn(true);
  };

  const toggleNoise = () => {
    if (noiseOn) { noiseNodeRef.current?.stop(); noiseNodeRef.current = null; setNoiseOn(false); return; }
    const ctx = getCtx();
    const buf = createNoiseBuffer(ctx, false);
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const gain = ctx.createGain(); gain.gain.value = 0.08;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1000;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    noiseNodeRef.current = src; gainNoiseRef.current = gain;
    setNoiseOn(true);
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      rainNodeRef.current?.stop();
      noiseNodeRef.current?.stop();
      audioCtxRef.current?.close();
    };
  }, []);

  const switchMode = (m: 'focus' | 'break') => {
    clearInterval(intervalRef.current); setRunning(false);
    const dur = m === 'focus' ? 25 * 60 : 5 * 60;
    setMode(m); setTotalSec(dur); setSecLeft(dur);
  };

  const start = () => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSecLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current); setRunning(false); playBeep();
          if (mode === 'focus') setCompleted(c => c + 1);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const pause = () => { clearInterval(intervalRef.current); setRunning(false); };
  const reset = () => { clearInterval(intervalRef.current); setRunning(false); setSecLeft(totalSec); };

  const mm = String(Math.floor(secLeft / 60)).padStart(2, '0');
  const ss = String(secLeft % 60).padStart(2, '0');
  const progress = ((totalSec - secLeft) / totalSec) * 100;

  return (
    <PageWrapper>
      <div className="max-w-lg mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"><ArrowLeft size={16} /> Kembali</Link>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Pomodoro Timer</h1>
        <p className="text-slate-500 mb-8">Fokus belajar dengan teknik Pomodoro.</p>

        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <div className="flex justify-center gap-2 mb-8">
            <button onClick={() => switchMode('focus')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${mode === 'focus' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Brain size={16} /> Fokus</button>
            <button onClick={() => switchMode('break')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition ${mode === 'break' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Coffee size={16} /> Istirahat</button>
          </div>

          <div className="text-center mb-8">
            <div className={`text-7xl font-extrabold font-mono tracking-wider ${mode === 'focus' ? 'text-rose-600' : 'text-emerald-600'}`}>{mm}:{ss}</div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 mb-8 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${mode === 'focus' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }} />
          </div>

          <div className="flex gap-3 mb-8">
            {!running ? (
              <button onClick={start} disabled={secLeft === 0} className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-40"><Play size={16} /> Mulai</button>
            ) : (
              <button onClick={pause} className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2"><Pause size={16} /> Jeda</button>
            )}
            <button onClick={reset} className="py-3 px-5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm flex items-center gap-2"><RotateCcw size={16} /> Reset</button>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Suara Latar (Ambient)</h3>
            <div className="flex gap-3">
              <button onClick={toggleRain} className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition ${rainOn ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {rainOn ? <Volume2 size={16} /> : <VolumeX size={16} />} Hujan
              </button>
              <button onClick={toggleNoise} className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition ${noiseOn ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {noiseOn ? <Volume2 size={16} /> : <VolumeX size={16} />} White Noise
              </button>
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-slate-500">
            Sesi selesai: <span className="font-bold text-slate-900">{completed}</span> pomodoro
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
