import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/db/supabase';
import { SITE_URL } from '@/lib/seo';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing verification token.' }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('verification_token', token)
        .select()
        .single();

      if (error || !data) {
        return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?status=invalid`);
      }

      return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?status=success`);
    } catch (err) {
      console.error('Error verifying newsletter subscriber:', err);
    }
  }

  // Fallback if Supabase not configured in local dev
  return NextResponse.redirect(`${SITE_URL}/newsletter/confirmed?status=success`);
}
