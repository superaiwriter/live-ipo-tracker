import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/supabase';
import { getIpoProvider } from '@/lib/providers';
import { emailService } from '@/lib/email/provider';

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
    const [openIpos, upcomingIpos] = await Promise.all([
      provider.getIpos({ status: 'open' }),
      provider.getIpos({ status: 'upcoming', limit: 5 }),
    ]);

    // Fetch verified subscribers
    let subscriberEmails: string[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
          .from('newsletter_subscribers')
          .select('email')
          .eq('status', 'verified');

        if (!error && data) {
          subscriberEmails = data.map((row) => row.email);
        }
      } catch (dbErr) {
        console.error('Failed to query subscribers from Supabase:', dbErr);
      }
    }

    if (subscriberEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No verified subscribers to send to at this time.',
        stats: { openCount: openIpos.length, upcomingCount: upcomingIpos.length },
      });
    }

    const digest = emailService.generateDailyDigestEmail(openIpos, upcomingIpos);
    let sentCount = 0;

    for (const email of subscriberEmails) {
      const res = await emailService.sendEmail({
        to: email,
        subject: digest.subject,
        html: digest.html,
      });
      if (res.success) sentCount++;
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalSubscribers: subscriberEmails.length,
      timestampIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Daily newsletter cron failure.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
