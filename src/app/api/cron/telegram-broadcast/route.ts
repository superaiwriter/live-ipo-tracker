import { NextRequest, NextResponse } from 'next/server';
import { getIpoProvider } from '@/lib/providers';
import { telegramBot } from '@/lib/telegram/bot';

export async function GET(req: NextRequest) {
  // Authorization check (Rule 8: Secret token verification)
  const authHeader = req.headers.get('authorization');
  const cronHeader = req.headers.get('x-cron-secret');
  const querySecret = req.nextUrl.searchParams.get('secret');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret) {
    const isAuthorized =
      authHeader === `Bearer ${expectedSecret}` ||
      cronHeader === expectedSecret ||
      querySecret === expectedSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized cron invocation.' }, { status: 401 });
    }
  }

  try {
    const provider = getIpoProvider();
    const liveIpos = await provider.getIpos({ status: 'open' });

    // Filter IPOs that opened today in IST
    const todayIST = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
    }).format(new Date()); // YYYY-MM-DD

    const openedToday = liveIpos.filter((i) => i.open_date && i.open_date.startsWith(todayIST));

    let broadcastCount = 0;
    for (const ipo of openedToday) {
      const res = await telegramBot.broadcastIpoOpen(ipo);
      if (res.success) broadcastCount++;
    }

    return NextResponse.json({
      success: true,
      broadcastCount,
      openedTodayCount: openedToday.length,
      isTelegramConfigured: telegramBot.isConfigured(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Telegram broadcast failure.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
