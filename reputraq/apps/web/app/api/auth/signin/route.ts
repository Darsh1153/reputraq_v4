import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, keywords } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Ensure route is dynamic and has time for DB connection in serverless
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DB_CONNECT_TIMEOUT_MS = 12000;
const DB_QUERY_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs)),
  ]);
}

export async function POST(request: Request) {
  // Fail fast with a proper JSON response if DB is not configured (e.g. missing env in Vercel)
  if (!process.env.DATABASE_URL?.trim()) {
    console.error('Signin: DATABASE_URL is not set');
    return NextResponse.json(
      { message: 'Service unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    const database = await withTimeout(
      db,
      DB_CONNECT_TIMEOUT_MS,
      'Database connection timed out'
    );
    
    // Find user by email
    const user = await withTimeout(
      database
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1),
      DB_QUERY_TIMEOUT_MS,
      'Sign-in query timed out'
    );

    if (user.length === 0) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const foundUser = user[0];

    // Check password (in production, use proper password hashing)
    if (foundUser.password !== password) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user's keywords if they exist
    const userKeywords = await withTimeout(
      database
        .select()
        .from(keywords)
        .where(eq(keywords.userId, foundUser.id)),
      DB_QUERY_TIMEOUT_MS,
      'Keywords query timed out'
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = foundUser;
    
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        keywords: userKeywords.map(k => k.keyword)
      },
      redirectTo: foundUser.role === 'admin' ? '/admin' : '/dashboard'
    });
  } catch (error) {
    console.error('Signin error:', error);
    const msg =
      error instanceof Error && error.message.toLowerCase().includes('timed out')
        ? 'Service unavailable. Please try again in a few moments.'
        : 'Unable to sign in. Please try again later.';
    // Always return JSON so the client can show a message instead of "Network error"
    return NextResponse.json(
      { message: msg },
      { status: msg.startsWith('Service unavailable') ? 503 : 500 }
    );
  }
}
