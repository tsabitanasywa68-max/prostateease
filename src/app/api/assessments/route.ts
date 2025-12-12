// app/api/assessments/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware sederhana untuk ambil User ID dari token
const getUserIdFromToken = (request: Request) => {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    // PENTING: Paksa return sebagai Number agar cocok dengan Database SQLite
    return Number(decoded.userId); 
  } catch (err) {
    return null;
  }
};

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Debugging: Pastikan ID yang request benar
    console.log('Fetching Data untuk User ID:', userId);

    // Ambil data HANYA milik user tersebut
    const assessments = db.prepare(`
      SELECT * FROM assessments 
      WHERE user_id = ? 
      ORDER BY date DESC
    `).all(userId);

    // Mencegah return null, minimal array kosong
    return NextResponse.json({ assessments: assessments || [] });

  } catch (error) {
    console.error('GET Assessment Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { q1, q2, q3, q4, q5, q6, q7, qol, notes } = await request.json();

    const questions = [q1, q2, q3, q4, q5, q6, q7];
    // Validasi input angka
    if (questions.some(q => q < 0 || q > 5) || qol < 0 || qol > 6) {
      return NextResponse.json(
        { error: 'Nilai jawaban tidak valid' },
        { status: 400 }
      );
    }

    const totalScore = q1 + q2 + q3 + q4 + q5 + q6 + q7;
    
    let category = 'Ringan';
    if (totalScore > 19) category = 'Berat';
    else if (totalScore > 7) category = 'Sedang';

    // Insert dengan user_id yang sudah dipastikan Number
    const result = db.prepare(`
      INSERT INTO assessments 
      (user_id, q1, q2, q3, q4, q5, q6, q7, qol, total_score, category, notes, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      userId, q1, q2, q3, q4, q5, q6, q7, qol, 
      totalScore, category, notes || null
    );

    return NextResponse.json({
      success: true,
      assessmentId: result.lastInsertRowid,
      totalScore,
      category,
    });
  } catch (error) {
    console.error('POST Assessment Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}