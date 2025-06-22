import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    const client = await pool.connect();
    try {
      const userRes = await client.query('SELECT id, password FROM users WHERE email = $1', [email]);
      if (!userRes || !userRes.rows || userRes.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
      }
      const user = userRes.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
      }
      const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, { expiresIn: '1h' });
      return NextResponse.json({ token }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 