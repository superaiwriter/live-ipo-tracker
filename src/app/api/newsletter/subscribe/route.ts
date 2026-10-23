import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/supabase';
import { emailService } from '@/lib/email/provider';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, consent } = body;

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: 'You must provide consent to receive the newsletter.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const verificationToken = crypto.randomUUID();

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        const { error: upsertError } = await supabase
          .from('newsletter_subscribers')
          .upsert(
            {
              email: normalizedEmail,
              status: 'pending_verification',
              verification_token: verificationToken,
              consent_given_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );

        if (upsertError) {
          console.error('Database error storing subscriber:', upsertError);
        }
      } catch (dbErr) {
        console.error('Failed to connect to Supabase for newsletter:', dbErr);
      }
    }

    // Send double opt-in confirmation email
    const emailData = emailService.generateDoubleOptInEmail(verificationToken);
    await emailService.sendEmail({
      to: normalizedEmail,
      subject: emailData.subject,
      html: emailData.html,
    });

    return NextResponse.json({
      success: true,
      message:
        'Verification link sent! Please check your inbox and click the confirmation link to activate your daily 9 AM IST IPO brief.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error processing subscription.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
