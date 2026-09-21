const express = require("express");
const db = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/subjects-list", authenticateToken, (req, res) => {
  db.query(
    "SELECT DISTINCT subject_name FROM grade_subjects WHERE user_id = ? ORDER BY subject_name ASC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil daftar mapel" });
      res.json(results.map((r) => r.subject_name));
    }
  );
});

router.get("/", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM grade_subjects WHERE user_id = ? ORDER BY updated_at DESC",
    [req.user.id],
    (err, subjects) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil data" });
      if (!subjects || subjects.length === 0) return res.json([]);
      const ids = subjects.map((s) => s.id);
      db.query(
        "SELECT * FROM grade_components WHERE subject_id IN (?) ORDER BY urutan ASC",
        [ids],
        (err2, components) => {
          if (err2) return res.status(500).json({ error: "Gagal mengambil komponen" });
          const result = subjects.map((s) => ({
            ...s,
            components: (components || []).filter((c) => c.subject_id === s.id),
          }));
          res.json(result);
        }
      );
    }
  );
});

router.get("/:id", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM grade_subjects WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, results) => {
      const subject = results && results[0];
      if (err || !subject) return res.status(404).json({ error: "Data tidak ditemukan" });
      db.query(
        "SELECT * FROM grade_components WHERE subject_id = ? ORDER BY urutan ASC",
        [subject.id],
        (err2, components) => {
          res.json({ ...subject, components: components || [] });
        }
      );
    }
  );
});

router.post("/", authenticateToken, (req, res) => {
  const { subject_name, mode, data_nilai } = req.body;
  if (!subject_name || !Array.isArray(data_nilai) || data_nilai.length === 0) {
    return res.status(400).json({ error: "Nama mapel dan minimal 1 nilai wajib diisi" });
  }

  db.query(
    "SELECT id FROM grade_subjects WHERE user_id = ? AND LOWER(subject_name) = LOWER(?)",
    [req.user.id, subject_name],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Terjadi kesalahan server" });
      const existing = results && results[0];

      const saveComponents = (subjectId) => {
        db.query("DELETE FROM grade_components WHERE subject_id = ?", [subjectId], (errDel) => {
          if (errDel) return res.status(500).json({ error: "Gagal memperbarui komponen" });
          const values = data_nilai.map((c, idx) => [subjectId, c.name, c.score, c.weight, idx]);
          db.query(
            "INSERT INTO grade_components (subject_id, name, score, weight, urutan) VALUES ?",
            [values],
            (errIns) => {
              if (errIns) return res.status(500).json({ error: "Gagal menyimpan komponen" });
              res.json({ success: true, id: subjectId });
            }
          );
        });
      };

      if (existing) {
        db.query(
          "UPDATE grade_subjects SET mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [mode || "bobot", existing.id],
          (errUpd) => {
            if (errUpd) return res.status(500).json({ error: "Gagal memperbarui mapel" });
            saveComponents(existing.id);
          }
        );
      } else {
        db.query(
          "INSERT INTO grade_subjects (user_id, subject_name, mode) VALUES (?, ?, ?)",
          [req.user.id, subject_name, mode || "bobot"],
          (errIns, result) => {
            if (errIns) return res.status(500).json({ error: "Gagal menyimpan mapel" });
            saveComponents(result.insertId);
          }
        );
      }
    }
  );
});

router.delete("/:id", authenticateToken, (req, res) => {
  db.query(
    "SELECT id FROM grade_subjects WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, results) => {
      const subject = results && results[0];
      if (!subject) return res.status(404).json({ error: "Data tidak ditemukan" });
      db.query("DELETE FROM grade_components WHERE subject_id = ?", [subject.id], () => {
        db.query("DELETE FROM grade_subjects WHERE id = ?", [subject.id], () => {
          res.json({ success: true });
        });
      });
    }
  );
});

module.exports = router;
