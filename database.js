const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shop.db');

db.serialize(() => {
  // Products Table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER,
    stock INTEGER,
    img TEXT,
    category TEXT
  )`);

  // Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  // Orders Table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    date TEXT,
    total INTEGER,
    status TEXT,
    items TEXT,
    address TEXT,
    phone TEXT,
    payment_method TEXT,
    slip TEXT
  )`);

  // Initial products seeding disabled

  // Seed Admin User
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', 'admin1234', 'admin')`);
  db.run(`UPDATE users SET password = 'admin1234', role = 'admin' WHERE username = 'admin'`);

  // Migrations: add missing columns if DB already exists
  db.all("PRAGMA table_info(products)", (err, columns) => {
    const names = columns.map(c => c.name);
    if (!names.includes('category')) {
      db.run("ALTER TABLE products ADD COLUMN category TEXT");
    }
    if (!names.includes('model')) {
      db.run("ALTER TABLE products ADD COLUMN model TEXT");
    }
  });
  db.all("PRAGMA table_info(orders)", (err, columns) => {
    const names = columns.map(c => c.name);
    if (!names.includes('address')) db.run("ALTER TABLE orders ADD COLUMN address TEXT");
    if (!names.includes('phone')) db.run("ALTER TABLE orders ADD COLUMN phone TEXT");
    if (!names.includes('payment_method')) db.run("ALTER TABLE orders ADD COLUMN payment_method TEXT");
    if (!names.includes('slip')) db.run("ALTER TABLE orders ADD COLUMN slip TEXT");
  });

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user TEXT,
    to_user TEXT,
    text TEXT,
    attachment TEXT,
    attachment_name TEXT,
    attachment_type TEXT,
    created_at TEXT
  )`);
});

module.exports = db;
