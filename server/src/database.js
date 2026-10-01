const mysql = require("mysql2");
require("dotenv").config();

const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "studetols",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
};

if (process.env.DB_SSL === "true" || (process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1")) {
  poolConfig.ssl = { minVersion: "TLSv1.2", rejectUnauthorized: true };
}

const db = mysql.createPool(poolConfig);

const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    access_key VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL,
    label VARCHAR(255),
    avatar LONGTEXT,
    bio TEXT,
    favorite_subject VARCHAR(255),
    status VARCHAR(50) DEFAULT 'aktif',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS daily_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date VARCHAR(50) NOT NULL,
    modal_makanan DECIMAL(12,2) DEFAULT 0,
    modal_minuman DECIMAL(12,2) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    qty INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (report_id) REFERENCES daily_reports(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS grade_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    mode VARCHAR(50) DEFAULT 'bobot',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS grade_components (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    score DECIMAL(5,2),
    weight DECIMAL(5,2),
    urutan INT DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES grade_subjects(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS study_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL,
    date VARCHAR(50) NOT NULL,
    source VARCHAR(50) DEFAULT 'manual',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'todo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS flashcard_decks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS flashcard_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deck_id INT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    position INT DEFAULT 0,
    FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS bookmarks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    day_index INT NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    teacher_name VARCHAR(255),
    position INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS schedule_duties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    day_index INT NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS cornell_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    note_date VARCHAR(50),
    cues TEXT,
    notes TEXT,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS finance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    date VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS friends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'accepted',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_friendship (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS direct_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT DEFAULT 0,
    deleted_by_sender TINYINT DEFAULT 0,
    deleted_by_receiver TINYINT DEFAULT 0,
    deleted_for_everyone TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
];

db.getConnection((err, connection) => {
  if (err) {
    console.error("Gagal koneksi ke MySQL:", err.message);
    return;
  }
  console.log("Database MySQL Terhubung.");

  let completed = 0;
  tables.forEach((sql) => {
    db.query(sql, (e) => {
      if (e) console.error("Error create table:", e.message);
      completed++;
      if (completed === tables.length) {
        // Schema migrations for backward compatibility
        const migrations = [
          "ALTER TABLE grade_subjects ADD COLUMN IF NOT EXISTS mode VARCHAR(50) DEFAULT 'bobot'",
          "ALTER TABLE grade_subjects ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
          "ALTER TABLE grade_components ADD COLUMN IF NOT EXISTS name VARCHAR(255)",
          "ALTER TABLE grade_components ADD COLUMN IF NOT EXISTS urutan INT DEFAULT 0",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar LONGTEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT",
          "ALTER TABLE users ADD COLUMN IF NOT EXISTS favorite_subject VARCHAR(255)",
          "ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS deleted_by_sender TINYINT DEFAULT 0",
          "ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS deleted_by_receiver TINYINT DEFAULT 0",
          "ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS deleted_for_everyone TINYINT DEFAULT 0",
        ];
        migrations.forEach((mq) => db.query(mq, () => {}));

        db.query("SELECT * FROM users WHERE username = 'admin'", (e2, results) => {
          if (e2) return;
          if (results.length === 0) {
            db.query(
              "INSERT INTO users (username, password, access_key, role, label) VALUES (?, ?, ?, ?, ?)",
              ["admin", "admin00", "ADMIN123", "admin", "Super Admin"],
              (e3) => {
                if (!e3) console.log("Admin default dibuat: admin / admin00");
              }
            );
          }
        });
      }
    });
  });

  connection.release();
});

module.exports = db;
