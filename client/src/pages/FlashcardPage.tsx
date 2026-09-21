import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { api } from '../api/client';
import { ArrowLeft, Plus, Trash2, ChevronLeft, ChevronRight, RotateCcw, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

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
    setCards(await api.get(`/api/flashcards/decks/${id}/cards`));
  };

  const addCard = async () => {
    if (!front.trim() || !back.trim() || !activeDeck) return;
    await api.post(`/api/flashcards/decks/${activeDeck}/cards`, { front, back });
    setFront(''); setBack('');
    setCards(await api.get(`/api/flashcards/decks/${activeDeck}/cards`));
  };

  const deleteCard = async (id: number) => {
    await api.delete(`/api/flashcards/cards/${id}`);
    const updated = await api.get(`/api/flashcards/decks/${activeDeck}/cards`);
    setCards(updated);
    if (currentIdx >= updated.length) setCurrentIdx(Math.max(0, updated.length - 1));
    setFlipped(false);
  };

  const prev = () => { setCurrentIdx(i => Math.max(0, i - 1)); setFlipped(false); };
  const next = () => { setCurrentIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); };

  const currentCard = cards[currentIdx];

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"><ArrowLeft size={16} /> Kembali</Link>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Flashcard Generator</h1>
        <p className="text-slate-500 mb-8">Buat kartu hafalan interaktif untuk belajar.</p>

        {!activeDeck ? (
          <>
            <div className="flex gap-2 mb-6">
              <input value={deckTitle} onChange={e => setDeckTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && createDeck()} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Judul deck baru..." />
              <button onClick={createDeck} className="px-5 py-3 bg-purple-600 text-white font-semibold rounded-xl text-sm hover:bg-purple-700 flex items-center gap-2"><Plus size={16} /> Buat Deck</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {decks.map(d => (
                <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => openDeck(d.id)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1"><Layers size={16} className="text-purple-600" /><h3 className="font-bold text-slate-900">{d.title}</h3></div>
                      <p className="text-xs text-slate-500">{d.card_count} kartu</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteDeck(d.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {decks.length === 0 && <p className="text-slate-400 text-sm col-span-2 text-center py-8">Belum ada deck. Buat yang pertama!</p>}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => { setActiveDeck(null); loadDecks(); }} className="text-sm text-purple-600 hover:text-purple-800 font-medium mb-6 flex items-center gap-1"><ArrowLeft size={14} /> Kembali ke Daftar Deck</button>

            {cards.length > 0 && currentCard && (
              <div className="mb-8">
                <div className="perspective-1000 mx-auto max-w-lg" style={{ perspective: '1000px' }}>
                  <motion.div
                    onClick={() => setFlipped(!flipped)}
                    className="relative w-full cursor-pointer"
                    style={{ transformStyle: 'preserve-3d', height: '280px' }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 flex flex-col items-center justify-center text-white shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
                      <div className="text-xs uppercase tracking-wider opacity-70 mb-3">Sisi Depan</div>
                      <div className="text-xl font-bold text-center leading-relaxed">{currentCard.front}</div>
                      <div className="text-xs opacity-50 mt-4 flex items-center gap-1"><RotateCcw size={12} /> Klik untuk membalik</div>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 bg-white border-2 border-purple-200 rounded-2xl p-8 flex flex-col items-center justify-center shadow-xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      <div className="text-xs uppercase tracking-wider text-purple-400 mb-3">Sisi Belakang</div>
                      <div className="text-xl font-bold text-slate-900 text-center leading-relaxed">{currentCard.back}</div>
                      <div className="text-xs text-slate-400 mt-4 flex items-center gap-1"><RotateCcw size={12} /> Klik untuk membalik</div>
                    </div>
                  </motion.div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-6">
                  <button onClick={prev} disabled={currentIdx === 0} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-30 hover:bg-slate-50 flex items-center gap-1"><ChevronLeft size={16} /> Sebelumnya</button>
                  <span className="text-sm font-medium text-slate-600">{currentIdx + 1} / {cards.length}</span>
                  <button onClick={next} disabled={currentIdx === cards.length - 1} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-30 hover:bg-slate-50 flex items-center gap-1">Selanjutnya <ChevronRight size={16} /></button>
                </div>

                <div className="flex justify-center mt-3">
                  <button onClick={() => deleteCard(currentCard.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 size={12} /> Hapus kartu ini</button>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="font-bold text-slate-900 mb-3">Tambah Kartu Baru</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div><label className="text-xs text-slate-500 mb-1 block">Sisi Depan (Pertanyaan)</label><textarea value={front} onChange={e => setFront(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none" placeholder="Tulis pertanyaan..." /></div>
                <div><label className="text-xs text-slate-500 mb-1 block">Sisi Belakang (Jawaban)</label><textarea value={back} onChange={e => setBack(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm resize-none" placeholder="Tulis jawaban..." /></div>
              </div>
              <button onClick={addCard} className="px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-xl text-sm hover:bg-purple-700 flex items-center gap-2"><Plus size={16} /> Tambah Kartu</button>
            </div>

            {cards.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">Deck ini belum punya kartu. Tambahkan kartu pertama!</p>}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
