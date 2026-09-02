const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error open DB:', err);
    else console.log('Database SQLite Terhubung.');
});

db.serialize(() => {
    // Tabel Users dengan Username, Password, dan Access Key
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        access_key TEXT UNIQUE,
        role TEXT NOT NULL, -- 'admin' atau 'user'
        label TEXT,
        status TEXT DEFAULT 'aktif',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabel Laporan Harian
    db.run(`CREATE TABLE IF NOT EXISTS daily_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        modal_makanan REAL DEFAULT 0,
        modal_minuman REAL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    // Tabel Penjualan
    db.run(`CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        qty INTEGER NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (report_id) REFERENCES daily_reports(id)
    )`);

    // Tabel Mata Pelajaran (Kalkulator Nilai)
db.run(`CREATE TABLE IF NOT EXISTS grade_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject_name TEXT NOT NULL,
    mode TEXT DEFAULT 'bobot', -- 'bobot' atau 'rata'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)`);

// Tabel Komponen Nilai per Mapel
db.run(`CREATE TABLE IF NOT EXISTS grade_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    score REAL,
    weight REAL,
    urutan INTEGER DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES grade_subjects(id)
)`);
    // Buat Akun Admin Default (Bisa buat login Dashboard & Kasir)
    db.get("SELECT * FROM users WHERE username = 'admin'", [], (err, row) => {
        if (!row) {
            db.run("INSERT INTO users (username, password, access_key, role, label) VALUES (?, ?, ?, ?, ?)", 
            ['admin', 'admin00', 'ADMIN123', 'admin', 'Super Admin']);
            console.log("Admin default dibuat. User: admin | Pass: admin00 | Kasir Key: ADMIN123");
        }
    });
});

module.exports = db;