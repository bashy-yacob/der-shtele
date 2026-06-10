import { NextResponse } from 'next/server';
import { MOCK_JOBS } from '@/lib/mockData';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const field  = searchParams.get('field');
  const region = searchParams.get('region');
  const gender = searchParams.get('gender');

  const jobs = MOCK_JOBS.filter((job) => {
    if (field  && job.field  !== field)  return false;
    if (region && job.region !== region) return false;
    if (gender && job.gender !== gender) return false;
    return job.status === undefined || (job as any).status === 'active';
  });

  return NextResponse.json({ success: true, data: jobs });
}
