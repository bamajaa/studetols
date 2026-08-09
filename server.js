require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('./src/database');
const TaskManager = require('./src/controllers/TaskManager');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_studetols_default';

// --- MIDDLEWARE UTAMA ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SERVING FRONTEND (Halaman Statis) ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/kasir', express.static(path.join(__dirname, 'public/kasir')));
app.use('/tasks', express.static(path.join(__dirname, 'public/tasks')));


// ==========================================
// 1. BACKEND TASK TRACKER API
// ==========================================
const manager = new TaskManager();

app.get('/api/tasks', (req, res) => {
    const tasks = manager.getTasks();
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const { description } = req.body;
    manager.add(description);
    res.json({ success: true });
});

app.put('/api/tasks/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    manager.setStatus(id, status);
    res.json({ success: true });
});

app.put('/api/tasks/:id/description', (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    manager.update(id, description);
    res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    manager.delete(id);
    res.json({ success: true });
});


// ==========================================
// 2. BACKEND KASIR APP API & AUTH
// ==========================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Akses ditolak' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token tidak valid' });
        req.user = user; 
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Hanya admin' });
    next();
};

// --- AUTH DASHBOARD (Username & Password) ---
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Username atau password salah!' });
        if (user.status !== 'aktif') return res.status(403).json({ error: 'Akun ini sedang nonaktif!' });
        
        const token = jwt.sign({ id: user.id, role: user.role, label: user.label || user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, role: user.role, label: user.label || user.username });
    });
});

app.post('/api/auth/register', (req, res) => {
    const { username, password, label } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password wajib diisi!' });
    }

    const userLabel = label || username;
    const accessKey = 'KEY_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    db.run("INSERT INTO users (username, password, access_key, role, label) VALUES (?, ?, ?, 'user', ?)", 
    [username, password, accessKey, userLabel], function(err) {
        if (err) return res.status(400).json({ error: 'Username sudah digunakan, pilih yang lain!' });
        res.json({ success: true, id: this.lastID });
    });
});

// --- AUTH KASIR (Access Key / Token) ---
app.post('/api/kasir/login', (req, res) => {
    const { access_key } = req.body;
    db.get("SELECT * FROM users WHERE access_key = ? OR username = ? OR password = ?", 
    [access_key, access_key, access_key], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Access Key atau Password salah!' });
        if (user.status !== 'aktif') return res.status(403).json({ error: 'Akun kasir ini nonaktif!' });

        const token = jwt.sign({ id: user.id, role: user.role, label: user.label || user.username }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ success: true, token, role: user.role, label: user.label || user.username });
    });
});
// --- API UBAH NAMA TOKO ---
app.put('/api/kasir/store-name', authenticateToken, (req, res) => {
    const { new_label } = req.body;
    
    if (!new_label || new_label.trim() === '') {
        return res.status(400).json({ error: 'Nama toko tidak boleh kosong!' });
    }

    db.run("UPDATE users SET label = ? WHERE id = ?", [new_label, req.user.id], function(err) {
        if (err) {
            console.error("Gagal update nama toko:", err.message);
            return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
        }
        res.json({ success: true, new_label: new_label });
    });
});

// --- REPORTS / TABS API ---
app.post('/api/reports', authenticateToken, (req, res) => {
    const { date } = req.body;
    db.get("SELECT * FROM daily_reports WHERE user_id = ? AND date = ?", [req.user.id, date], (err, report) => {
        if (report) return res.json(report);
        db.run("INSERT INTO daily_reports (user_id, date) VALUES (?, ?)", [req.user.id, date], function() {
            res.json({ id: this.lastID, modal_makanan: 0, modal_minuman: 0, date: date });
        });
    });
});

app.put('/api/reports/:id/modal', authenticateToken, (req, res) => {
    const { modal_makanan, modal_minuman } = req.body;
    db.run("UPDATE daily_reports SET modal_makanan = ?, modal_minuman = ? WHERE id = ? AND user_id = ?", 
    [modal_makanan, modal_minuman, req.params.id, req.user.id], () => res.json({ success: true }));
});

app.get('/api/arsip', authenticateToken, (req, res) => {
    db.all(`SELECT r.*, COALESCE(SUM(s.total), 0) as omzet_total
            FROM daily_reports r LEFT JOIN sales s ON r.id = s.report_id
            WHERE r.user_id = ? GROUP BY r.id ORDER BY r.date DESC`, [req.user.id], (err, reports) => {
        res.json(reports);
    });
});

// --- SALES API ---
app.get('/api/sales/report/:report_id', authenticateToken, (req, res) => {
    db.all(`SELECT s.* FROM sales s JOIN daily_reports r ON s.report_id = r.id 
            WHERE s.report_id = ? AND r.user_id = ?`, [req.params.report_id, req.user.id], (err, rows) => res.json(rows || []));
});

app.post('/api/sales', authenticateToken, (req, res) => {
    const { report_id, product_name, category, qty, price } = req.body;
    const total = qty * price;
    db.get("SELECT id FROM daily_reports WHERE id = ? AND user_id = ?", [report_id, req.user.id], (err, report) => {
        if(!report) return res.status(403).json({ error: 'Unauthorized' });
        db.run("INSERT INTO sales (report_id, product_name, category, qty, price, total) VALUES (?, ?, ?, ?, ?, ?)",
        [report_id, product_name, category, qty, price, total], function() {
            res.json({ id: this.lastID, report_id, product_name, category, qty, price, total });
        });
    });
});

app.delete('/api/sales/:id', authenticateToken, (req, res) => {
    db.run("DELETE FROM sales WHERE id = ?", [req.params.id], () => res.json({ success: true }));
});

// --- ADMIN API (Kelola User / Access Key) ---
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    db.all("SELECT id, username, access_key, label, status, created_at FROM users WHERE role = 'user'", [], (err, rows) => res.json(rows || []));
});

app.post('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    const accessKey = req.body.key || req.body.access_key;
    const label = req.body.label;

    if (!accessKey || !label) {
        return res.status(400).json({ error: 'Key dan Label wajib diisi' });
    }

    db.run("INSERT INTO users (access_key, role, label, status) VALUES (?, 'user', ?, 'aktif')", [accessKey, label], function(err) {
        if (err) return res.status(400).json({ error: 'Key sudah ada' });
        res.json({ success: true, id: this.lastID });
    });
});

app.put('/api/admin/users/:id/status', authenticateToken, isAdmin, (req, res) => {
    db.run("UPDATE users SET status = ? WHERE id = ?", [req.body.status, req.params.id], () => res.json({ success: true }));
});

// Route untuk MENGHAPUS USER (Ditambahkan agar tombol Hapus berfungsi)
app.delete('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
    const userId = req.params.id;
    
    // Jangan izinkan admin menghapus dirinya sendiri agar tidak error (opsional tapi disarankan)
    if (userId == req.user.id) {
        return res.status(403).json({ error: 'Admin tidak bisa menghapus akunnya sendiri' });
    }

    db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
        if (err) {
            console.error("Gagal menghapus user:", err.message);
            return res.status(500).json({ error: 'Gagal menghapus user dari database' });
        }
        res.json({ success: true, message: 'User berhasil dihapus' });
    });
});

// --- ALIAS ROUTE UNTUK KASIR PANEL (Mencegah Error 404) ---
app.get('/api/kasir/users', authenticateToken, isAdmin, (req, res) => {
    db.all("SELECT id, username, access_key, label, status, created_at FROM users", [], (err, rows) => res.json(rows || []));
});

// --- PERBAIKAN RUTE REGISTRASI KASIR ---
app.post('/api/kasir/users', (req, res) => {
    const accessKey = req.body.key || req.body.access_key;
    const label = req.body.label;

    if (!accessKey || !label) {
        return res.status(400).json({ error: 'Access key dan label wajib diisi!' });
    }

    // Menyertakan username & password agar tidak bentrok dengan constraint database
    db.run(
        "INSERT INTO users (username, password, access_key, role, label, status) VALUES (?, ?, ?, 'user', ?, 'aktif')", 
        [label, accessKey, accessKey, label], 
        function(err) {
            if (err) {
                console.error("DB Error:", err.message);
                return res.status(400).json({ error: 'Gagal menyimpan, kemungkinan key atau nama toko sudah terdaftar' });
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.get('/api/cek-users', (req, res) => {
    db.all("SELECT id, username, access_key, role, label FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
// --- JALANKAN SERVER UTAMA ---
app.listen(PORT, () => {
    console.log(`Server Utama Studetols aktif di http://localhost:${PORT}`);
});