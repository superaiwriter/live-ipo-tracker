import { NextRequest, NextResponse } from 'next/server';
import { getIpoProvider } from '@/lib/providers';
import { IpoSegment, IpoStatus } from '@/types/ipo';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const segment = (searchParams.get('segment') as IpoSegment) || undefined;
  const status = (searchParams.get('status') as IpoStatus) || undefined;
  const search = searchParams.get('search') || undefined;
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

  try {
    const provider = getIpoProvider();
    const data = await provider.getIpos({
      segment,
      status,
      search,
      limit,
    });

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch IPOs.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
