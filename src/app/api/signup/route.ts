import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await pool.connect();
    try {
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser && existingUser.rowCount && existingUser.rowCount > 0) {
        return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
      }
      await client.query(
        'INSERT INTO users (email, password) VALUES ($1, $2)',
        [email, hashedPassword]
      );
      return NextResponse.json({ message: 'User created successfully.' }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
} 