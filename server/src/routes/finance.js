const express = require("express");
const db = require("../database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM finance_records WHERE user_id = ? ORDER BY date DESC, created_at DESC",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil catatan keuangan" });
      res.json(results || []);
    }
  );
});

router.post("/", authenticateToken, (req, res) => {
  const { type, amount, category, description, date } = req.body;
  if (!type || !amount || !category) {
    return res.status(400).json({ error: "Tipe, jumlah nominal, dan kategori wajib diisi" });
  }

  const numAmount = Math.abs(parseFloat(amount) || 0);
  const recordDate = date || new Date().toISOString().split("T")[0];

  db.query(
    "INSERT INTO finance_records (user_id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)",
    [req.user.id, type, numAmount, category, description || "", recordDate],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Gagal menyimpan transaksi: " + err.message });
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.delete("/:id", authenticateToken, (req, res) => {
  db.query(
    "DELETE FROM finance_records WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Gagal menghapus transaksi" });
      res.json({ success: true });
    }
  );
});

router.get("/summary", authenticateToken, (req, res) => {
  db.query(
    "SELECT * FROM finance_records WHERE user_id = ?",
    [req.user.id],
    (err, records) => {
      if (err) return res.status(500).json({ error: "Gagal mengambil ringkasan keuangan" });
      const items = records || [];

      let totalIncome = 0;
      let totalExpense = 0;
      const categoryMap = {};

      items.forEach((r) => {
        const val = parseFloat(r.amount) || 0;
        if (r.type === "income") {
          totalIncome += val;
        } else {
          totalExpense += val;
          categoryMap[r.category] = (categoryMap[r.category] || 0) + val;
        }
      });

      const balance = totalIncome - totalExpense;
      const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
        category: cat,
        total: categoryMap[cat],
      }));

      res.json({
        totalIncome,
        totalExpense,
        balance,
        categoryBreakdown,
      });
    }
  );
});

module.exports = router;
