const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../database");
const { JWT_SECRET, authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
      const user = results[0];
      if (!user) return res.status(401).json({ error: "Username atau password salah!" });
      if (user.status !== "aktif") return res.status(403).json({ error: "Akun ini sedang nonaktif!" });
      const token = jwt.sign(
        { id: user.id, role: user.role, label: user.label || user.username },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({ 
        token, 
        role: user.role, 
        label: user.label || user.username,
        avatar: user.avatar || "",
        bio: user.bio || "",
        favorite_subject: user.favorite_subject || ""
      });
    }
  );
});

router.post("/register", (req, res) => {
  const { username, password, label } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username dan password wajib diisi!" });
  const userLabel = label || username;
  const accessKey = "KEY_" + Math.random().toString(36).substring(2, 8).toUpperCase();
  db.query(
    "INSERT INTO users (username, password, access_key, role, label) VALUES (?, ?, ?, 'user', ?)",
    [username, password, accessKey, userLabel],
    (err, result) => {
      if (err) return res.status(400).json({ error: "Username sudah digunakan!" });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// GET current user profile
router.get("/me", authenticateToken, (req, res) => {
  db.query(
    "SELECT id, username, role, label, avatar, bio, favorite_subject, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
      if (!results[0]) return res.status(404).json({ error: "Pengguna tidak ditemukan" });
      res.json(results[0]);
    }
  );
});

// UPDATE user profile (username, label, bio, avatar, favorite_subject)
router.put("/profile", authenticateToken, (req, res) => {
  const { username, label, avatar, bio, favorite_subject } = req.body;
  const userId = req.user.id;

  if (!username) {
    return res.status(400).json({ error: "Username tidak boleh kosong!" });
  }

  // Check if username is taken by another user
  db.query(
    "SELECT id FROM users WHERE username = ? AND id != ?",
    [username, userId],
    (err, exists) => {
      if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
      if (exists.length > 0) {
        return res.status(400).json({ error: "Username sudah digunakan oleh akun lain!" });
      }

      db.query(
        "UPDATE users SET username = ?, label = ?, avatar = ?, bio = ?, favorite_subject = ? WHERE id = ?",
        [username, label || username, avatar || "", bio || "", favorite_subject || "", userId],
        (updateErr) => {
          if (updateErr) {
            console.error("Update profile error:", updateErr);
            return res.status(500).json({ error: "Gagal memperbarui profil" });
          }

          // Return fresh token with updated label
          const token = jwt.sign(
            { id: userId, role: req.user.role, label: label || username },
            JWT_SECRET,
            { expiresIn: "24h" }
          );

          res.json({
            success: true,
            token,
            user: {
              id: userId,
              username,
              label: label || username,
              avatar: avatar || "",
              bio: bio || "",
              favorite_subject: favorite_subject || ""
            }
          });
        }
      );
    }
  );
});

module.exports = router;
