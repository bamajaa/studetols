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
app.use('/kalkulator', express.static(path.join(__dirname, 'public/kalkulator')));
app.use('/statistik', express.static(path.join(__dirname, 'public/statistik')));


// ==========================================
// 1. BACKEND TASK TRACKER API
// ==========================================
const manager = new TaskManager();

app.get('/api/tasks', (req, res) => {
    res.json(manager.getTasks());
});

app.post('/api/tasks', (req, res) => {
    manager.add(req.body.description);
    res.json({ success: true });
});

app.put('/api/tasks/:id/status', (req, res) => {
    manager.setStatus(req.params.id, req.body.status);
    res.json({ success: true });
});

app.put('/api/tasks/:id/description', (req, res) => {
    manager.update(req.params.id, req.body.description);
    res.json({ success: true });
});

app.delete('/api/tasks/:id', (req, res) => {
    manager.delete(req.params.id);
    res.json({ success: true });
});


// ==========================================
// 2. BACKEND KASIR & AUTHENTICATION API
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

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });
        const user = results[0];
        if (!user) return res.status(401).json({ error: 'Username atau password salah!' });
        if (user.status !== 'aktif') return res.status(403).json({ error: 'Akun ini sedang nonaktif!' });

        const token = jwt.sign({ id: user.id, role: user.role, label: user.label || user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, role: user.role, label: user.label || user.username });
    });
});

app.post('/api/auth/register', (req, res) => {
    const { username, password, label } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi!' });

    const userLabel = label || username;
    const accessKey = 'KEY_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    db.query("INSERT INTO users (username, password, access_key, role, label) VALUES (?, ?, ?, 'user', ?)",
    [username, password, accessKey, userLabel], (err, insertResult) => {
        if (err) return res.status(400).json({ error: 'Username sudah digunakan!' });
        res.json({ success: true, id: insertResult.insertId });
    });
});

app.post('/api/kasir/login', (req, res) => {
    const { access_key } = req.body;
    db.query("SELECT * FROM users WHERE access_key = ? OR username = ? OR password = ?",
    [access_key, access_key, access_key], (err, results) => {
        if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });
        const user = results[0];
        if (!user) return res.status(401).json({ error: 'Access Key atau Password salah!' });
        if (user.status !== 'aktif') return res.status(403).json({ error: 'Akun kasir ini nonaktif!' });

        const token = jwt.sign({ id: user.id, role: user.role, label: user.label || user.username }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ success: true, token, role: user.role, label: user.label || user.username });
    });
});

app.put('/api/kasir/store-name', authenticateToken, (req, res) => {
    const { new_label } = req.body;
    if (!new_label || new_label.trim() === '') return res.status(400).json({ error: 'Nama toko tidak boleh kosong!' });

    db.query("UPDATE users SET label = ? WHERE id = ?", [new_label, req.user.id], (err) => {
        if (err) return res.status(500).json({ error: 'Gagal update nama toko' });
        res.json({ success: true, new_label: new_label });
    });
});

// --- REPORTS & SALES ---
app.post('/api/reports', authenticateToken, (req, res) => {
    const { date } = req.body;
    db.query("SELECT * FROM daily_reports WHERE user_id = ? AND date = ?", [req.user.id, date], (err, results) => {
        if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });
        if (results[0]) return res.json(results[0]);
        db.query("INSERT INTO daily_reports (user_id, date) VALUES (?, ?)", [req.user.id, date], (err2, insertResult) => {
            if (err2) return res.status(500).json({ error: 'Gagal membuat laporan' });
            res.json({ id: insertResult.insertId, modal_makanan: 0, modal_minuman: 0, date: date });
        });
    });
});

app.put('/api/reports/:id/modal', authenticateToken, (req, res) => {
    const { modal_makanan, modal_minuman } = req.body;
    db.query("UPDATE daily_reports SET modal_makanan = ?, modal_minuman = ? WHERE id = ? AND user_id = ?",
    [modal_makanan, modal_minuman, req.params.id, req.user.id], () => res.json({ success: true }));
});

app.get('/api/arsip', authenticateToken, (req, res) => {
    db.query(`SELECT r.*, COALESCE(SUM(s.total), 0) as omzet_total
              FROM daily_reports r LEFT JOIN sales s ON r.id = s.report_id
              WHERE r.user_id = ? GROUP BY r.id ORDER BY r.date DESC`, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil arsip' });
        res.json(results);
    });
});

app.get('/api/sales/report/:report_id', authenticateToken, (req, res) => {
    db.query(`SELECT s.* FROM sales s JOIN daily_reports r ON s.report_id = r.id
              WHERE s.report_id = ? AND r.user_id = ?`, [req.params.report_id, req.user.id], (err, results) => {
        res.json(results || []);
    });
});

app.post('/api/sales', authenticateToken, (req, res) => {
    const { report_id, product_name, category, qty, price } = req.body;
    const total = qty * price;
    db.query("SELECT id FROM daily_reports WHERE id = ? AND user_id = ?", [report_id, req.user.id], (err, results) => {
        if (!results || !results[0]) return res.status(403).json({ error: 'Unauthorized' });
        db.query("INSERT INTO sales (report_id, product_name, category, qty, price, total) VALUES (?, ?, ?, ?, ?, ?)",
        [report_id, product_name, category, qty, price, total], (err2, insertResult) => {
            if (err2) return res.status(500).json({ error: 'Gagal menyimpan penjualan' });
            res.json({ id: insertResult.insertId, report_id, product_name, category, qty, price, total });
        });
    });
});

app.delete('/api/sales/:id', authenticateToken, (req, res) => {
    db.query("DELETE FROM sales WHERE id = ?", [req.params.id], () => res.json({ success: true }));
});

// --- ADMIN / KELOLA USERS ---
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    db.query("SELECT id, username, access_key, label, status, created_at FROM users WHERE role = 'user'", (err, results) => res.json(results || []));
});

app.post('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
    const accessKey = req.body.key || req.body.access_key;
    const label = req.body.label;
    if (!accessKey || !label) return res.status(400).json({ error: 'Key dan Label wajib diisi' });

    db.query("INSERT INTO users (access_key, role, label, status) VALUES (?, 'user', ?, 'aktif')", [accessKey, label], (err, insertResult) => {
        if (err) return res.status(400).json({ error: 'Key sudah ada' });
        res.json({ success: true, id: insertResult.insertId });
    });
});

app.put('/api/admin/users/:id/status', authenticateToken, isAdmin, (req, res) => {
    db.query("UPDATE users SET status = ? WHERE id = ?", [req.body.status, req.params.id], () => res.json({ success: true }));
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, (req, res) => {
    if (req.params.id == req.user.id) return res.status(403).json({ error: 'Admin tidak bisa menghapus akunnya sendiri' });
    db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Gagal menghapus user dari database' });
        res.json({ success: true, message: 'User berhasil dihapus' });
    });
});

app.get('/api/kasir/users', authenticateToken, isAdmin, (req, res) => {
    db.query("SELECT id, username, access_key, label, status, created_at FROM users", (err, results) => res.json(results || []));
});

app.post('/api/kasir/users', (req, res) => {
    const accessKey = req.body.key || req.body.access_key;
    const label = req.body.label;
    if (!accessKey || !label) return res.status(400).json({ error: 'Access key dan label wajib diisi!' });

    db.query("INSERT INTO users (username, password, access_key, role, label, status) VALUES (?, ?, ?, 'user', ?, 'aktif')",
    [label, accessKey, accessKey, label], (err, insertResult) => {
        if (err) return res.status(400).json({ error: 'Gagal menyimpan, kemungkinan key atau nama toko sudah terdaftar' });
        res.json({ success: true, id: insertResult.insertId });
    });
});

app.get('/api/cek-users', (req, res) => {
    db.query("SELECT id, username, access_key, role, label FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// ==========================================
// 3. BACKEND KALKULATOR NILAI API
// ==========================================

// Daftar mapel untuk dropdown (Rute ini harus di atas :id)
app.get('/api/grades/subjects-list', authenticateToken, (req, res) => {
    db.query("SELECT DISTINCT subject_name FROM grade_subjects WHERE user_id = ? ORDER BY subject_name ASC", [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil daftar mapel' });
        res.json(results.map(r => r.subject_name));
    });
});

app.get('/api/grades', authenticateToken, (req, res) => {
    db.query("SELECT * FROM grade_subjects WHERE user_id = ? ORDER BY updated_at DESC", [req.user.id], (err, subjects) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil data' });
        if (!subjects || subjects.length === 0) return res.json([]);

        const ids = subjects.map(s => s.id);
        db.query("SELECT * FROM grade_components WHERE subject_id IN (?) ORDER BY urutan ASC", [ids], (err2, components) => {
            if (err2) return res.status(500).json({ error: 'Gagal mengambil komponen' });
            const result = subjects.map(s => ({
                ...s,
                components: components.filter(c => c.subject_id === s.id)
            }));
            res.json(result);
        });
    });
});

app.get('/api/grades/:id', authenticateToken, (req, res) => {
    db.query("SELECT * FROM grade_subjects WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], (err, results) => {
        const subject = results && results[0];
        if (err || !subject) return res.status(404).json({ error: 'Data tidak ditemukan' });
        db.query("SELECT * FROM grade_components WHERE subject_id = ? ORDER BY urutan ASC", [subject.id], (err2, components) => {
            res.json({ ...subject, components: components || [] });
        });
    });
});

app.post('/api/grades', authenticateToken, (req, res) => {
    const { subject_name, mode, data_nilai } = req.body;
    if (!subject_name || !Array.isArray(data_nilai) || data_nilai.length === 0) {
        return res.status(400).json({ error: 'Nama mapel dan minimal 1 nilai wajib diisi' });
    }

    db.query("SELECT id FROM grade_subjects WHERE user_id = ? AND LOWER(subject_name) = LOWER(?)",
    [req.user.id, subject_name], (err, results) => {
        if (err) return res.status(500).json({ error: 'Terjadi kesalahan server' });
        const existing = results && results[0];

        const saveComponents = (subjectId) => {
            db.query("DELETE FROM grade_components WHERE subject_id = ?", [subjectId], (errDel) => {
                if (errDel) return res.status(500).json({ error: 'Gagal memperbarui komponen' });
                
                const values = data_nilai.map((c, idx) => [subjectId, c.name, c.score, c.weight, idx]);
                db.query("INSERT INTO grade_components (subject_id, name, score, weight, urutan) VALUES ?", [values], (errIns) => {
                    if (errIns) return res.status(500).json({ error: 'Gagal menyimpan komponen' });
                    res.json({ success: true, id: subjectId });
                });
            });
        };

        if (existing) {
            db.query("UPDATE grade_subjects SET mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [mode || 'bobot', existing.id], (errUpd) => {
                if (errUpd) return res.status(500).json({ error: 'Gagal memperbarui mapel' });
                saveComponents(existing.id);
            });
        } else {
            db.query("INSERT INTO grade_subjects (user_id, subject_name, mode) VALUES (?, ?, ?)",
            [req.user.id, subject_name, mode || 'bobot'], (errIns, insertResult) => {
                if (errIns) return res.status(500).json({ error: 'Gagal menyimpan mapel' });
                saveComponents(insertResult.insertId);
            });
        }
    });
});

app.delete('/api/grades/:id', authenticateToken, (req, res) => {
    db.query("SELECT id FROM grade_subjects WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], (err, results) => {
        const subject = results && results[0];
        if (!subject) return res.status(404).json({ error: 'Data tidak ditemukan' });
        db.query("DELETE FROM grade_components WHERE subject_id = ?", [subject.id], () => {
            db.query("DELETE FROM grade_subjects WHERE id = ?", [subject.id], () => {
                res.json({ success: true });
            });
        });
    });
});


// ==========================================
// 4. BACKEND STATISTIK BELAJAR API
// ==========================================

app.get('/api/study-sessions', authenticateToken, (req, res) => {
    db.query("SELECT * FROM study_sessions WHERE user_id = ? ORDER BY date DESC, created_at DESC", [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil data' });
        res.json(results || []);
    });
});

app.post('/api/study-sessions', authenticateToken, (req, res) => {
    const { subject_name, duration_minutes, date, source } = req.body;
    
    // VALIDASI DIPERBARUI: Mengizinkan angka 0 masuk database untuk testing
    if (!subject_name || duration_minutes === undefined || duration_minutes < 0 || !date) {
        return res.status(400).json({ error: 'Mapel, durasi, dan tanggal wajib diisi dengan benar' });
    }

    db.query("INSERT INTO study_sessions (user_id, subject_name, duration_minutes, date, source) VALUES (?, ?, ?, ?, ?)",
    [req.user.id, subject_name, Math.round(duration_minutes), date, source || 'manual'], (err, insertResult) => {
        if (err) return res.status(500).json({ error: 'Gagal menyimpan sesi belajar' });
        res.json({ success: true, id: insertResult.insertId });
    });
});

app.delete('/api/study-sessions/:id', authenticateToken, (req, res) => {
    db.query("DELETE FROM study_sessions WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], (err) => {
        if (err) return res.status(500).json({ error: 'Gagal menghapus data' });
        res.json({ success: true });
    });
});

app.get('/api/statistics/summary', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.query("SELECT * FROM study_sessions WHERE user_id = ? ORDER BY date ASC", [userId], (err, sessions) => {
        if (err) return res.status(500).json({ error: 'Gagal mengambil data waktu belajar' });

        db.query("SELECT * FROM grade_subjects WHERE user_id = ?", [userId], (err2, subjects) => {
            if (err2) return res.status(500).json({ error: 'Gagal mengambil data nilai' });

            const subjectIds = subjects.map(s => s.id);
            
            const withComponents = (cb) => {
                if (subjectIds.length === 0) return cb([]);
                db.query("SELECT * FROM grade_components WHERE subject_id IN (?)", [subjectIds], (err3, comps) => {
                    cb(err3 ? [] : comps);
                });
            };

            withComponents((components) => {
                const gradesBySubject = subjects.map(s => {
                    const comps = components.filter(c => c.subject_id === s.id && c.score !== null && c.score !== undefined);
                    let nilai_akhir = null;
                    if (comps.length > 0) {
                        if (s.mode === 'rata') {
                            nilai_akhir = comps.reduce((sum, c) => sum + Number(c.score), 0) / comps.length;
                        } else {
                            const totalWeight = comps.reduce((sum, c) => sum + Number(c.weight || 0), 0);
                            nilai_akhir = totalWeight > 0
                                ? comps.reduce((sum, c) => sum + Number(c.score) * Number(c.weight || 0), 0) / totalWeight
                                : comps.reduce((sum, c) => sum + Number(c.score), 0) / comps.length;
                        }
                    }
                    return {
                        key: s.subject_name.toLowerCase(),
                        subject_name: s.subject_name,
                        nilai_akhir: nilai_akhir !== null ? Math.round(nilai_akhir * 100) / 100 : null
                    };
                });

                const minutesMap = {};
                sessions.forEach(sess => {
                    const key = sess.subject_name.toLowerCase();
                    if (!minutesMap[key]) minutesMap[key] = { subject_name: sess.subject_name, total_minutes: 0 };
                    minutesMap[key].total_minutes += sess.duration_minutes;
                });

                const allKeys = new Set([...Object.keys(minutesMap), ...gradesBySubject.map(g => g.key)]);
                const by_subject = Array.from(allKeys).map(key => {
                    const grade = gradesBySubject.find(g => g.key === key);
                    const time = minutesMap[key];
                    return {
                        subject_name: (time ? time.subject_name : grade.subject_name),
                        total_minutes: time ? time.total_minutes : 0,
                        nilai_akhir: grade ? grade.nilai_akhir : null
                    };
                });

                const dailyMap = {};
                sessions.forEach(sess => {
                    dailyMap[sess.date] = (dailyMap[sess.date] || 0) + sess.duration_minutes;
                });
                const daily = Object.keys(dailyMap).sort().map(date => ({ date, total_minutes: dailyMap[date] }));

                const withNilai = by_subject.filter(s => s.nilai_akhir !== null);
                const best_subject = withNilai.length > 0 ? withNilai.reduce((a, b) => a.nilai_akhir > b.nilai_akhir ? a : b) : null;
                const worst_subject = withNilai.length > 0 ? withNilai.reduce((a, b) => a.nilai_akhir < b.nilai_akhir ? a : b) : null;

                const withTime = by_subject.filter(s => s.total_minutes > 0);
                const most_studied = withTime.length > 0 ? withTime.reduce((a, b) => a.total_minutes > b.total_minutes ? a : b) : null;
                const least_studied = withTime.length > 0 ? withTime.reduce((a, b) => a.total_minutes < b.total_minutes ? a : b) : null;

                res.json({
                    total_minutes: sessions.reduce((sum, s) => sum + s.duration_minutes, 0),
                    by_subject,
                    daily,
                    insight: { best_subject, worst_subject, most_studied, least_studied }
                });
            });
        });
    });
});

// --- JALANKAN SERVER UTAMA ---
app.listen(PORT, () => {
    console.log(`Server Utama Studetols aktif di http://localhost:${PORT}`);
});