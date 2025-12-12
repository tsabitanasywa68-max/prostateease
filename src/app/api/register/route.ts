// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // 1. Validasi Input Dasar
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Mohon lengkapi semua data' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // 2. Cek apakah email sudah terdaftar (PENTING AGAR TIDAK TERTUKAR)
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email ini sudah terdaftar. Silakan login.' },
        { status: 400 }
      );
    }

    // 3. Enkripsi Password (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan ke Database
    const result = db.prepare(`
      INSERT INTO users (name, email, password, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(name, email, hashedPassword);

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      userId: result.lastInsertRowid
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat mendaftar' },
      { status: 500 }
    );
  }
}