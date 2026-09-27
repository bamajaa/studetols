const express = require("express");
const db = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM cornell_notes WHERE user_id = ? ORDER BY updated_at DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil catatan: " + err.message });
      res.json(results || []);
    }
  );
});

router.get("/:id", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM cornell_notes WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, results) => {
      if (err || !results || !results[0])
        return res.status(404).json({ error: "Catatan tidak ditemukan" });
      res.json(results[0]);
    }
  );
});

router.post("/", authenticateToken, (req, res) => {
  const title = (req.body.title && req.body.title.trim()) || "Catatan Baru";
  const subject = req.body.subject || "";
  const note_date = req.body.note_date || new Date().toISOString().split("T")[0];
  const cues = req.body.cues || "";
  const notes = req.body.notes || "";
  const summary = req.body.summary || "";

  db.query(
    "INSERT INTO cornell_notes (user_id, title, subject, note_date, cues, notes, summary) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [req.user.id, title, subject, note_date, cues, notes, summary],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal membuat catatan: " + err.message });
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.put("/:id", authenticateToken, (req, res) => {
  const title = (req.body.title && req.body.title.trim()) || "Catatan Tanpa Judul";
  const subject = req.body.subject || "";
  const note_date = req.body.note_date || new Date().toISOString().split("T")[0];
  const cues = req.body.cues || "";
  const notes = req.body.notes || "";
  const summary = req.body.summary || "";

  db.query(
    `UPDATE cornell_notes SET title=?, subject=?, note_date=?, cues=?, notes=?, summary=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=? AND user_id=?`,
    [title, subject, note_date, cues, notes, summary, req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal menyimpan catatan: " + err.message });
      res.json({ success: true });
    }
  );
});

router.delete("/:id", authenticateToken, (req, res) => {
  db.query(
    "DELETE FROM cornell_notes WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal menghapus catatan: " + err.message });
      res.json({ success: true });
    }
  );
});

module.exports = router;
