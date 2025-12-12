const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('database.db');

async function resetPasswords() {
  // Hash a known password
  const newPassword = 'password123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update all existing users with the new password
  const result = db.prepare('UPDATE users SET password = ?').run(hashedPassword);
  
  console.log(`Updated ${result.changes} user(s) with password: ${newPassword}`);
  console.log('Hashed password:', hashedPassword);
  
  // Verify
  const users = db.prepare('SELECT id, name, email FROM users').all();
  console.log('\nAll users:');
  users.forEach(u => console.log(`  - ${u.name} (${u.email})`));
}

resetPasswords().then(() => {
  db.close();
  console.log('\nPassword reset complete! You can now login with:');
  console.log('Email: nasywa@gmail.com');
  console.log('Password: password123');
});
