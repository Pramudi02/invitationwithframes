import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import getMongoClientPromise from '@/lib/mongodb';

/**
 * POST /api/client-login
 * Authenticates a client against their invitation's clientPasscode.
 *
 * Body: { slug: string, passcode: string }
 *
 * On success: sets a secure, HTTP-only auth cookie and returns 200.
 * On failure: returns 401.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, passcode } = body;

    // ── Input validation ──────────────────────────────────────────
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Invitation ID is required.' },
        { status: 400 }
      );
    }

    if (!passcode || typeof passcode !== 'string' || passcode.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Passcode is required.' },
        { status: 400 }
      );
    }

    // ── Database lookup ───────────────────────────────────────────
    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');
    const doc = await db.collection('settings').findOne(
      { slug: slug.trim() },
      { projection: { clientPasscode: 1, isActive: 1 } }
    );

    // Treat missing invitation and wrong passcode identically (no enumeration)
    if (!doc) {
      return NextResponse.json(
        { success: false, error: 'Invalid Invitation ID or Passcode.' },
        { status: 401 }
      );
    }

    if (!doc.isActive) {
      return NextResponse.json(
        { success: false, error: 'This invitation is no longer active.' },
        { status: 403 }
      );
    }

    // ── Passcode verification (strict equality) ───────────────────
    if (!doc.clientPasscode || doc.clientPasscode !== passcode.trim()) {
      return NextResponse.json(
        { success: false, error: 'Invalid Invitation ID or Passcode.' },
        { status: 401 }
      );
    }

    // ── Set secure auth cookie ────────────────────────────────────
    // Cookie name is scoped per-invitation to support multi-tenant sessions.
    const cookieName = `clientAuth_${slug.trim()}`;
    const cookieStore = await cookies();
    cookieStore.set(cookieName, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });

    return NextResponse.json(
      { success: true, message: 'Authenticated successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[api/client-login] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
