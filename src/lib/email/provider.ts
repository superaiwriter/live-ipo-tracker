import { SITE_URL } from '@/lib/seo';
import { IPOWithDetails } from '@/types/ipo';
import { formatISTDate } from '@/lib/dates';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private resendApiKey = process.env.RESEND_API_KEY;
  private brevoApiKey = process.env.BREVO_API_KEY;
  private fromEmail = process.env.EMAIL_FROM || 'LiveIPOTracker <alerts@liveipotracker.in>';

  async sendEmail({ to, subject, html }: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    // 1. Check Resend API
    if (this.resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: [to],
            subject,
            html,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.message || 'Resend error' };
        }
        return { success: true, id: data.id };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    // 2. Check Brevo API
    if (this.brevoApiKey) {
      try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'LiveIPOTracker', email: 'alerts@liveipotracker.in' },
            to: [{ email: to }],
            subject,
            htmlContent: html,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.message || 'Brevo error' };
        }
        return { success: true, id: data.messageId };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    // 3. Fallback for Local Dev / Testing
    console.log(`[EMAIL DISPATCH MOCK] To: ${to} | Subject: ${subject}`);
    return { success: true, id: 'mock-local-id' };
  }

  generateDoubleOptInEmail(verificationToken: string): { subject: string; html: string } {
    const verificationUrl = `${SITE_URL}/api/newsletter/verify?token=${verificationToken}`;

    return {
      subject: 'Confirm your subscription to LiveIPOTracker Daily Market Brief',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b;">
          <h2 style="color: #059669; margin-bottom: 8px;">LiveIPOTracker</h2>
          <h3 style="margin-top: 0;">Confirm Your Subscription</h3>
          <p>Please confirm that you wish to receive our free daily 9:00 AM IST IPO Market Intelligence Digest covering Mainboard and SME public issues.</p>
          <div style="margin: 28px 0;">
            <a href="${verificationUrl}" style="background-color: #059669; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Confirm Email Address
            </a>
          </div>
          <p style="font-size: 12px; color: #71717a;">If you did not request this subscription, no action is needed. Your email will not be added to our active list without verification.</p>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="font-size: 11px; color: #a1a1aa;">
            Mandatory Regulatory Notice: Not SEBI registered. Information is for educational purposes only and is not investment advice. Grey Market Premium (GMP) is strictly unofficial and never a forecast.
          </p>
        </div>
      `,
    };
  }

  generateDailyDigestEmail(openIpos: IPOWithDetails[], upcomingIpos: IPOWithDetails[]): { subject: string; html: string } {
    const today = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date());

    const openListHtml = openIpos.length === 0
      ? '<p style="color: #71717a; font-size: 13px;">No active public issues accepting bids today.</p>'
      : openIpos.map((ipo) => `
        <div style="padding: 12px; border: 1px solid #e4e4e7; border-radius: 8px; margin-bottom: 8px;">
          <div style="font-weight: bold; font-size: 14px;">${ipo.company_name} (${ipo.segment.toUpperCase()} • ${ipo.exchange})</div>
          <div style="font-size: 12px; color: #52525b; margin-top: 4px;">
            Price Band: ₹${ipo.price_band_low || 'TBA'} - ₹${ipo.price_band_high || ipo.issue_price || 'TBA'} | 
            Lot Size: ${ipo.lot_size ? `${ipo.lot_size} sh.` : 'TBA'} | 
            Closes: ${formatISTDate(ipo.close_date)} (5:00 PM IST)
          </div>
          ${ipo.latest_gmp ? `<div style="font-size: 11px; color: #059669; font-weight: bold; margin-top: 4px;">Latest GMP: +₹${ipo.latest_gmp.gmp_value} (Unofficial)</div>` : ''}
        </div>
      `).join('');

    const upcomingListHtml = upcomingIpos.length === 0
      ? '<p style="color: #71717a; font-size: 13px;">No scheduled issues in upcoming pipeline.</p>'
      : upcomingIpos.slice(0, 5).map((ipo) => `
        <div style="padding: 10px; border-bottom: 1px solid #f4f4f5;">
          <div style="font-weight: bold; font-size: 13px;">${ipo.company_name}</div>
          <div style="font-size: 11px; color: #71717a;">Opens: ${formatISTDate(ipo.open_date)} | Issue: ₹${ipo.issue_size_cr || 'TBA'} Cr</div>
        </div>
      `).join('');

    return {
      subject: `Live IPO Digest (${today}): ${openIpos.length} Issues Bidding Today`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #059669; margin: 0;">LiveIPOTracker</h2>
            <span style="font-size: 12px; color: #71717a;">Morning Brief (9 AM IST)</span>
          </div>

          <h3 style="color: #18181b; margin-top: 0;">Today's Live IPOs (${today})</h3>
          ${openListHtml}

          <h3 style="color: #18181b; margin-top: 24px;">Upcoming IPO Pipeline</h3>
          ${upcomingListHtml}

          <div style="margin-top: 28px; text-align: center;">
            <a href="${SITE_URL}" style="background-color: #18181b; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold;">
              Explore Full Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 28px 0 16px 0;" />
          <p style="font-size: 11px; color: #a1a1aa; line-height: 1.5;">
            Mandatory Notice: Not SEBI registered. Information is for educational purposes only and is not investment advice. Grey Market Premium (GMP) is strictly unofficial and never a forecast.
          </p>
        </div>
      `,
    };
  }
}

export const emailService = new EmailService();
