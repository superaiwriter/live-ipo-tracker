import fs from 'node:fs';
import path from 'node:path';

// Helper to get FMP_API_KEY without logging it
function getApiKey(): string {
  if (process.env.FMP_API_KEY) {
    return process.env.FMP_API_KEY.trim();
  }
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^FMP_API_KEY=(.+)$/m);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

interface FMPRecord {
  exchange?: string;
  country?: string;
  [key: string]: unknown;
}

async function checkWindow(label: string, from: string, to: string, apiKey: string) {
  console.log(`\n=== Window: ${label} (${from} to ${to}) ===`);
  const endpoint = `https://financialmodelingprep.com/stable/ipos-calendar?from=${from}&to=${to}&apikey=${apiKey}`;
  
  try {
    const res = await fetch(endpoint);
    console.log(`HTTP Status: ${res.status} ${res.statusText}`);
    
    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.log(`Failed to parse JSON response. Raw snippet: ${text.slice(0, 200)}`);
      return;
    }

    if (!res.ok) {
      console.log(`Error Response:`, JSON.stringify(data));
      return;
    }

    if (Array.isArray(data)) {
      console.log(`Number of records: ${data.length}`);
      if (data.length > 0) {
        const first = data[0] as FMPRecord;
        console.log(`Field names of first record:`, Object.keys(first));
        console.log(`Sample first record preview:`, JSON.stringify(first, null, 2));

        const exchanges = new Set<string>();
        const countries = new Set<string>();

        for (const item of data as FMPRecord[]) {
          if (item.exchange) exchanges.add(String(item.exchange));
          if (item.country) countries.add(String(item.country));
        }

        console.log(`Distinct exchanges found (${exchanges.size}):`, Array.from(exchanges));
        console.log(`Distinct countries found (${countries.size}):`, Array.from(countries));
      } else {
        console.log(`No records found for this date range.`);
      }
    } else {
      console.log(`Non-array response:`, JSON.stringify(data));
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`Fetch error: ${msg}`);
  }
}

async function run() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('Error: FMP_API_KEY is missing from environment and .env.local');
    process.exit(1);
  }

  // 1) 30-day window (e.g. 2024-01-01 to 2024-01-30)
  await checkWindow('30-day window', '2024-01-01', '2024-01-30', apiKey);

  // 2) 91-day window (e.g. 2024-01-01 to 2024-04-01: 91 days)
  await checkWindow('91-day window', '2024-01-01', '2024-04-01', apiKey);
}

run();
