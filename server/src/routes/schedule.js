const express = require("express");
const db = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM schedules WHERE user_id = ? ORDER BY day_index ASC, position ASC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil jadwal" });
      res.json(results || []);
    }
  );
});

router.post("/", authenticateToken, (req, res) => {
  const { entries } = req.body;
  if (!Array.isArray(entries)) return res.status(400).json({ error: "Data tidak valid" });
  db.query("DELETE FROM schedules WHERE user_id = ?", [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: "Gagal menyimpan jadwal" });
    if (entries.length === 0) return res.json({ success: true });
    const values = entries.map((e, i) => [
      req.user.id, e.day_index, e.subject_name, e.time_slot, e.teacher_name || "", i,
    ]);
    db.query(
      "INSERT INTO schedules (user_id, day_index, subject_name, time_slot, teacher_name, position) VALUES ?",
      [values],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Gagal menyimpan jadwal" });
        res.json({ success: true });
      }
    );
  });
});

router.get("/duties", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM schedule_duties WHERE user_id = ? ORDER BY day_index ASC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil piket" });
      res.json(results || []);
    }
  );
});

router.post("/duties", authenticateToken, (req, res) => {
  const { entries } = req.body;
  if (!Array.isArray(entries)) return res.status(400).json({ error: "Data tidak valid" });
  db.query("DELETE FROM schedule_duties WHERE user_id = ?", [req.user.id], (err) => {
    if (err) return res.status(500).json({ error: "Gagal menyimpan piket" });
    if (entries.length === 0) return res.json({ success: true });
    const values = entries.map((e) => [req.user.id, e.day_index, e.student_name]);
    db.query(
      "INSERT INTO schedule_duties (user_id, day_index, student_name) VALUES ?",
      [values],
      (err2) => {
        if (err2) return res.status(500).json({ error: "Gagal menyimpan piket" });
        res.json({ success: true });
      }
    );
  });
});

module.exports = router;
