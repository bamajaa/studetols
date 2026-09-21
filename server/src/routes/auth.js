const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../database");
const { JWT_SECRET } = require("../middleware/auth");

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
      res.json({ token, role: user.role, label: user.label || user.username });
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

module.exports = router;
