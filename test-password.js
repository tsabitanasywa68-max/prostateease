const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('database.db');

// Get first user
const user = db.prepare('SELECT * FROM users LIMIT 1').get();
console.log('User:', { id: user.id, name: user.name, email: user.email });
console.log('Hashed password from DB:', user.password);

// Try to verify with some common passwords
const passwords = ['password123', 'password', '123456', 'admin', 'test'];

async function testPasswords() {
  for (const pwd of passwords) {
    const match = await bcrypt.compare(pwd, user.password);
    console.log(`Password "${pwd}": ${match ? 'MATCH ✓' : 'no match'}`);
  }
}

testPasswords().then(() => {
  db.close();
});
