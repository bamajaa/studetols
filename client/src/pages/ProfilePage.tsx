import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Camera, 
  BookOpen, 
  Check, 
  Sparkles, 
  Save, 
  Smile, 
  BookMarked, 
  Award,
  AlertCircle,
  RefreshCw,
  Users,
  Search,
  MessageCircle,
  Clock,
  CheckCircle2,
  FileText,
  Layers,
  Send,
  UserPlus,
  UserMinus,
  ExternalLink,
  Flame,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';

const SUGGESTED_SUBJECTS = [
  'Matematika', 
  'Fisika', 
  'Kimia', 
  'Biologi', 
  'Informatika & Pemrograman', 
  'Bahasa Inggris', 
  'Ekonomi & Bisnis', 
  'Akuntansi', 
  'Sejarah', 
  'Desain Grafis & Multimedia'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
];

export default function ProfilePage() {
  const { token, label, avatar: initialAvatar, bio: initialBio, favoriteSubject: initialFavSubject, updateUserContext } = useAuth();
  
  // Tab Navigation: 'edit' | 'friends' | 'chat'
  const [activeTab, setActiveTab] = useState<'edit' | 'friends' | 'chat'>('edit');

  // Edit Profile States
  const [username, setUsername] = useState('');
  const [displayLabel, setDisplayLabel] = useState(label || '');
  const [avatar, setAvatar] = useState(initialAvatar || '');
  const [bio, setBio] = useState(initialBio || '');
  const [favoriteSubject, setFavoriteSubject] = useState(initialFavSubject || '');
  const [customSubject, setCustomSubject] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Friend & Search User States
  const [searchUsername, setSearchUsername] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  // Direct Chat States
  const [activeChatFriend, setActiveChatFriend] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch complete profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username || '');
          setDisplayLabel(data.label || data.username || '');
          setAvatar(data.avatar || '');
          setBio(data.bio || '');
          setFavoriteSubject(data.favorite_subject || '');
          if (data.favorite_subject && !SUGGESTED_SUBJECTS.includes(data.favorite_subject)) {
            setCustomSubject(data.favorite_subject);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchProfile();
      loadFriends();
      const interval = setInterval(loadFriends, 4000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const totalUnreadMessages = friendsList.reduce((acc, f) => acc + (Number(f.unread_count) || 0), 0);

  // Load Friends List
  const loadFriends = async () => {
    setLoadingFriends(true);
    try {
      const res = await fetch('/api/friends/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFriendsList(data);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  // Search User by Username
  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    setSearching(true);
    setSearchError('');
    setSearchedUser(null);

    try {
      const res = await fetch(`/api/friends/user/${encodeURIComponent(searchUsername.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error || 'Pengguna tidak ditemukan');
      } else {
        setSearchedUser(data);
      }
    } catch (err) {
      setSearchError('Gagal mencari pengguna.');
    } finally {
      setSearching(false);
    }
  };

  // Add Friend
  const handleAddFriend = async (targetUsername: string) => {
    try {
      const res = await fetch('/api/friends/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username: targetUsername })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal menambahkan teman');
      } else {
        alert(data.message);
        loadFriends();
        if (searchedUser) {
          setSearchedUser({ ...searchedUser, isFriend: true });
        }
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  // Remove Friend
  const handleRemoveFriend = async (friendId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pertemanan ini?')) return;
    try {
      const res = await fetch(`/api/friends/remove/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        loadFriends();
        if (searchedUser && searchedUser.user.id === friendId) {
          setSearchedUser({ ...searchedUser, isFriend: false });
        }
        if (activeChatFriend && activeChatFriend.friend_id === friendId) {
          setActiveChatFriend(null);
        }
      }
    } catch (err) {
      alert('Gagal menghapus teman');
    }
  };

  // Fetch Chat Messages with Friend
  const openChatWith = (friend: any) => {
    setActiveChatFriend(friend);
    setFriendsList((prev) => prev.map((f) => (f.friend_id === friend.friend_id || f.friend_id === friend.id) ? { ...f, unread_count: 0 } : f));
    setActiveTab('chat');
  };

  useEffect(() => {
    if (!activeChatFriend || activeTab !== 'chat') return;

    let isMounted = true;
    const friendId = activeChatFriend.friend_id || activeChatFriend.id;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/friends/messages/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setChatMessages(data);
          setFriendsList((prev) => prev.map((f) => (f.friend_id === friendId || f.friend_id === friendId) ? { ...f, unread_count: 0 } : f));
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling chat every 3 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeChatFriend, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChatFriend || sendingMsg) return;

    const friendId = activeChatFriend.friend_id || activeChatFriend.id;
    const msgText = inputMessage.trim();
    setInputMessage('');
    setSendingMsg(true);

    try {
      const res = await fetch('/api/friends/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: friendId,
          message: msgText
        })
      });

      if (res.ok) {
        // Optimistically add message
        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender_id: 'me',
            receiver_id: friendId,
            message: msgText,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      alert('Gagal mengirim pesan');
    } finally {
      setSendingMsg(false);
    }
  };

  // Handle local image upload -> Resize & Compress -> Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran foto maksimal 20MB' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Downscale to max 400x400 for crisp, lightweight avatar
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 400;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setAvatar(optimizedBase64);
          } else {
            setAvatar(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const finalFavSubject = customSubject.trim() ? customSubject.trim() : favoriteSubject;

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          label: displayLabel,
          avatar,
          bio,
          favorite_subject: finalFavSubject
        })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(res.status === 413 ? 'Ukuran foto terlalu besar untuk disimpan.' : 'Terjadi kendala pada server saat menyimpan profil.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan perubahan');
      }

      updateUserContext({
        label: displayLabel,
        avatar,
        bio,
        favoriteSubject: finalFavSubject,
        token: data.token
      });

      setMessage({ type: 'success', text: 'Profil berhasil diperbarui dengan aman!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan sistem' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[70vh] flex items-center justify-center">
          <RefreshCw size={28} className="animate-spin text-indigo-600" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <User size={14} />
              <span>Sistem Profil & Komunitas Belajar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Profil & Komunitas
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Atur identitas, temukan profil teman beserta statistiknya, dan kirim pesan langsung.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'edit'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={14} />
              <span>Edit Profil</span>
            </button>

            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'friends'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={14} />
              <span>Teman & Cari</span>
              {friendsList.length > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full font-extrabold">
                  {friendsList.length}
                </span>
              )}
            </button>

            <Link
              to="/friends"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 hover:bg-purple-50 transition-all border border-purple-200/80 bg-white"
              title="Buka Halaman Komunitas & Teman Penuh"
            >
              <Users size={13} />
              <span>Menu Teman &rarr;</span>
            </Link>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageCircle size={14} />
              <span>Pesan Teman</span>
              {totalUnreadMessages > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-black animate-pulse shadow-sm">
                  {totalUnreadMessages}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: EDIT PROFILE */}
        {activeTab === 'edit' && (
          <div>
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
                    message.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {message.type === 'success' ? <Check size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-rose-600" />}
                  <span>{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Avatar & Quick Preview Card */}
              <div className="flex flex-col items-center">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm w-full flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt="Foto Profil" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-slate-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-transform active:scale-95 group-hover:scale-105"
                      title="Ganti Foto"
                    >
                      <Camera size={16} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  <h2 className="font-extrabold text-base text-slate-900 tracking-tight">{displayLabel || username || 'Pengguna'}</h2>
                  <p className="text-xs text-slate-400 font-medium mb-3">@{username}</p>

                  {favoriteSubject && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full text-xs font-semibold mb-3">
                      <Award size={13} />
                      <span>{favoriteSubject}</span>
                    </div>
                  )}

                  {bio && (
                    <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100 w-full text-left">
                      "{bio}"
                    </p>
                  )}

                  {/* Preset Avatar Selection */}
                  <div className="mt-5 w-full pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 block mb-2 text-left uppercase tracking-wider">
                      Pilih Avatar Cepat:
                    </span>
                    <div className="grid grid-cols-6 gap-1.5">
                      {PRESET_AVATARS.map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(presetUrl)}
                          className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                            avatar === presetUrl ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Editable Profile Form */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Smile size={16} className="text-indigo-600" />
                    Informasi Akun & Identitas
                  </h3>

                  {/* Username & Display Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Username Akun (Unik)
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                        placeholder="Contoh: ihsan123"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Username harus unik dan tidak boleh sama dengan orang lain.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Tampilan (Display Label)
                      </label>
                      <input
                        type="text"
                        value={displayLabel}
                        onChange={(e) => setDisplayLabel(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                        placeholder="Nama panggilan atau nama lengkap..."
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Muncul di header workspace & dashboard.</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Deskripsi Singkat (Bio)
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={250}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition resize-none leading-relaxed"
                      placeholder="Tuliskan motto belajar, jurusan, atau bio singkat Anda di sini..."
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>Motto atau bio belajar</span>
                      <span>{bio.length}/250</span>
                    </div>
                  </div>

                  {/* Pelajaran Favorit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <BookMarked size={14} className="text-amber-500" />
                      Pelajaran Favorit
                    </label>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {SUGGESTED_SUBJECTS.map((subj) => {
                        const isSelected = favoriteSubject === subj && !customSubject;
                        return (
                          <button
                            key={subj}
                            type="button"
                            onClick={() => {
                              setFavoriteSubject(subj);
                              setCustomSubject('');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-sm scale-105'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {subj}
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative">
                      <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={customSubject}
                        onChange={(e) => {
                          setCustomSubject(e.target.value);
                          if (e.target.value) setFavoriteSubject(e.target.value);
                        }}
                        placeholder="Atau ketik pelajaran favorit lainnya..."
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Simpan Perubahan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: FRIENDS & USER SEARCH WITH STATS */}
        {activeTab === 'friends' && (
          <div className="space-y-8">
            {/* Search Bar for Other Users */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                <Search size={16} className="text-indigo-600" />
                Cari Teman & Lihat Statistik Belajarnya
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Ketik username teman untuk melihat profil, statistik produktivitas akademik, dan tambah ke daftar teman.
              </p>

              <form onSubmit={handleSearchUser} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    placeholder="Masukkan username teman (misal: admin, ihsan...)"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !searchUsername.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                >
                  {searching ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                  <span>Cari</span>
                </button>
              </form>

              {searchError && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Searched User Result with Detailed Stats */}
              {searchedUser && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/20 rounded-2xl p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-indigo-600 shadow-md flex items-center justify-center">
                        {searchedUser.user.avatar ? (
                          <img src={searchedUser.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-base">{searchedUser.user.label}</h4>
                          <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                            {searchedUser.user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">@{searchedUser.user.username}</p>
                        {searchedUser.user.favorite_subject && (
                          <p className="text-xs text-indigo-600 font-semibold mt-1">
                            Pelajaran Favorit: <strong>{searchedUser.user.favorite_subject}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!searchedUser.isSelf && (
                        <>
                          {searchedUser.isFriend ? (
                            <>
                              <button
                                onClick={() => openChatWith({ friend_id: searchedUser.user.id, label: searchedUser.user.label, username: searchedUser.user.username, avatar: searchedUser.user.avatar })}
                                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <MessageCircle size={14} />
                                <span>Kirim Pesan</span>
                              </button>
                              <button
                                onClick={() => handleRemoveFriend(searchedUser.user.id)}
                                className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl text-xs font-semibold transition"
                                title="Hapus pertemanan"
                              >
                                <UserMinus size={14} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(searchedUser.user.username)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                            >
                              <UserPlus size={14} />
                              <span>Tambah Teman</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {searchedUser.user.bio && (
                    <p className="text-xs text-slate-600 italic mt-3 bg-white/80 p-3 rounded-xl border border-slate-100">
                      "{searchedUser.user.bio}"
                    </p>
                  )}

                  {/* Stats Grid for Searched User */}
                  <div className="mt-5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                      Statistik Belajar & Produktivitas Pengguna:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm text-center">
                        <div className="text-lg font-black text-indigo-600">
                          {Math.round(searchedUser.stats.totalStudyMinutes / 60 * 10) / 10} jam
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Waktu Belajar ({searchedUser.stats.studySessions} sesi)</div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm text-center">
                        <div className="text-lg font-black text-emerald-600">
                          {searchedUser.stats.completedTasks} / {searchedUser.stats.totalTasks}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Tugas Selesai</div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm text-center">
                        <div className="text-lg font-black text-purple-600">
                          {searchedUser.stats.flashcardDecks} Deck
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Flashcard Hafalan</div>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm text-center">
                        <div className="text-lg font-black text-amber-600">
                          {searchedUser.stats.cornellNotes} Catatan
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Cornell Notes</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Friend List Cards */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Users size={16} className="text-indigo-600" />
                    Daftar Teman Saya ({friendsList.length})
                  </h3>
                  <p className="text-xs text-slate-500">Teman yang sudah terhubung dalam workspace Anda.</p>
                </div>
                <button
                  onClick={loadFriends}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                  title="Segarkan daftar"
                >
                  <RefreshCw size={14} className={loadingFriends ? 'animate-spin' : ''} />
                </button>
              </div>

              {friendsList.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <Users size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Belum memiliki teman</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Cari username teman pada kolom di atas dan klik Tambah Teman.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {friendsList.map((friend) => (
                    <div
                      key={friend.friend_id}
                      className="border border-slate-200/90 hover:border-indigo-300 rounded-xl p-4 flex items-center justify-between gap-3 transition-all hover:shadow-md bg-white"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                            {friend.avatar ? (
                              <img src={friend.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User size={20} className="text-slate-400" />
                            )}
                          </div>
                          {Number(friend.unread_count) > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                              {friend.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-slate-900 truncate">{friend.label}</h4>
                            {Number(friend.unread_count) > 0 && (
                              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full shadow-sm animate-pulse">
                                {friend.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium truncate">@{friend.username}</p>
                          {friend.favorite_subject && (
                            <span className="inline-block mt-0.5 text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-semibold truncate">
                              {friend.favorite_subject}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => openChatWith(friend)}
                          className={`p-2 rounded-lg transition relative ${
                            Number(friend.unread_count) > 0 
                              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm animate-pulse' 
                              : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white'
                          }`}
                          title={Number(friend.unread_count) > 0 ? `${friend.unread_count} pesan baru belum dibaca` : 'Kirim pesan'}
                        >
                          <MessageCircle size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setSearchUsername(friend.username);
                            handleSearchUser({ preventDefault: () => {} } as any);
                          }}
                          className="p-2 bg-slate-50 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                          title="Lihat detail statistik"
                        >
                          <TrendingUp size={15} />
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend.friend_id)}
                          className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                          title="Hapus pertemanan"
                        >
                          <UserMinus size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DIRECT CHAT WITH FRIEND */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Friends Sidebar for Chat */}
            <div className="w-full md:w-72 border-r border-slate-200/80 bg-slate-50/50 flex flex-col">
              <div className="p-4 border-b border-slate-200/80">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <MessageCircle size={15} className="text-indigo-600" />
                  Obrolan Teman
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Pilih teman untuk mulai percakapan</p>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {friendsList.map((f) => {
                  const isCurrent = activeChatFriend && (activeChatFriend.friend_id === f.friend_id || activeChatFriend.id === f.friend_id);
                  return (
                    <button
                      key={f.friend_id}
                      onClick={() => {
                        setActiveChatFriend(f);
                        setFriendsList((prev) => prev.map((item) => item.friend_id === f.friend_id ? { ...item, unread_count: 0 } : item));
                      }}
                      className={`w-full p-3.5 flex items-center gap-3 text-left transition ${
                        isCurrent ? 'bg-indigo-50/80 text-indigo-900 border-l-4 border-indigo-600' : 'hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                          {f.avatar ? (
                            <img src={f.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} className="text-slate-400" />
                          )}
                        </div>
                        {Number(f.unread_count) > 0 && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="font-bold text-xs truncate">{f.label}</div>
                          {Number(f.unread_count) > 0 && (
                            <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-sm animate-pulse flex-shrink-0 min-w-[18px] text-center">
                              {f.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">@{f.username}</div>
                      </div>
                    </button>
                  );
                })}

                {friendsList.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Belum ada teman. Tambahkan teman di tab "Teman & Cari" untuk mulai obrolan.
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages Panel */}
            <div className="flex-1 flex flex-col bg-white">
              {activeChatFriend ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {activeChatFriend.avatar ? (
                          <img src={activeChatFriend.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={16} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{activeChatFriend.label}</h4>
                        <p className="text-[10px] text-slate-400">@{activeChatFriend.username}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveChatFriend(null)}
                      className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 md:hidden"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 min-h-[320px] max-h-[420px]">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                        <MessageCircle size={28} className="text-slate-300 mb-2" />
                        <p className="text-xs font-semibold text-slate-600">Belum ada percakapan</p>
                        <p className="text-[11px] text-slate-400">Sapa teman Anda untuk mulai berdiskusi pelajaran!</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => {
                        const isMe = msg.sender_id === 'me' || (activeChatFriend && msg.sender_id !== activeChatFriend.friend_id && msg.sender_id !== activeChatFriend.id);
                        return (
                          <div
                            key={msg.id || i}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                                isMe
                                  ? 'bg-indigo-600 text-white rounded-br-none'
                                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                              <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={`Kirim pesan ke ${activeChatFriend.label}...`}
                      className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || sendingMsg}
                      className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-40"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <MessageCircle size={36} className="text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Pilih Teman</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pilih salah satu teman dari panel kiri untuk membuka obrolan.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </PageWrapper>
  );
}
