const express = require("express");
const db = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Helper to compute user stats
function getUserStats(userId, callback) {
  const stats = {
    studySessions: 0,
    totalStudyMinutes: 0,
    completedTasks: 0,
    totalTasks: 0,
    cornellNotes: 0,
    flashcardDecks: 0,
    flashcardCards: 0,
    gradesRecorded: 0,
    bookmarksCount: 0,
    financeTransactions: 0,
  };

  db.query(
    "SELECT COUNT(*) AS count, COALESCE(SUM(duration_minutes), 0) AS total_minutes FROM study_sessions WHERE user_id = ?",
    [userId],
    (err, studyRes) => {
      if (!err && studyRes[0]) {
        stats.studySessions = studyRes[0].count;
        stats.totalStudyMinutes = studyRes[0].total_minutes;
      }

      db.query(
        "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed FROM tasks WHERE user_id = ?",
        [userId],
        (err2, taskRes) => {
          if (!err2 && taskRes[0]) {
            stats.totalTasks = taskRes[0].total || 0;
            stats.completedTasks = taskRes[0].completed || 0;
          }

          db.query(
            "SELECT COUNT(*) AS count FROM cornell_notes WHERE user_id = ?",
            [userId],
            (err3, noteRes) => {
              if (!err3 && noteRes[0]) {
                stats.cornellNotes = noteRes[0].count;
              }

              db.query(
                "SELECT COUNT(*) AS count FROM flashcard_decks WHERE user_id = ?",
                [userId],
                (err4, deckRes) => {
                  if (!err4 && deckRes[0]) {
                    stats.flashcardDecks = deckRes[0].count;
                  }

                  db.query(
                    "SELECT COUNT(*) AS count FROM grade_subjects WHERE user_id = ?",
                    [userId],
                    (err5, gradeRes) => {
                      if (!err5 && gradeRes[0]) {
                        stats.gradesRecorded = gradeRes[0].count;
                      }

                      db.query(
                        "SELECT COUNT(*) AS count FROM bookmarks WHERE user_id = ?",
                        [userId],
                        (err6, bmRes) => {
                          if (!err6 && bmRes[0]) {
                            stats.bookmarksCount = bmRes[0].count;
                          }

                          db.query(
                            "SELECT COUNT(*) AS count FROM finance_records WHERE user_id = ?",
                            [userId],
                            (err7, finRes) => {
                              if (!err7 && finRes[0]) {
                                stats.financeTransactions = finRes[0].count;
                              }
                              callback(null, stats);
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}

// 1. GET User by username + their stats
router.get("/user/:username", authenticateToken, (req, res) => {
  const targetUsername = req.params.username;
  const currentUserId = req.user.id;

  db.query(
    "SELECT id, username, role, label, avatar, bio, favorite_subject, created_at FROM users WHERE username = ?",
    [targetUsername],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
      const user = results[0];
      if (!user) return res.status(404).json({ error: "Pengguna dengan username tersebut tidak ditemukan!" });

      // Check friendship / request status
      db.query(
        "SELECT user_id, friend_id, status FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
        [currentUserId, user.id, user.id, currentUserId],
        (errFriend, friendRes) => {
          let friendshipStatus = 'none'; // 'none' | 'pending_sent' | 'pending_received' | 'accepted'
          if (friendRes && friendRes.length > 0) {
            const rel = friendRes[0];
            if (rel.status === 'accepted') {
              friendshipStatus = 'accepted';
            } else if (rel.status === 'pending') {
              friendshipStatus = rel.user_id === currentUserId ? 'pending_sent' : 'pending_received';
            }
          }

          getUserStats(user.id, (statsErr, stats) => {
            res.json({
              user: {
                id: user.id,
                username: user.username,
                label: user.label || user.username,
                avatar: user.avatar || "",
                bio: user.bio || "",
                favorite_subject: user.favorite_subject || "",
                role: user.role,
                created_at: user.created_at,
              },
              stats: stats || {},
              friendshipStatus,
              isFriend: friendshipStatus === 'accepted',
              isSelf: currentUserId === user.id
            });
          });
        }
      );
    }
  );
});

// 2. GET My detailed statistics
router.get("/my-stats", authenticateToken, (req, res) => {
  const userId = req.user.id;

  getUserStats(userId, (err, stats) => {
    if (err) return res.status(500).json({ error: "Gagal mengambil statistik" });

    // Additional detailed stats (e.g. study sessions per subject)
    db.query(
      "SELECT subject_name, SUM(duration_minutes) AS total_minutes, COUNT(*) AS sessions_count FROM study_sessions WHERE user_id = ? GROUP BY subject_name ORDER BY total_minutes DESC LIMIT 5",
      [userId],
      (err2, topSubjects) => {
        // Task status summary
        const taskCompletionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
        
        res.json({
          stats: {
            ...stats,
            taskCompletionRate,
            topSubjects: topSubjects || []
          }
        });
      }
    );
  });
});

// 3. GET Accepted Friends List (with unread messages count)
router.get("/list", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT 
      f.id AS friendship_id,
      u.id AS friend_id,
      u.username,
      u.label,
      u.avatar,
      u.bio,
      u.favorite_subject,
      f.created_at AS befriended_at,
      (
        SELECT COUNT(*)
        FROM direct_messages dm
        WHERE dm.sender_id = u.id 
          AND dm.receiver_id = ?
          AND dm.is_read = 0
          AND (dm.deleted_for_everyone IS NULL OR dm.deleted_for_everyone = 0)
          AND NOT (dm.receiver_id = ? AND dm.deleted_by_receiver = 1)
      ) AS unread_count
    FROM friends f
    JOIN users u ON (f.friend_id = u.id AND f.user_id = ?) OR (f.user_id = u.id AND f.friend_id = ?)
    WHERE u.id != ? AND f.status = 'accepted'
    GROUP BY u.id
    ORDER BY unread_count DESC, f.created_at DESC
  `;

  db.query(sql, [userId, userId, userId, userId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching friends:", err);
      return res.status(500).json({ error: "Gagal memuat daftar teman" });
    }
    res.json(results);
  });
});

// 3.1. GET Total Unread Messages Count
router.get("/unread-count", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT COUNT(*) AS total_unread
    FROM direct_messages dm
    WHERE dm.receiver_id = ?
      AND dm.is_read = 0
      AND (dm.deleted_for_everyone IS NULL OR dm.deleted_for_everyone = 0)
      AND NOT (dm.receiver_id = ? AND dm.deleted_by_receiver = 1)
  `;

  db.query(sql, [userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Gagal menghitung pesan belum dibaca" });
    res.json({ totalUnread: results[0] ? results[0].total_unread : 0 });
  });
});

// 4. GET Incoming & Outgoing Friend Requests
router.get("/requests", authenticateToken, (req, res) => {
  const userId = req.user.id;

  // Incoming requests (people who sent request to current user)
  const incomingSql = `
    SELECT 
      f.id AS request_id,
      u.id AS sender_id,
      u.username,
      u.label,
      u.avatar,
      u.bio,
      u.favorite_subject,
      f.created_at
    FROM friends f
    JOIN users u ON f.user_id = u.id
    WHERE f.friend_id = ? AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `;

  // Outgoing requests (requests current user sent to others)
  const outgoingSql = `
    SELECT 
      f.id AS request_id,
      u.id AS receiver_id,
      u.username,
      u.label,
      u.avatar,
      f.created_at
    FROM friends f
    JOIN users u ON f.friend_id = u.id
    WHERE f.user_id = ? AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `;

  db.query(incomingSql, [userId], (errInc, incoming) => {
    if (errInc) return res.status(500).json({ error: "Gagal memuat permintaan teman" });

    db.query(outgoingSql, [userId], (errOut, outgoing) => {
      if (errOut) return res.status(500).json({ error: "Gagal memuat permintaan teman" });

      res.json({
        incoming: incoming || [],
        outgoing: outgoing || []
      });
    });
  });
});

// 5. SEND Friend Request (Status = 'pending')
router.post("/add", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { username } = req.body;

  if (!username) return res.status(400).json({ error: "Username wajib diisi!" });

  db.query("SELECT id, username FROM users WHERE username = ?", [username], (err, results) => {
    if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
    const friend = results[0];
    if (!friend) return res.status(404).json({ error: "Pengguna tidak ditemukan!" });
    if (friend.id === userId) return res.status(400).json({ error: "Anda tidak bisa berteman dengan diri sendiri!" });

    // Check if relation already exists
    db.query(
      "SELECT id, user_id, friend_id, status FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
      [userId, friend.id, friend.id, userId],
      (errExist, exist) => {
        if (exist && exist.length > 0) {
          const rel = exist[0];
          if (rel.status === 'accepted') {
            return res.status(400).json({ error: "Anda sudah berteman dengan pengguna ini!" });
          }
          if (rel.status === 'pending') {
            return res.status(400).json({ error: "Permintaan pertemanan sudah terkirim atau menunggu respon Anda!" });
          }
        }

        db.query(
          "INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')",
          [userId, friend.id],
          (insertErr) => {
            if (insertErr) return res.status(500).json({ error: "Gagal mengirim permintaan pertemanan" });
            res.json({ success: true, message: `Permintaan pertemanan berhasil dikirim ke @${friend.username}!` });
          }
        );
      }
    );
  });
});

// 6. ACCEPT Friend Request
router.post("/accept/:requestId", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const requestId = req.params.requestId;

  db.query(
    "UPDATE friends SET status = 'accepted' WHERE id = ? AND friend_id = ? AND status = 'pending'",
    [requestId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal menerima pertemanan" });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Permintaan pertemanan tidak valid" });
      res.json({ success: true, message: "Permintaan pertemanan diterima!" });
    }
  );
});

// 7. REJECT / CANCEL Friend Request or REMOVE Friend
router.delete("/remove/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const targetId = req.params.id; // can be friend_id or friendship id

  db.query(
    "DELETE FROM friends WHERE id = ? OR ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))",
    [targetId, userId, targetId, targetId, userId],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal memproses penghapusan" });
      res.json({ success: true, message: "Pertemanan / permintaan berhasil dibatalkan/dihapus" });
    }
  );
});

// 6. CHAT: GET conversation messages with a friend
router.get("/messages/:friendId", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const friendId = req.params.friendId;

  const sql = `
    SELECT 
      m.id,
      m.sender_id,
      m.receiver_id,
      m.message,
      m.is_read,
      m.created_at,
      u.username AS sender_username,
      u.label AS sender_label,
      u.avatar AS sender_avatar
    FROM direct_messages m
    JOIN users u ON m.sender_id = u.id
    WHERE ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
      AND (m.deleted_for_everyone IS NULL OR m.deleted_for_everyone = 0)
      AND NOT (m.sender_id = ? AND m.deleted_by_sender = 1)
      AND NOT (m.receiver_id = ? AND m.deleted_by_receiver = 1)
    ORDER BY m.created_at ASC
  `;

  db.query(sql, [userId, friendId, friendId, userId, userId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({ error: "Gagal memuat pesan" });
    }

    // Mark unread messages as read
    db.query(
      "UPDATE direct_messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?",
      [friendId, userId],
      () => {}
    );

    res.json(results);
  });
});

// 7. CHAT: SEND message to a friend
router.post("/messages", authenticateToken, (req, res) => {
  const senderId = req.user.id;
  const { receiver_id, message } = req.body;

  if (!receiver_id || !message || !message.trim()) {
    return res.status(400).json({ error: "Pesan tidak boleh kosong!" });
  }

  db.query(
    "INSERT INTO direct_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
    [senderId, receiver_id, message.trim()],
    (err, result) => {
      if (err) {
        console.error("Error sending message:", err);
        return res.status(500).json({ error: "Gagal mengirim pesan" });
      }
      res.json({
        success: true,
        messageId: result.insertId,
        created_at: new Date()
      });
    }
  );
});

// 8. CHAT: DELETE single message ('me' or 'everyone')
router.delete("/messages/item/:messageId", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const messageId = req.params.messageId;
  const mode = req.query.mode || (req.body && req.body.mode) || 'me';

  db.query("SELECT * FROM direct_messages WHERE id = ?", [messageId], (err, results) => {
    if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
    const msg = results[0];
    if (!msg) return res.status(404).json({ error: "Pesan tidak ditemukan" });

    if (msg.sender_id !== userId && msg.receiver_id !== userId) {
      return res.status(403).json({ error: "Anda tidak memiliki akses ke pesan ini" });
    }

    if (mode === 'everyone') {
      if (msg.sender_id !== userId) {
        return res.status(403).json({ error: "Hanya pengirim yang dapat menghapus pesan untuk semua orang" });
      }
      db.query("UPDATE direct_messages SET deleted_for_everyone = 1 WHERE id = ?", [messageId], (delErr) => {
        if (delErr) return res.status(500).json({ error: "Gagal menghapus pesan" });
        return res.json({ success: true, message: "Pesan telah dihapus untuk semua orang" });
      });
    } else {
      // mode === 'me'
      let updateSql = "";
      if (msg.sender_id === userId) {
        updateSql = "UPDATE direct_messages SET deleted_by_sender = 1 WHERE id = ?";
      } else {
        updateSql = "UPDATE direct_messages SET deleted_by_receiver = 1 WHERE id = ?";
      }
      db.query(updateSql, [messageId], (delErr) => {
        if (delErr) return res.status(500).json({ error: "Gagal menghapus pesan" });
        return res.json({ success: true, message: "Pesan telah dihapus untuk Anda" });
      });
    }
  });
});

// 9. CHAT: CLEAR all messages with a friend for current user
router.delete("/messages/clear/:friendId", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const friendId = req.params.friendId;

  const sql = `
    UPDATE direct_messages 
    SET 
      deleted_by_sender = CASE WHEN sender_id = ? THEN 1 ELSE deleted_by_sender END,
      deleted_by_receiver = CASE WHEN receiver_id = ? THEN 1 ELSE deleted_by_receiver END
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
  `;

  db.query(sql, [userId, userId, userId, friendId, friendId, userId], (err) => {
    if (err) {
      console.error("Error clearing messages:", err);
      return res.status(500).json({ error: "Gagal membersihkan pesan" });
    }
    res.json({ success: true, message: "Seluruh pesan dalam obrolan ini berhasil dibersihkan" });
  });
});

module.exports = router;
