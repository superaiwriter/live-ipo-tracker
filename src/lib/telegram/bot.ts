import { IPOWithDetails } from '@/types/ipo';
import { SITE_URL } from '@/lib/seo';
import { formatISTDate } from '@/lib/dates';

export class TelegramBotService {
  private botToken = process.env.TELEGRAM_BOT_TOKEN;
  private chatId = process.env.TELEGRAM_CHAT_ID; // Channel username e.g. @liveipotracker or chat_id

  isConfigured(): boolean {
    return Boolean(this.botToken && this.chatId);
  }

  async broadcastIpoOpen(ipo: IPOWithDetails): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      console.log(`[TELEGRAM BROADCAST MOCK] New Open IPO: ${ipo.company_name} (${ipo.exchange})`);
      return { success: true };
    }

    const priceText =
      ipo.price_band_low && ipo.price_band_high
        ? `₹${ipo.price_band_low} – ₹${ipo.price_band_high}`
        : ipo.issue_price
        ? `₹${ipo.issue_price}`
        : 'TBA';

    const minInvestment =
      (ipo.price_band_high || ipo.issue_price) && ipo.lot_size
        ? `₹${((ipo.price_band_high || ipo.issue_price)! * ipo.lot_size).toLocaleString('en-IN')}`
        : 'TBA';

    const gmpText = ipo.latest_gmp
      ? `\n📈 <b>Unofficial GMP:</b> +₹${ipo.latest_gmp.gmp_value} <i>(Unofficial, not a forecast)</i>`
      : '';

    const text = `
🚀 <b>NEW IPO OPEN FOR BIDDING TODAY</b>

🏢 <b>${ipo.company_name}</b> (${ipo.symbol || ipo.exchange})
🏷️ <b>Segment:</b> ${ipo.segment === 'mainboard' ? 'Mainboard' : 'SME Platform'} (${ipo.exchange})
💰 <b>Price Band:</b> ${priceText}
📦 <b>Lot Size:</b> ${ipo.lot_size ? `${ipo.lot_size} shares` : 'TBA'} (Min Inv: ${minInvestment})
📊 <b>Issue Size:</b> ₹${ipo.issue_size_cr || 'TBA'} Cr
⏰ <b>Bidding Closes:</b> ${formatISTDate(ipo.close_date)} at 5:00 PM IST${gmpText}

🔗 <a href="${SITE_URL}/ipo/${ipo.slug}">View Live Telemetry on LiveIPOTracker</a>

⚠️ <i>Mandatory Notice: Not SEBI registered. Information is for educational purposes only and is not investment advice.</i>
    `.trim();

    try {
      const res = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.description || 'Telegram API failure' };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

export const telegramBot = new TelegramBotService();
