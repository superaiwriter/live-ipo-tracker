import { NextResponse } from 'next/server';
import { fetchFmpIposInternal } from '@/services/ipoApi';

// In-memory rate limiting for retry endpoint: max 1 retry per 60 seconds
let lastRetryTimestamp = 0;
const RETRY_COOLDOWN_MS = 60000;

export async function POST(request: Request) {
  const now = Date.now();
  const timeSinceLast = now - lastRetryTimestamp;

  if (timeSinceLast < RETRY_COOLDOWN_MS) {
    const remainingSeconds = Math.ceil((RETRY_COOLDOWN_MS - timeSinceLast) / 1000);
    return NextResponse.json(
      {
        error: `Retry rate limited to protect API quota. Please wait ${remainingSeconds}s before retrying.`,
        remainingSeconds,
      },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { from, to } = body as { from?: string; to?: string };

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Invalid range: "from" and "to" dates are required.' },
        { status: 400 }
      );
    }

    lastRetryTimestamp = now;

    // Fetch bypassing cache for the specified range
    const result = await fetchFmpIposInternal(from, to, { bypassCache: true });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'Internal retry error' },
      { status: 500 }
    );
  }
}
