const express = require("express");
const db = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil data" });
      res.json(results || []);
    }
  );
});

router.post("/", authenticateToken, (req, res) => {
  const { description } = req.body;
  if (!description || description.trim() === "")
    return res.status(400).json({ error: "Deskripsi wajib diisi" });
  db.query(
    "INSERT INTO tasks (user_id, description) VALUES (?, ?)",
    [req.user.id, description],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal menambah task" });
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.put("/:id/status", authenticateToken, (req, res) => {
  db.query(
    "UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?",
    [req.body.status, req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal update status" });
      res.json({ success: true });
    }
  );
});

router.put("/:id/description", authenticateToken, (req, res) => {
  db.query(
    "UPDATE tasks SET description = ? WHERE id = ? AND user_id = ?",
    [req.body.description, req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal update deskripsi" });
      res.json({ success: true });
    }
  );
});

router.delete("/:id", authenticateToken, (req, res) => {
  db.query(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal menghapus task" });
      res.json({ success: true });
    }
  );
});

module.exports = router;
