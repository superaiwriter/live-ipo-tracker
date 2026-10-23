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

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getMonthRange(year: number, month: number) {
  const from = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${pad(month)}-${pad(lastDay)}`;
  return { from, to };
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function probe() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('Error: FINNHUB_API_KEY not found in .env.local');
    process.exit(1);
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const todayStr = `${currentYear}-${pad(currentMonth)}-${pad(now.getDate())}`;

  console.log(`Probe running at system date: ${todayStr}`);

  // Build target months: 12 months in the past, current month, 3 months in the future
  // e.g. -12 to +3
  const months: { year: number; month: number; label: string }[] = [];
  for (let offset = -12; offset <= 3; offset++) {
    const d = new Date(currentYear, currentMonth - 1 + offset, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const label = `${y}-${pad(m)}`;
    months.push({ year: y, month: m, label });
  }

  const results: {
    month: string;
    from: string;
    to: string;
    httpStatus: number;
    count: number;
    expectedCount: number;
    futureExpectedCount: number;
    statuses: string[];
    error?: string;
  }[] = [];

  let totalFutureExpected = 0;
  const allFutureExpectedRecords: Record<string, unknown>[] = [];

  for (const item of months) {
    const { from, to } = getMonthRange(item.year, item.month);
    const safeUrl = `https://finnhub.io/api/v1/calendar/ipo?from=${from}&to=${to}`;

    try {
      const res = await fetch(safeUrl, {
        method: 'GET',
        headers: {
          'X-Finnhub-Token': apiKey,
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        results.push({
          month: item.label,
          from,
          to,
          httpStatus: res.status,
          count: 0,
          expectedCount: 0,
          futureExpectedCount: 0,
          statuses: [],
          error: errText.slice(0, 100),
        });
      } else {
        const json = await res.json();
        const records: Record<string, unknown>[] = Array.isArray(json?.ipoCalendar) ? json.ipoCalendar : [];
        const statuses = Array.from(new Set(records.map(r => String(r.status || '')).filter(Boolean)));
        const expected = records.filter(r => r.status === 'expected');
        const futureExpected = records.filter(r => r.status === 'expected' && typeof r.date === 'string' && r.date > todayStr);

        if (futureExpected.length > 0) {
          totalFutureExpected += futureExpected.length;
          allFutureExpectedRecords.push(...futureExpected);
        }

        results.push({
          month: item.label,
          from,
          to,
          httpStatus: res.status,
          count: records.length,
          expectedCount: expected.length,
          futureExpectedCount: futureExpected.length,
          statuses,
        });
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      results.push({
        month: item.label,
        from,
        to,
        httpStatus: 0,
        count: 0,
        expectedCount: 0,
        futureExpectedCount: 0,
        statuses: [],
        error: errMsg,
      });
    }

    // stay well under 60 req/min
    await sleep(250);
  }

  console.log('\n--- MONTHLY BREAKDOWN ---');
  console.table(
    results.map(r => ({
      Month: r.month,
      Range: `${r.from} to ${r.to}`,
      HTTP: r.httpStatus,
      Total: r.count,
      Expected: r.expectedCount,
      'Future Expected': r.futureExpectedCount,
      Statuses: r.statuses.join(', ') || (r.error ? `ERR: ${r.error}` : 'none'),
    }))
  );

  console.log(`\nTotal 'expected' records with date > ${todayStr}: ${totalFutureExpected}`);
  if (allFutureExpectedRecords.length > 0) {
    console.log('Sample future expected records:');
    console.log(JSON.stringify(allFutureExpectedRecords.slice(0, 5), null, 2));
  } else {
    console.log('No future expected records found across probed months.');
  }
}

probe();
