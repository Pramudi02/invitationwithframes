import { NextResponse } from 'next/server';

/**
 * POST /api/rsvp-submit
 * Handles RSVP submission to Google Sheets via Apps Script webhook
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { googleSheetUrl, ...formData } = body;

    if (!googleSheetUrl) {
      return NextResponse.json(
        { success: false, error: 'Google Sheet URL not configured' },
        { status: 400 }
      );
    }

    // Send to Google Sheets via Apps Script webhook (server-side to bypass CORS)
    const response = await fetch(googleSheetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        payload: JSON.stringify({
          timestamp: new Date().toISOString(),
          ...formData,
        }),
      }).toString(),
    });

    const result = await response.text();

    return NextResponse.json({
      success: true,
      message: 'RSVP submitted to Google Sheet',
      result,
    });
  } catch (err) {
    console.error('RSVP Submit Error:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
