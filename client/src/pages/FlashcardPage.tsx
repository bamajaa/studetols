import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { ArrowLeft, Plus, Trash2, ChevronLeft, ChevronRight, RotateCcw, Layers, Shuffle, Sparkles, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Cartoon Flashcard Mascot "Flashy" with Animated Blinking Eyes ───
function FlashcardMascot({ flipped, isDone, size = 95 }: { flipped?: boolean; isDone?: boolean; size?: number }) {
  return (
    <motion.div
      animate={{ y: [-4, 4, -4], rotate: [-1.5, 1.5, -1.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="relative flex items-center justify-center select-none flex-shrink-0"
    >
      {/* Floating Sparkles & Lightbulb */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-3 -right-2 text-amber-400 z-10"
      >
        <Sparkles size={16} />
      </motion.div>

      {/* Mascot Card Character SVG */}
      <svg viewBox="0 0 120 120" width={size} height={size} className="drop-shadow-md">
        {/* Shadow Behind */}
        <ellipse cx="60" cy="112" rx="35" ry="6" fill="#cbd5e1" opacity="0.4" />

        {/* Card Body - Purple & White Concept */}
        <rect x="18" y="14" width="84" height="92" rx="18" fill="#7c3aed" stroke="#6d28d9" strokeWidth="2" />
        <rect x="22" y="18" width="76" height="84" rx="14" fill="#f5f3ff" />
        <rect x="26" y="22" width="68" height="76" rx="10" fill="#ffffff" />

        {/* Card Header Stripe */}
        <path d="M26,34 L94,34" stroke="#ddd6fe" strokeWidth="3" strokeLinecap="round" />
        <circle cx="34" cy="28" r="2.5" fill="#8b5cf6" />
        <circle cx="42" cy="28" r="2.5" fill="#c4b5fd" />

        {/* Rosy Cheeks */}
        <circle cx="38" cy="68" r="6" fill="#f472b6" opacity="0.55" />
        <circle cx="82" cy="68" r="6" fill="#f472b6" opacity="0.55" />

        {/* Eyebrows */}
        <path d="M40,48 Q46,45 52,48" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
        <path d="M68,48 Q74,45 80,48" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />

        {/* Left Eye: Winks when flipped! */}
        {flipped ? (
          <path d="M38,58 Q46,65 54,58" fill="none" stroke="#1e1b4b" strokeWidth="2.8" strokeLinecap="round" />
        ) : (
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1, 1, 1, 0.1, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.45, 0.48, 0.52, 0.72, 0.88, 0.91, 0.95] }}
            style={{ transformOrigin: '46px 57px' }}
          >
            <ellipse cx="46" cy="57" rx="6" ry="8" fill="#1e1b4b" />
            <circle cx="44" cy="54" r="2.2" fill="#ffffff" />
            <circle cx="48" cy="59" r="1.2" fill="#ffffff" />
          </motion.g>
        )}

        {/* Right Eye: Blinks regularly */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.1, 1, 1, 1, 0.1, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.45, 0.48, 0.52, 0.72, 0.88, 0.91, 0.95] }}
          style={{ transformOrigin: '74px 57px' }}
        >
          <ellipse cx="74" cy="57" rx="6" ry="8" fill="#1e1b4b" />
          <circle cx="72" cy="54" r="2.2" fill="#ffffff" />
          <circle cx="76" cy="59" r="1.2" fill="#ffffff" />
        </motion.g>

        {/* Mouth */}
        {isDone ? (
          <path d="M52,66 Q60,78 68,66" fill="#f43f5e" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M53,66 Q60,74 67,66" fill="none" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Cute Graduation Mortarboard Cap */}
        <g transform="translate(38, 2)">
          <polygon points="22,0 44,8 22,16 0,8" fill="#1e1b4b" />
          <polygon points="8,11 8,18 36,18 36,11" fill="#312e81" />
          <circle cx="22" cy="8" r="2" fill="#fbbf24" />
          <path d="M22,8 Q34,12 36,22" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Little Cartoon Hands */}
        <rect x="8" y="58" width="10" height="15" rx="5" fill="#7c3aed" />
        <rect x="102" y="58" width="10" height="15" rx="5" fill="#7c3aed" />
      </svg>
    </motion.div>
  );
}

export default function FlashcardPage() {
  const [decks, setDecks] = useState<any[]>([]);
  const [deckTitle, setDeckTitle] = useState('');
  const [activeDeck, setActiveDeck] = useState<number | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const loadDecks = async () => { setDecks(await api.get('/api/flashcards/decks')); };
  useEffect(() => { loadDecks(); }, []);

  const createDeck = async () => {
    if (!deckTitle.trim()) return;
    await api.post('/api/flashcards/decks', { title: deckTitle });
    setDeckTitle(''); loadDecks();
  };

  const deleteDeck = async (id: number) => {
    if (!confirm('Hapus deck ini?')) return;
    await api.delete(`/api/flashcards/decks/${id}`);
    if (activeDeck === id) { setActiveDeck(null); setCards([]); }
    loadDecks();
  };

  const openDeck = async (id: number) => {
    setActiveDeck(id); setCurrentIdx(0); setFlipped(false);
    const loadedCards = await api.get(`/api/flashcards/decks/${id}/cards`);
    setCards(loadedCards);
  };

  const addCard = async () => {
    if (!front.trim() || !back.trim() || !activeDeck) return;
    await api.post(`/api/flashcards/decks/${activeDeck}/cards`, { front, back });
    setFront(''); setBack('');
    const updated = await api.get(`/api/flashcards/decks/${activeDeck}/cards`);
    setCards(updated);
  };

  const deleteCard = async (id: number) => {
    await api.delete(`/api/flashcards/cards/${id}`);
    const updated = await api.get(`/api/flashcards/decks/${activeDeck}/cards`);
    setCards(updated);
    if (currentIdx >= updated.length) setCurrentIdx(Math.max(0, updated.length - 1));
    setFlipped(false);
  };

  const prev = useCallback(() => { setCurrentIdx(i => Math.max(0, i - 1)); setFlipped(false); }, []);
  const next = useCallback(() => { setCurrentIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); }, [cards.length]);
  const toggleFlip = useCallback(() => { setFlipped(f => !f); }, []);

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIdx(0);
    setFlipped(false);
  };

  // Keyboard navigation shortcuts: Space = flip, ArrowLeft = prev, ArrowRight = next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggleFlip();
      } else if (e.code === 'ArrowLeft') {
        prev();
      } else if (e.code === 'ArrowRight') {
        next();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFlip, prev, next]);

  const currentCard = cards[currentIdx];
  const progressPercent = cards.length > 0 ? ((currentIdx + 1) / cards.length) * 100 : 0;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft size={14} /> Kembali ke Dashboard
        </Link>
        
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200 mb-2">
            <Layers size={13} /> Belajar Interaktif 3D
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Flashcard 3D Generator</h1>
          <p className="text-xs text-slate-500 mt-0.5">Asah daya ingat hafalan rumus, bahasa, dan definisi dengan efek 3D flip fisik.</p>
        </div>

        {!activeDeck ? (
          <>
            {/* Mascot Welcoming Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-50 via-indigo-50/70 to-purple-50/50 border border-purple-200/80 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden shadow-sm"
            >
              <div className="flex-shrink-0">
                <FlashcardMascot size={90} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full uppercase tracking-wider mb-1.5">
                  <Sparkles size={11} /> Sahabat Flashcard Cerdas
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Yuk Asah Daya Ingat Bersama Flashy!
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Latih hafalan rumus, istilah, definisi, dan kosakata bahasa baru menggunakan simulasi kartu 3D fisik. Tekan kartu atau tombol spasi untuk membalik!
                </p>
              </div>
            </motion.div>

            <div className="flex gap-2 mb-8 max-w-xl">
              <input 
                value={deckTitle} 
                onChange={e => setDeckTitle(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && createDeck()} 
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600 outline-none" 
                placeholder="Nama deck baru (contoh: Kosakata JLPT N5)..." 
              />
              <button 
                onClick={createDeck} 
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus size={14} /> Buat Deck
              </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {decks.map((d, i) => (
                <motion.div 
                  key={d.id} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400 } }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                  onClick={() => openDeck(d.id)}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Layers size={18} />
                      </div>
                      <button 
                        onClick={e => { e.stopPropagation(); deleteDeck(d.id); }} 
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition p-1"
                        title="Hapus deck"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors mb-1">
                      {d.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>{d.card_count || 0} kartu</span>
                    <span className="text-purple-600 font-bold group-hover:translate-x-1 transition-transform">Buka →</span>
                  </div>
                </motion.div>
              ))}
              {decks.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                  Belum ada deck kartu hafalan.<br />Ketik nama deck di atas untuk memulai.
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <button 
                onClick={() => { setActiveDeck(null); loadDecks(); }} 
                className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft size={14} /> Kembali ke Daftar Deck
              </button>

              <div className="flex items-center gap-3">
                {cards.length > 1 && (
                  <button
                    onClick={shuffleCards}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                    title="Acak urutan kartu"
                  >
                    <Shuffle size={13} /> Acak Kartu
                  </button>
                )}
                
                {/* Keyboard Shortcut Hints */}
                <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <Keyboard size={12} />
                  <span>Spasi: Balik</span> • <span>←/→: Navigasi</span>
                </div>
              </div>
            </div>

            {cards.length > 0 && currentCard && (
              <div className="mb-10">
                {/* Mascot Study Companion Bar */}
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-purple-200/80 rounded-2xl p-3.5 mb-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                      <FlashcardMascot flipped={flipped} isDone={currentIdx === cards.length - 1 && flipped} size={62} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {flipped ? 'Jawaban Terbuka! 💡' : 'Sisi Pertanyaan 🤔'}
                        <span className="text-[10px] text-slate-400 font-normal">
                          • Kartu {currentIdx + 1} dari {cards.length}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {flipped
                          ? 'Keren! Cek apakah tebakanmu tepat, lalu lanjut ke kartu berikutnya!'
                          : 'Coba ingat-ingat dulu jawabannya di kepalamu sebelum membalik kartu ya!'}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-black text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100 flex items-center gap-1.5 flex-shrink-0">
                    <Layers size={13} className="text-purple-600" />
                    <span>Progres: {Math.round(progressPercent)}%</span>
                  </div>
                </motion.div>

                {/* Celebratory Completion Message */}
                {currentIdx === cards.length - 1 && flipped && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-2xl p-4 text-center mb-6 shadow-md"
                  >
                    <p className="text-xs font-black">🎉 Luar Biasa! Kamu berhasil menuntaskan seluruh kartu di deck ini!</p>
                    <p className="text-[11px] text-emerald-100 mt-0.5">
                      Gunakan tombol <strong>Acak Kartu</strong> di kanan atas untuk menguji ingatanmu kembali dari urutan acak.
                    </p>
                  </motion.div>
                )}

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6 overflow-hidden">
                  <motion.div 
                    className="h-full bg-purple-600 rounded-full" 
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* 3D Flip Card Container */}
                <div className="perspective-1000 mx-auto max-w-lg" style={{ perspective: '1200px' }}>
                  <motion.div
                    onClick={toggleFlip}
                    className="relative w-full cursor-pointer select-none"
                    style={{ transformStyle: 'preserve-3d', height: '290px' }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                    whileHover={{ scale: 1.015 }}
                  >
                    {/* Front Face */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-8 flex flex-col items-center justify-between text-white shadow-xl shadow-purple-950/20 border border-slate-700/50" 
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="flex items-center justify-between w-full text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        <span>SISI PERTANYAAN</span>
                        <span className="bg-white/10 px-2 py-0.5 rounded-full">{currentIdx + 1} / {cards.length}</span>
                      </div>

                      <div className="text-xl sm:text-2xl font-black text-center leading-relaxed px-4">
                        {currentCard.front}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <RotateCcw size={12} /> Klik kartu atau tekan Spasi untuk melihat jawaban
                      </div>
                    </div>

                    {/* Back Face */}
                    <div 
                      className="absolute inset-0 bg-white border-2 border-purple-300 rounded-3xl p-8 flex flex-col items-center justify-between shadow-xl shadow-purple-500/5" 
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <div className="flex items-center justify-between w-full text-[10px] uppercase font-bold tracking-widest text-purple-600">
                        <span>SISI JAWABAN & DEFINISI</span>
                        <span className="bg-purple-50 px-2 py-0.5 rounded-full">{currentIdx + 1} / {cards.length}</span>
                      </div>

                      <div className="text-xl sm:text-2xl font-black text-center text-slate-900 leading-relaxed px-4">
                        {currentCard.back}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <RotateCcw size={12} /> Klik untuk membalik kembali
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={prev} 
                    disabled={currentIdx === 0} 
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-slate-50 flex items-center gap-1 transition shadow-sm"
                  >
                    <ChevronLeft size={16} /> Sebelumnya
                  </motion.button>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
                    {currentIdx + 1} dari {cards.length}
                  </span>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={next} 
                    disabled={currentIdx === cards.length - 1} 
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-slate-50 flex items-center gap-1 transition shadow-sm"
                  >
                    Selanjutnya <ChevronRight size={16} />
                  </motion.button>
                </div>

                <div className="flex justify-center mt-3">
                  <button 
                    onClick={() => deleteCard(currentCard.id)} 
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                  >
                    <Trash2 size={12} /> Hapus kartu ini
                  </button>
                </div>
              </div>
            )}

            {/* Add Card Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 mb-4">Tambah Kartu Baru ke Deck</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">Sisi Depan (Pertanyaan / Istilah)</label>
                  <textarea 
                    value={front} 
                    onChange={e => setFront(e.target.value)} 
                    rows={3} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600 resize-none font-medium" 
                    placeholder="Contoh: Apa fungsi mitokondria?" 
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">Sisi Belakang (Jawaban / Definisi)</label>
                  <textarea 
                    value={back} 
                    onChange={e => setBack(e.target.value)} 
                    rows={3} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600 resize-none font-medium" 
                    placeholder="Contoh: Tempat respirasi seluler penghasil energi (ATP)." 
                  />
                </div>
              </div>
              <button 
                onClick={addCard} 
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <Plus size={14} /> Simpan Kartu
              </button>
            </div>

            {cards.length === 0 && (
              <div className="text-center py-10 flex flex-col items-center gap-3">
                <FlashcardMascot size={75} />
                <div>
                  <p className="font-bold text-slate-700 text-sm">Deck ini masih kosong!</p>
                  <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                    Ketik pertanyaan dan jawaban di formulir atas untuk menyimpan kartu pertamamu!
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
