const fs = require('fs');
const path = './data/database.sqlite';

// Cek apakah sqlite3 package tersedia
try {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(path);
  let outputSql = '';

  db.serialize(() => {
    db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, tables) => {
      if (err) throw err;
      let count = 0;
      tables.forEach(table => {
        outputSql += `${table.sql};\n\n`;
        db.all(`SELECT * FROM ${table.name}`, (err, rows) => {
          if (rows && rows.length > 0) {
            rows.forEach(row => {
              const cols = Object.keys(row).join(', ');
              const vals = Object.values(row).map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`).join(', ');
              outputSql += `INSERT INTO ${table.name} (${cols}) VALUES (${vals});\n`;
            });
            outputSql += '\n';
          }
          count++;
          if (count === tables.length) {
            fs.writeFileSync('database.sql', outputSql);
            console.log('✅ BERHASIL! File database.sql telah dibuat.');
            db.close();
          }
        });
      });
    });
  });
} catch (e) {
  console.log('Modul sqlite3 belum ada di node_modules. Jalankan: npm install sqlite3');
}