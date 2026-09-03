const mysql = require('mysql2');
require('dotenv').config();

// Buat pool koneksi ke MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'studetols',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tes koneksi dan inisialisasi tabel
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Gagal koneksi ke MySQL:', err.message);
    return;
  }
  console.log('✅ Database MySQL Terhubung.');

  // 1. Tabel Users
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      access_key VARCHAR(255) UNIQUE,
      role VARCHAR(50) NOT NULL,
      label VARCHAR(255),
      status VARCHAR(50) DEFAULT 'aktif',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 2. Tabel Laporan Harian
  const createDailyReportsTable = `
    CREATE TABLE IF NOT EXISTS daily_reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date VARCHAR(50) NOT NULL,
      modal_makanan DECIMAL(12, 2) DEFAULT 0,
      modal_minuman DECIMAL(12, 2) DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  // 3. Tabel Penjualan
  const createSalesTable = `
    CREATE TABLE IF NOT EXISTS sales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      report_id INT NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      qty INT NOT NULL,
      price DECIMAL(12, 2) NOT NULL,
      total DECIMAL(12, 2) NOT NULL,
      FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE CASCADE
    )
  `;

  // 4. Tabel Mata Pelajaran (Kalkulator Nilai)
  const createGradeSubjectsTable = `
    CREATE TABLE IF NOT EXISTS grade_subjects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      subject_name VARCHAR(255) NOT NULL,
      mode VARCHAR(50) DEFAULT 'bobot',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  // 5. Tabel Komponen Nilai (Kalkulator Nilai)
  const createGradeComponentsTable = `
    CREATE TABLE IF NOT EXISTS grade_components (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      score DECIMAL(5, 2),
      weight DECIMAL(5, 2),
      urutan INT DEFAULT 0,
      FOREIGN KEY (subject_id) REFERENCES grade_subjects(id) ON DELETE CASCADE
    )
  `;

  // 6. Tabel Sesi Belajar (Statistik Belajar)
  const createStudySessionsTable = `
    CREATE TABLE IF NOT EXISTS study_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      subject_name VARCHAR(255) NOT NULL,
      duration_minutes INT NOT NULL,
      date VARCHAR(50) NOT NULL,
      source VARCHAR(50) DEFAULT 'manual',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  // Jalankan pembuatan tabel secara berurutan
  db.query(createUsersTable, (err) => {
    if (err) return console.error('Error create users:', err);

    // Buat Akun Admin Default jika belum ada
    db.query("SELECT * FROM users WHERE username = 'admin'", (err, results) => {
      if (err) return console.error('Error check admin:', err);
      if (results.length === 0) {
        db.query(
          "INSERT INTO users (username, password, access_key, role, label) VALUES (?, ?, ?, ?, ?)",
          ['admin', 'admin00', 'ADMIN123', 'admin', 'Super Admin'],
          (err) => {
            if (err) console.error('Error insert admin default:', err);
            else console.log("Admin default dibuat. User: admin | Pass: admin00 | Kasir Key: ADMIN123");
          }
        );
      }
    });

    db.query(createDailyReportsTable, (err) => {
      if (err) return console.error('Error create daily_reports:', err);

      db.query(createSalesTable, (err) => {
        if (err) return console.error('Error create sales:', err);
      });
    });

    db.query(createGradeSubjectsTable, (err) => {
      if (err) return console.error('Error create grade_subjects:', err);

      db.query(createGradeComponentsTable, (err) => {
        if (err) return console.error('Error create grade_components:', err);
      });
    });

    db.query(createStudySessionsTable, (err) => {
      if (err) return console.error('Error create study_sessions:', err);
    });
  });

  connection.release();
});

module.exports = db;
