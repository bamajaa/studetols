const express = require("express");
const db = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  const { category } = req.query;
  let sql = "SELECT * FROM bookmarks WHERE user_id = ?";
  const params = [req.user.id];
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  sql += " ORDER BY created_at DESC";
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Gagal mengambil data" });
    res.json(results || []);
  });
});

router.post("/", authenticateToken, (req, res) => {
  const { title, url, category } = req.body;
  if (!title || !url || !category)
    return res.status(400).json({ error: "Judul, URL, dan kategori wajib diisi" });
  db.query(
    "INSERT INTO bookmarks (user_id, title, url, category) VALUES (?, ?, ?, ?)",
    [req.user.id, title, url, category],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal menyimpan bookmark" });
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.delete("/:id", authenticateToken, (req, res) => {
  db.query(
    "DELETE FROM bookmarks WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal menghapus bookmark" });
      res.json({ success: true });
    }
  );
});

router.get("/categories", authenticateToken, (req, res) => {
  db.query(
    "SELECT DISTINCT category FROM bookmarks WHERE user_id = ? ORDER BY category ASC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil kategori" });
      res.json((results || []).map((r) => r.category));
    }
  );
});

module.exports = router;
