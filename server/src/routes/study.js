const express = require("express");
const db = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/sessions", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM study_sessions WHERE user_id = ? ORDER BY date DESC, created_at DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil data" });
      res.json(results || []);
    }
  );
});

router.post("/sessions", authenticateToken, (req, res) => {
  const { subject_name, duration_minutes, date, source } = req.body;
  if (!subject_name || duration_minutes === undefined || duration_minutes < 0 || !date) {
    return res.status(400).json({ error: "Mapel, durasi, dan tanggal wajib diisi" });
  }
  db.query(
    "INSERT INTO study_sessions (user_id, subject_name, duration_minutes, date, source) VALUES (?, ?, ?, ?, ?)",
    [req.user.id, subject_name, Math.round(duration_minutes), date, source || "manual"],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal menyimpan sesi belajar" });
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.delete("/sessions/:id", authenticateToken, (req, res) => {
  db.query(
    "DELETE FROM study_sessions WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal menghapus data" });
      res.json({ success: true });
    }
  );
});

router.get("/summary", authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT * FROM study_sessions WHERE user_id = ? ORDER BY date ASC",
    [userId],
    (err, sessions) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil data" });
      db.query("SELECT * FROM grade_subjects WHERE user_id = ?", [userId], (err2, subjects) => {
        if (err2) return res.status(500).json({ error: "Gagal mengambil data nilai" });
        const subjectIds = (subjects || []).map((s) => s.id);
        const withComponents = (cb) => {
          if (subjectIds.length === 0) return cb([]);
          db.query(
            "SELECT * FROM grade_components WHERE subject_id IN (?)",
            [subjectIds],
            (err3, comps) => cb(err3 ? [] : comps)
          );
        };

        withComponents((components) => {
          const gradesBySubject = (subjects || []).map((s) => {
            const comps = (components || []).filter(
              (c) => c.subject_id === s.id && c.score !== null && c.score !== undefined
            );
            let nilai_akhir = null;
            if (comps.length > 0) {
              if (s.mode === "rata") {
                nilai_akhir = comps.reduce((sum, c) => sum + Number(c.score), 0) / comps.length;
              } else {
                const totalWeight = comps.reduce((sum, c) => sum + Number(c.weight || 0), 0);
                nilai_akhir =
                  totalWeight > 0
                    ? comps.reduce((sum, c) => sum + Number(c.score) * Number(c.weight || 0), 0) / totalWeight
                    : comps.reduce((sum, c) => sum + Number(c.score), 0) / comps.length;
              }
            }
            return {
              key: s.subject_name.toLowerCase(),
              subject_name: s.subject_name,
              nilai_akhir: nilai_akhir !== null ? Math.round(nilai_akhir * 100) / 100 : null,
            };
          });

          const minutesMap = {};
          (sessions || []).forEach((sess) => {
            const key = sess.subject_name.toLowerCase();
            if (!minutesMap[key]) minutesMap[key] = { subject_name: sess.subject_name, total_minutes: 0 };
            minutesMap[key].total_minutes += sess.duration_minutes;
          });

          const allKeys = new Set([...Object.keys(minutesMap), ...gradesBySubject.map((g) => g.key)]);
          const by_subject = Array.from(allKeys).map((key) => {
            const grade = gradesBySubject.find((g) => g.key === key);
            const time = minutesMap[key];
            return {
              subject_name: time ? time.subject_name : grade.subject_name,
              total_minutes: time ? time.total_minutes : 0,
              nilai_akhir: grade ? grade.nilai_akhir : null,
            };
          });

          const dailyMap = {};
          (sessions || []).forEach((sess) => {
            dailyMap[sess.date] = (dailyMap[sess.date] || 0) + sess.duration_minutes;
          });
          const daily = Object.keys(dailyMap).sort().map((date) => ({ date, total_minutes: dailyMap[date] }));

          const withNilai = by_subject.filter((s) => s.nilai_akhir !== null);
          const best_subject = withNilai.length > 0 ? withNilai.reduce((a, b) => (a.nilai_akhir > b.nilai_akhir ? a : b)) : null;
          const worst_subject = withNilai.length > 0 ? withNilai.reduce((a, b) => (a.nilai_akhir < b.nilai_akhir ? a : b)) : null;
          const withTime = by_subject.filter((s) => s.total_minutes > 0);
          const most_studied = withTime.length > 0 ? withTime.reduce((a, b) => (a.total_minutes > b.total_minutes ? a : b)) : null;
          const least_studied = withTime.length > 0 ? withTime.reduce((a, b) => (a.total_minutes < b.total_minutes ? a : b)) : null;

          res.json({
            total_minutes: (sessions || []).reduce((sum, s) => sum + s.duration_minutes, 0),
            by_subject,
            daily,
            insight: { best_subject, worst_subject, most_studied, least_studied },
          });
        });
      });
    }
  );
});

module.exports = router;
