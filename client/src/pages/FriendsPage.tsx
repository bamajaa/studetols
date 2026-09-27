import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  MessageCircle, 
  UserPlus, 
  UserMinus, 
  Check, 
  X, 
  RefreshCw, 
  Clock, 
  TrendingUp, 
  User, 
  Send, 
  AlertCircle, 
  UserCheck, 
  Inbox, 
  Sparkles,
  Award,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function FriendsPage() {
  const { token, label } = useAuth();
  const currentUserPayload = parseJwt(token);
  const currentUserId = currentUserPayload?.id;

  // Navigation Subtabs: 'friends' | 'requests' | 'search' | 'chat'
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search' | 'chat'>('friends');

  // Search User States
  const [searchUsername, setSearchUsername] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [searchError, setSearchError] = useState('');

  // Friends & Requests States
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat States
  const [activeChatFriend, setActiveChatFriend] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [activeMenuMsgId, setActiveMenuMsgId] = useState<number | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);

  // Fetch Friends & Requests
  const loadData = async () => {
    try {
      const [listRes, reqRes] = await Promise.all([
        fetch('/api/friends/list', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/friends/requests', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (listRes.ok) {
        const listData = await listRes.json();
        setFriendsList(listData);
      }
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setIncomingRequests(reqData.incoming || []);
        setOutgoingRequests(reqData.outgoing || []);
      }
    } catch (err) {
      console.error('Error fetching friends data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Poll Friends & Requests periodically for incoming requests & unread badges
  useEffect(() => {
    if (token) {
      loadData();
      const interval = setInterval(loadData, 4000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const totalUnreadMessages = friendsList.reduce((acc, f) => acc + (Number(f.unread_count) || 0), 0);

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

  // Send Friend Request
  const handleSendRequest = async (targetUsername: string) => {
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
        alert(data.error || 'Gagal mengirim permintaan pertemanan');
      } else {
        alert(data.message);
        loadData();
        if (searchedUser) {
          setSearchedUser({ ...searchedUser, friendshipStatus: 'pending_sent' });
        }
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  // Accept Friend Request
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const res = await fetch(`/api/friends/accept/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        loadData();
        if (searchedUser) {
          setSearchedUser({ ...searchedUser, friendshipStatus: 'accepted', isFriend: true });
        }
      } else {
        alert(data.error || 'Gagal menerima pertemanan');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  // Reject / Cancel Request or Remove Friend
  const handleRemoveOrReject = async (id: number, promptMsg: string) => {
    if (!confirm(promptMsg)) return;
    try {
      const res = await fetch(`/api/friends/remove/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        loadData();
        if (searchedUser) {
          setSearchedUser({ ...searchedUser, friendshipStatus: 'none', isFriend: false });
        }
        if (activeChatFriend && (activeChatFriend.friend_id === id || activeChatFriend.id === id)) {
          setActiveChatFriend(null);
        }
      }
    } catch (err) {
      alert('Gagal memproses aksi');
    }
  };

  // Chat Polling - Only when looking at chat tab with active friend
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
          setChatMessages((prev) => {
            if (prev.length === data.length && prev[prev.length - 1]?.id === data[data.length - 1]?.id) {
              return prev;
            }
            return data;
          });
          // Clear unread count locally for this friend
          setFriendsList((prev) => prev.map((f) => (f.friend_id === friendId || f.id === friendId) ? { ...f, unread_count: 0 } : f));
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeChatFriend, activeTab, token]);

  const scrollToBottom = (smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Scroll messages container on initial load or if user is near bottom
  useEffect(() => {
    if (activeTab !== 'chat' || !activeChatFriend) return;
    const container = chatContainerRef.current;
    if (!container) return;

    const isNewMessage = chatMessages.length > prevMsgCountRef.current;
    const isInitial = prevMsgCountRef.current === 0 && chatMessages.length > 0;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (isInitial || (isNewMessage && isNearBottom)) {
      scrollToBottom(!isInitial);
    }
    prevMsgCountRef.current = chatMessages.length;
  }, [chatMessages, activeTab, activeChatFriend]);

  // When switching active chat friend, reset counter and scroll container
  useEffect(() => {
    prevMsgCountRef.current = 0;
    setTimeout(() => scrollToBottom(false), 50);
  }, [activeChatFriend]);

  // Send Chat Message
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
        const sendData = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            id: sendData.messageId || Date.now(),
            sender_id: currentUserId || 'me',
            receiver_id: friendId,
            message: msgText,
            created_at: new Date().toISOString()
          }
        ]);
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch (err) {
      alert('Gagal mengirim pesan');
    } finally {
      setSendingMsg(false);
    }
  };

  // Clear all messages in current conversation for current user
  const handleClearChat = async () => {
    if (!activeChatFriend) return;
    const friendId = activeChatFriend.friend_id || activeChatFriend.id;
    const friendName = activeChatFriend.label || activeChatFriend.username;
    const confirmClear = window.confirm(
      `Apakah Anda yakin ingin membersihkan semua pesan dengan ${friendName}? Semua riwayat pesan obrolan ini akan dihapus dari akun Anda.`
    );
    if (!confirmClear) return;

    try {
      const res = await fetch(`/api/friends/messages/clear/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages([]);
      } else {
        alert(data.error || 'Gagal membersihkan obrolan');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  // Delete single message ('me' or 'everyone')
  const handleDeleteMessage = async (messageId: number, mode: 'me' | 'everyone') => {
    setActiveMenuMsgId(null);
    if (mode === 'everyone') {
      const ok = window.confirm('Hapus pesan ini untuk semua orang? Pesan ini tidak akan dapat dibaca lagi oleh kedua belah pihak.');
      if (!ok) return;
    }

    try {
      const res = await fetch(`/api/friends/messages/item/${messageId}?mode=${mode}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        alert(data.error || 'Gagal menghapus pesan');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
              <Users size={14} />
              <span>Komunitas & Pertemanan Siswa</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Teman & Jaringan Belajar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cari teman berdasarkan username, kelola persetujuan pertemanan, dan diskusikan pelajaran secara langsung.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'friends'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck size={14} />
              <span>Teman Saya</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">
                {friendsList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'requests'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Inbox size={14} />
              <span>Permintaan</span>
              {incomingRequests.length > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'search'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search size={14} />
              <span>Cari User</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageCircle size={14} />
              <span>Obrolan</span>
              {totalUnreadMessages > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-black animate-pulse shadow-sm">
                  {totalUnreadMessages}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: ACCEPTED FRIENDS LIST */}
        {activeTab === 'friends' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <UserCheck size={18} className="text-purple-600" />
                  Daftar Teman Terhubung ({friendsList.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Teman yang sudah saling menyetujui permintaan pertemanan.</p>
              </div>
              <button
                onClick={loadData}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
                title="Segarkan data"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-600" />
                <span className="text-xs">Memuat daftar teman...</span>
              </div>
            ) : friendsList.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Users size={36} className="mx-auto text-slate-300 mb-2" />
                <h4 className="font-bold text-sm text-slate-700">Belum Ada Teman Terhubung</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                  Kirim permintaan pertemanan ke teman sekelas atau kelompok belajarmu melalui tab "Cari User".
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Cari Teman Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendsList.map((friend) => (
                  <div
                    key={friend.friend_id}
                    className="border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all hover:shadow-md bg-white group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User size={22} className="text-slate-400" />
                          )}
                        </div>
                        {Number(friend.unread_count) > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                            {friend.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{friend.label}</h4>
                          {Number(friend.unread_count) > 0 && (
                            <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-extrabold rounded-full animate-pulse">
                              {friend.unread_count} pesan baru
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate">@{friend.username}</p>
                        {friend.favorite_subject && (
                          <span className="inline-block mt-1 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold truncate">
                            {friend.favorite_subject}
                          </span>
                        )}
                      </div>
                    </div>

                    {friend.bio && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                        "{friend.bio}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setActiveChatFriend(friend);
                          setFriendsList((prev) => prev.map((f) => (f.friend_id === friend.friend_id) ? { ...f, unread_count: 0 } : f));
                          setActiveTab('chat');
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          Number(friend.unread_count) > 0
                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                            : 'bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white'
                        }`}
                      >
                        <MessageCircle size={14} />
                        <span>Chat</span>
                        {Number(friend.unread_count) > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 bg-white text-rose-600 text-[10px] font-black rounded-full">
                            {friend.unread_count}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSearchUsername(friend.username);
                          setActiveTab('search');
                          handleSearchUser({ preventDefault: () => {} } as any);
                        }}
                        className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition"
                        title="Lihat detail statistik"
                      >
                        <TrendingUp size={14} />
                      </button>

                      <button
                        onClick={() => handleRemoveOrReject(friend.friend_id, `Hapus @${friend.username} dari daftar teman?`)}
                        className="py-1.5 px-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl text-xs font-semibold transition"
                        title="Hapus teman"
                      >
                        <UserMinus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FRIEND REQUESTS (PERSETUJUAN PERTEMANAN) */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Incoming Requests */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Inbox size={18} className="text-indigo-600" />
                    Permintaan Pertemanan Masuk ({incomingRequests.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Pengguna yang mengajak Anda untuk saling berteman.</p>
                </div>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  Tidak ada permintaan pertemanan baru yang menunggu persetujuan.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.request_id}
                      className="border border-indigo-100 bg-indigo-50/20 rounded-2xl p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-indigo-500 shadow-sm flex items-center justify-center">
                          {req.avatar ? (
                            <img src={req.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User size={22} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{req.label}</h4>
                          <p className="text-[11px] text-slate-400 font-medium truncate">@{req.username}</p>
                          {req.favorite_subject && (
                            <span className="text-[10px] text-indigo-700 font-semibold block truncate">
                              Mapel Favorit: {req.favorite_subject}
                            </span>
                          )}
                        </div>
                      </div>

                      {req.bio && (
                        <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                          "{req.bio}"
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-indigo-100">
                        <button
                          onClick={() => handleAcceptRequest(req.request_id)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Check size={14} />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => handleRemoveOrReject(req.request_id, 'Tolak permintaan pertemanan ini?')}
                          className="flex-1 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <X size={14} />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                Permintaan Terkirim ({outgoingRequests.length})
              </h3>
              <p className="text-xs text-slate-500 mb-4">Menunggu persetujuan dari pengguna terkait.</p>

              {outgoingRequests.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  Tidak ada permintaan terkirim yang sedang tertunda.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {outgoingRequests.map((outReq) => (
                    <div
                      key={outReq.request_id}
                      className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 bg-slate-50/50"
                    >
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 truncate">{outReq.label}</h4>
                        <p className="text-[10px] text-slate-400 truncate">@{outReq.username}</p>
                        <span className="text-[10px] text-amber-600 font-semibold">Menunggu persetujuan...</span>
                      </div>
                      <button
                        onClick={() => handleRemoveOrReject(outReq.request_id, 'Batalkan permintaan pertemanan ini?')}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Batalkan permintaan"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SEARCH USER & VIEW STATS */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                <Search size={16} className="text-indigo-600" />
                Cari Teman & Cek Statistik Belajar
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Ketik username teman untuk melihat profil, statistik pembelajaran, dan mengajukan pertemanan.
              </p>

              <form onSubmit={handleSearchUser} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    placeholder="Ketik username (misal: admin, ihsan...)"
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

              {/* Searched User Display Card with Stats */}
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

                    {/* Friendship Action Button with Approval Status */}
                    <div className="flex items-center gap-2">
                      {!searchedUser.isSelf && (
                        <>
                          {searchedUser.friendshipStatus === 'accepted' ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                                <Check size={14} /> Teman Terhubung
                              </span>
                              <button
                                onClick={() => {
                                  setActiveChatFriend(searchedUser.user);
                                  setActiveTab('chat');
                                }}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <MessageCircle size={14} /> Chat
                              </button>
                            </div>
                          ) : searchedUser.friendshipStatus === 'pending_sent' ? (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                              <Clock size={14} /> Permintaan Dikirim
                            </span>
                          ) : searchedUser.friendshipStatus === 'pending_received' ? (
                            <button
                              onClick={() => setActiveTab('requests')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <Inbox size={14} /> Respon Permintaan
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(searchedUser.user.username)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                            >
                              <UserPlus size={14} />
                              <span>Kirim Permintaan Teman</span>
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

                  {/* Profile Statistics Grid */}
                  <div className="mt-5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                      Statistik Belajar & Produktivitas:
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
                        <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Flashcard 3D</div>
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
          </div>
        )}

        {/* TAB 4: DIRECT CHAT WITH FRIEND */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Friends Sidebar */}
            <div className="w-full md:w-72 border-r border-slate-200/80 bg-slate-50/50 flex flex-col">
              <div className="p-4 border-b border-slate-200/80">
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <MessageCircle size={15} className="text-indigo-600" />
                  Daftar Obrolan
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Pilih teman terhubung untuk mulai chatting</p>
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
                    Belum ada teman terhubung. Setujui permintaan pertemanan terlebih dahulu untuk memulai obrolan.
                  </div>
                )}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col bg-white relative">
              {activeChatFriend ? (
                <>
                  <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white z-10">
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

                    {/* Chat Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClearChat}
                        title="Bersihkan Semua Pesan dalam Obrolan"
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100/80 text-rose-600 rounded-xl text-xs font-semibold border border-rose-200/70 transition flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Bersihkan Obrolan</span>
                      </button>
                    </div>
                  </div>

                  {/* Backdrop overlay to close popup menu when clicking outside */}
                  {activeMenuMsgId && (
                    <div
                      className="fixed inset-0 z-20 cursor-default"
                      onClick={() => setActiveMenuMsgId(null)}
                    />
                  )}

                  <div 
                    ref={chatContainerRef}
                    className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 min-h-[320px] max-h-[420px]"
                  >
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                        <MessageCircle size={28} className="text-slate-300 mb-2" />
                        <p className="text-xs font-semibold text-slate-600">Belum ada obrolan</p>
                        <p className="text-[11px] text-slate-400">Kirim pesan pertama Anda!</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => {
                        const isMe = msg.sender_id === 'me' || 
                          (currentUserId && msg.sender_id === currentUserId) || 
                          (!currentUserId && activeChatFriend && msg.sender_id !== activeChatFriend.friend_id && msg.sender_id !== activeChatFriend.id);
                        
                        const isMenuOpen = activeMenuMsgId === msg.id;

                        return (
                          <div
                            key={msg.id || i}
                            className={`flex items-end gap-1.5 group relative ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            {/* Action menu button for My message (left side of bubble) */}
                            {isMe && (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuMsgId(isMenuOpen ? null : msg.id)}
                                  className={`p-1 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition ${isMenuOpen ? 'opacity-100 bg-slate-200/70 text-slate-700' : 'opacity-0 group-hover:opacity-100'}`}
                                  title="Opsi Pesan"
                                >
                                  <MoreHorizontal size={14} />
                                </button>

                                {isMenuOpen && (
                                  <div className="absolute z-30 bottom-full right-0 mb-1 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 min-w-[170px] text-xs animate-in fade-in zoom-in-95">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMessage(msg.id, 'me')}
                                      className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                                    >
                                      <Trash2 size={13} className="text-slate-400" />
                                      <span>Hapus untuk Saya</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMessage(msg.id, 'everyone')}
                                      className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition border-t border-slate-100"
                                    >
                                      <Trash2 size={13} className="text-rose-500" />
                                      <span className="font-semibold">Hapus untuk Semua</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Message Bubble */}
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

                            {/* Action menu button for Friend's message (right side of bubble) */}
                            {!isMe && (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuMsgId(isMenuOpen ? null : msg.id)}
                                  className={`p-1 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition ${isMenuOpen ? 'opacity-100 bg-slate-200/70 text-slate-700' : 'opacity-0 group-hover:opacity-100'}`}
                                  title="Opsi Pesan"
                                >
                                  <MoreHorizontal size={14} />
                                </button>

                                {isMenuOpen && (
                                  <div className="absolute z-30 bottom-full left-0 mb-1 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 min-w-[150px] text-xs animate-in fade-in zoom-in-95">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMessage(msg.id, 'me')}
                                      className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                                    >
                                      <Trash2 size={13} className="text-slate-400" />
                                      <span>Hapus untuk Saya</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={`Tulis pesan untuk ${activeChatFriend.label}...`}
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
