// lib/db.ts
import Database from 'better-sqlite3';

const db = new Database('database.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    dob TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    q1 INTEGER CHECK(q1 >= 0 AND q1 <= 5),
    q2 INTEGER CHECK(q2 >= 0 AND q2 <= 5),
    q3 INTEGER CHECK(q3 >= 0 AND q3 <= 5),
    q4 INTEGER CHECK(q4 >= 0 AND q4 <= 5),
    q5 INTEGER CHECK(q5 >= 0 AND q5 <= 5),
    q6 INTEGER CHECK(q6 >= 0 AND q6 <= 5),
    q7 INTEGER CHECK(q7 >= 0 AND q7 <= 5),
    qol INTEGER CHECK(qol >= 0 AND qol <= 6),
    total_score INTEGER,
    category TEXT,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export default db;