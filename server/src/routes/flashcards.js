const express = require("express");
const db = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Decks
router.get("/decks", authenticateToken, (req, res) => {
  db.query(
    `SELECT d.*, COUNT(c.id) as card_count FROM flashcard_decks d
     LEFT JOIN flashcard_cards c ON d.id = c.deck_id
     WHERE d.user_id = ? GROUP BY d.id ORDER BY d.created_at DESC`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil data" });
      res.json(results || []);
    }
  );
});

router.post("/decks", authenticateToken, (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Judul wajib diisi" });
  db.query(
    "INSERT INTO flashcard_decks (user_id, title) VALUES (?, ?)",
    [req.user.id, title],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal membuat deck" });
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.delete("/decks/:id", authenticateToken, (req, res) => {
  db.query(
    "DELETE FROM flashcard_decks WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal menghapus deck" });
      res.json({ success: true });
    }
  );
});

// Cards
router.get("/decks/:id/cards", authenticateToken, (req, res) => {
  db.query(
    `SELECT c.* FROM flashcard_cards c
     JOIN flashcard_decks d ON c.deck_id = d.id
     WHERE d.id = ? AND d.user_id = ? ORDER BY c.position ASC`,
    [req.params.id, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil kartu" });
      res.json(results || []);
    }
  );
});

router.post("/decks/:id/cards", authenticateToken, (req, res) => {
  const { front, back } = req.body;
  if (!front || !back) return res.status(400).json({ error: "Sisi depan dan belakang wajib diisi" });
  db.query(
    "SELECT id FROM flashcard_decks WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err, results) => {
      if (!results || !results[0]) return res.status(404).json({ error: "Deck tidak ditemukan" });
      db.query(
        "SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM flashcard_cards WHERE deck_id = ?",
        [req.params.id],
        (err2, posResult) => {
          const pos = posResult[0].next_pos;
          db.query(
            "INSERT INTO flashcard_cards (deck_id, front, back, position) VALUES (?, ?, ?, ?)",
            [req.params.id, front, back, pos],
            (err3, result) => {
              if (err3) return res.status(500).json({ error: "Gagal menambah kartu" });
              res.json({ success: true, id: result.insertId });
            }
          );
        }
      );
    }
  );
});

router.delete("/cards/:id", authenticateToken, (req, res) => {
  db.query(
    `DELETE c FROM flashcard_cards c
     JOIN flashcard_decks d ON c.deck_id = d.id
     WHERE c.id = ? AND d.user_id = ?`,
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal menghapus kartu" });
      res.json({ success: true });
    }
  );
});

module.exports = router;
