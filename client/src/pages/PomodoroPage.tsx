import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, Brain, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
    rainNodeRef.current = src;
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
    noiseNodeRef.current = src;
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
  
  // Progress calculations
  const progressRatio = (totalSec - secLeft) / totalSec;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft size={14} /> Kembali ke Dashboard
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pomodoro Focus Timer</h1>
          <p className="text-xs text-slate-500 mt-1">Gunakan teknik interval fokus 25 menit untuk meningkatkan produktivitas belajar.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          {/* Animated Background Pulse Ring when Running */}
          {running && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.3 }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.35, 0.15] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className={`absolute -inset-10 rounded-full blur-3xl pointer-events-none ${
                mode === 'focus' ? 'bg-rose-500/20' : 'bg-emerald-500/20'
              }`}
            />
          )}

          {/* Mode Switcher */}
          <div className="flex justify-center gap-2 mb-8 relative z-10">
            <button 
              onClick={() => switchMode('focus')} 
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                mode === 'focus' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Brain size={15} /> Sesi Fokus (25m)
            </button>
            <button 
              onClick={() => switchMode('break')} 
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                mode === 'break' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Coffee size={15} /> Istirahat (5m)
            </button>
          </div>

          {/* Circular SVG Progress Display */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-64 h-64 -rotate-90 transform">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100"
                fill="transparent"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="10"
                className={mode === 'focus' ? 'text-rose-500' : 'text-emerald-500'}
                fill="transparent"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                strokeLinecap="round"
              />
            </svg>

            {/* Time In Center */}
            <div className="absolute text-center">
              <motion.div 
                key={`${mm}:${ss}`}
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                className={`text-6xl font-black font-mono tracking-tight ${
                  mode === 'focus' ? 'text-slate-900' : 'text-emerald-600'
                }`}
              >
                {mm}:{ss}
              </motion.div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {running ? (mode === 'focus' ? 'Fokus Berjalan...' : 'Waktu Istirahat') : 'Siap Mulai'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 my-6 max-w-xs mx-auto">
            {!running ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={start} 
                disabled={secLeft === 0} 
                className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <Play size={16} /> Mulai Fokus
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={pause} 
                className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md hover:bg-amber-600 transition"
              >
                <Pause size={16} /> Jeda Sesi
              </motion.button>
            )}
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={reset} 
              className="py-3 px-5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 hover:bg-slate-200 transition"
            >
              <RotateCcw size={15} /> Reset
            </motion.button>
          </div>

          {/* Interactive Ambient Sounds with Animated Waveform */}
          <div className="border-t border-slate-100 pt-6 mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Suara Latar Penunjang Konsentrasi (Ambient)
              </h3>
              {(rainOn || noiseOn) && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-emerald-600">Audio Aktif</span>
                  {/* Jumping Sound Wave bars */}
                  <div className="flex items-end gap-0.5 h-3">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ['4px', '12px', '6px', '14px', '4px'] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                        className="w-1 bg-emerald-500 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={toggleRain} 
                className={`py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition border ${
                  rainOn 
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/20' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {rainOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>Suara Hujan (Rain)</span>
              </button>

              <button 
                onClick={toggleNoise} 
                className={`py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition border ${
                  noiseOn 
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-600/20' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {noiseOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>White Noise</span>
              </button>
            </div>
          </div>

          <div className="text-center mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
            Sesi Pomodoro berhasil diselesaikan: <strong className="text-slate-800">{completed}</strong> sesi
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
