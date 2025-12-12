const Database = require('better-sqlite3');
const db = new Database('database.db');

// Check all users
const users = db.prepare('SELECT id, name, email FROM users').all();
console.log('Users in database:', users);

db.close();
