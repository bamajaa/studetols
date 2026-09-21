const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../database");
const { authenticateToken, isAdmin, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// Kasir login by access_key
router.post("/kasir/login", (req, res) => {
  const { access_key } = req.body;
  db.query(
    "SELECT * FROM users WHERE access_key = ? OR username = ? OR password = ?",
    [access_key, access_key, access_key],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
      const user = results[0];
      if (!user) return res.status(401).json({ error: "Access Key atau Password salah!" });
      if (user.status !== "aktif") return res.status(403).json({ error: "Akun kasir ini nonaktif!" });
      const token = jwt.sign(
        { id: user.id, role: user.role, label: user.label || user.username },
        JWT_SECRET,
        { expiresIn: "12h" }
      );
      res.json({ success: true, token, role: user.role, label: user.label || user.username });
    }
  );
});

router.put("/kasir/store-name", authenticateToken, (req, res) => {
  const { new_label } = req.body;
  if (!new_label || new_label.trim() === "")
    return res.status(400).json({ error: "Nama toko tidak boleh kosong!" });
  db.query("UPDATE users SET label = ? WHERE id = ?", [new_label, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: "Gagal update nama toko" });
    res.json({ success: true, new_label });
  });
});

// Reports
router.post("/reports", authenticateToken, (req, res) => {
  const { date } = req.body;
  db.query(
    "SELECT * FROM daily_reports WHERE user_id = ? AND date = ?",
    [req.user.id, date],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
      if (results[0]) return res.json(results[0]);
      db.query(
        "INSERT INTO daily_reports (user_id, date) VALUES (?, ?)",
        [req.user.id, date],
        (err2, result) => {
          if (err2) return res.status(500).json({ error: "Gagal membuat laporan" });
          res.json({ id: result.insertId, modal_makanan: 0, modal_minuman: 0, date });
        }
      );
    }
  );
});

router.put("/reports/:id/modal", authenticateToken, (req, res) => {
  const { modal_makanan, modal_minuman } = req.body;
  db.query(
    "UPDATE daily_reports SET modal_makanan = ?, modal_minuman = ? WHERE id = ? AND user_id = ?",
    [modal_makanan, modal_minuman, req.params.id, req.user.id],
    () => res.json({ success: true })
  );
});

router.get("/arsip", authenticateToken, (req, res) => {
  db.query(
    `SELECT r.*, COALESCE(SUM(s.total), 0) as omzet_total
     FROM daily_reports r LEFT JOIN sales s ON r.id = s.report_id
     WHERE r.user_id = ? GROUP BY r.id ORDER BY r.date DESC`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil arsip" });
      res.json(results);
    }
  );
});

// Sales
router.get("/sales/report/:report_id", authenticateToken, (req, res) => {
  db.query(
    `SELECT s.* FROM sales s JOIN daily_reports r ON s.report_id = r.id
     WHERE s.report_id = ? AND r.user_id = ?`,
    [req.params.report_id, req.user.id],
    (err, results) => res.json(results || [])
  );
});

router.post("/sales", authenticateToken, (req, res) => {
  const { report_id, product_name, category, qty, price } = req.body;
  const total = qty * price;
  db.query(
    "SELECT id FROM daily_reports WHERE id = ? AND user_id = ?",
    [report_id, req.user.id],
    (err, results) => {
      if (!results || !results[0]) return res.status(403).json({ error: "Unauthorized" });
      db.query(
        "INSERT INTO sales (report_id, product_name, category, qty, price, total) VALUES (?, ?, ?, ?, ?, ?)",
        [report_id, product_name, category, qty, price, total],
        (err2, result) => {
          if (err2) return res.status(500).json({ error: "Gagal menyimpan penjualan" });
          res.json({ id: result.insertId, report_id, product_name, category, qty, price, total });
        }
      );
    }
  );
});

router.delete("/sales/:id", authenticateToken, (req, res) => {
  db.query("DELETE FROM sales WHERE id = ?", [req.params.id], () => res.json({ success: true }));
});

// Admin users
router.get("/admin/users", authenticateToken, isAdmin, (req, res) => {
  db.query(
    "SELECT id, username, access_key, label, status, created_at FROM users WHERE role = 'user'",
    (err, results) => res.json(results || [])
  );
});

router.post("/admin/users", authenticateToken, isAdmin, (req, res) => {
  const accessKey = req.body.key || req.body.access_key;
  const label = req.body.label;
  if (!accessKey || !label) return res.status(400).json({ error: "Key dan Label wajib diisi" });
  db.query(
    "INSERT INTO users (access_key, role, label, status) VALUES (?, 'user', ?, 'aktif')",
    [accessKey, label],
    (err, result) => {
      if (err) return res.status(400).json({ error: "Key sudah ada" });
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.put("/admin/users/:id/status", authenticateToken, isAdmin, (req, res) => {
  db.query("UPDATE users SET status = ? WHERE id = ?", [req.body.status, req.params.id], () =>
    res.json({ success: true })
  );
});

router.delete("/admin/users/:id", authenticateToken, isAdmin, (req, res) => {
  if (req.params.id == req.user.id)
    return res.status(403).json({ error: "Admin tidak bisa menghapus akunnya sendiri" });
  db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Gagal menghapus user" });
    res.json({ success: true });
  });
});

router.get("/kasir/users", authenticateToken, isAdmin, (req, res) => {
  db.query(
    "SELECT id, username, access_key, label, status, created_at FROM users",
    (err, results) => res.json(results || [])
  );
});

router.post("/kasir/users", (req, res) => {
  const accessKey = req.body.key || req.body.access_key;
  const label = req.body.label;
  if (!accessKey || !label) return res.status(400).json({ error: "Access key dan label wajib diisi!" });
  db.query(
    "INSERT INTO users (username, password, access_key, role, label, status) VALUES (?, ?, ?, 'user', ?, 'aktif')",
    [label, accessKey, accessKey, label],
    (err, result) => {
      if (err) return res.status(400).json({ error: "Gagal menyimpan" });
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.get("/cek-users", (req, res) => {
  db.query("SELECT id, username, access_key, role, label FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
