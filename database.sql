CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        access_key TEXT UNIQUE,
        role TEXT NOT NULL, -- 'admin' atau 'user'
        label TEXT,
        status TEXT DEFAULT 'aktif',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE daily_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        modal_makanan REAL DEFAULT 0,
        modal_minuman REAL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

CREATE TABLE sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        qty INTEGER NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (report_id) REFERENCES daily_reports(id)
    );

CREATE TABLE grade_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject_name TEXT NOT NULL,
    mode TEXT DEFAULT 'bobot', -- 'bobot' atau 'rata'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE grade_components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    score REAL,
    weight REAL,
    urutan INTEGER DEFAULT 0,
    FOREIGN KEY (subject_id) REFERENCES grade_subjects(id)
);

INSERT INTO users (id, username, password, access_key, role, label, status, created_at) VALUES ('1', 'admin', 'admin00', 'ADMIN123', 'admin', 'TokoRPL', 'aktif', '2026-08-09 04:11:53');
INSERT INTO users (id, username, password, access_key, role, label, status, created_at) VALUES ('11', 'najwaa', 'najwa123', 'KEY_J7BX8A', 'user', 'NAJWA NASPAD', 'aktif', '2026-08-09 10:45:32');
INSERT INTO users (id, username, password, access_key, role, label, status, created_at) VALUES ('12', 'NAJWA RPL', '0000', '0000', 'user', 'NAJWA RPL', 'aktif', '2026-08-09 10:46:22');
INSERT INTO users (id, username, password, access_key, role, label, status, created_at) VALUES ('13', 'bam', 'bam123', 'KEY_84SD4N', 'user', 'ihsan hafidz', 'aktif', '2026-08-09 10:50:23');
INSERT INTO users (id, username, password, access_key, role, label, status, created_at) VALUES ('14', 'bamaja', '1234', 'KEY_XA1X4J', 'user', 'ihsan', 'aktif', '2026-08-28 13:34:23');
INSERT INTO users (id, username, password, access_key, role, label, status, created_at) VALUES ('15', 'bamajaa', '135', 'KEY_5Q1SXD', 'user', 'ihsan hafidz', 'aktif', '2026-09-02 13:18:30');

INSERT INTO daily_reports (id, user_id, date, modal_makanan, modal_minuman) VALUES ('1', '1', '2026-08-09', '0', '0');
INSERT INTO daily_reports (id, user_id, date, modal_makanan, modal_minuman) VALUES ('2', '3', '2026-08-09', '0', '0');
INSERT INTO daily_reports (id, user_id, date, modal_makanan, modal_minuman) VALUES ('3', '4', '2026-08-09', '0', '0');
INSERT INTO daily_reports (id, user_id, date, modal_makanan, modal_minuman) VALUES ('4', '6', '2026-08-09', '0', '0');
INSERT INTO daily_reports (id, user_id, date, modal_makanan, modal_minuman) VALUES ('5', '10', '2026-08-09', '0', '0');
INSERT INTO daily_reports (id, user_id, date, modal_makanan, modal_minuman) VALUES ('6', '12', '2026-08-09', '0', '0');
INSERT INTO daily_reports (id, user_id, date, modal_makanan, modal_minuman) VALUES ('7', '12', '2026-08-28', '0', '0');
INSERT INTO daily_reports (id, user_id, date, modal_makanan, modal_minuman) VALUES ('8', '1', '2026-08-28', '0', '0');
INSERT INTO daily_reports (id, user_id, date, modal_makanan, modal_minuman) VALUES ('9', '12', '2026-09-02', '0', '0');

