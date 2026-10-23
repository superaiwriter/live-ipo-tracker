import fs from 'fs';
import path from 'path';

function getApiKey(): string {
  if (process.env.FINNHUB_API_KEY) {
    return process.env.FINNHUB_API_KEY.trim();
  }
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    const match = content.match(/^FINNHUB_API_KEY=(.+)$/m);
    if (match && match[1]) {
      return match[1].trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return '';
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function checkFinnhub() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('Error: FINNHUB_API_KEY not found in .env.local');
    process.exit(1);
  }

  const now = new Date();
  const fromDate = new Date(now);
  fromDate.setMonth(now.getMonth() - 3);

  const toDate = new Date(now);
  toDate.setMonth(now.getMonth() + 3);

  const fromStr = formatDate(fromDate);
  const toStr = formatDate(toDate);

  const safeUrl = `https://finnhub.io/api/v1/calendar/ipo?from=${fromStr}&to=${toStr}`;

  try {
    const res = await fetch(safeUrl, {
      method: 'GET',
      headers: {
        'X-Finnhub-Token': apiKey,
        'Accept': 'application/json',
      },
    });

    console.log(`HTTP Status: ${res.status}`);

    if (!res.ok) {
      const errText = await res.text();
      console.log(`Error Response Body: ${errText}`);
      return;
    }

    const data = await res.json();
    const records: Array<Record<string, unknown>> = Array.isArray(data?.ipoCalendar) ? data.ipoCalendar : [];

    console.log(`Number of records: ${records.length}`);

    if (records.length === 0) {
      console.log('No records found in this date range.');
      console.log(`Date range queried: ${fromStr} to ${toStr}`);
      return;
    }

    const firstRecord = records[0];
    console.log(`Field names of first record:`, Object.keys(firstRecord));

    const exchanges = Array.from(new Set(records.map(r => r.exchange).filter(Boolean)));
    console.log(`Distinct exchanges found:`, exchanges);

    const statuses = Array.from(new Set(records.map(r => r.status).filter(Boolean)));
    console.log(`Distinct statuses found:`, statuses);

    const dates = records
      .map(r => (typeof r.date === 'string' ? r.date : ''))
      .filter(Boolean)
      .sort();

    console.log(`Earliest date: ${dates[0] || 'N/A'}`);
    console.log(`Latest date: ${dates[dates.length - 1] || 'N/A'}`);

    console.log(`\nFirst 3 records:`);
    const sample = records.slice(0, 3).map(rec => {
      const sanitized: Record<string, unknown> = { ...rec };
      delete sanitized.token;
      delete sanitized.apiKey;
      return sanitized;
    });
    console.log(JSON.stringify(sample, null, 2));

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Request failed: ${msg}`);
  }
}

checkFinnhub();
