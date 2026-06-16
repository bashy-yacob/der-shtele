import Link from 'next/link';
import type { PublicJob } from '@/types';
import { FIELD_LABELS, REGION_LABELS } from '@/lib/constants';

interface JobCardProps {
  job: PublicJob;
}

export function JobCard({ job }: JobCardProps) {
  // Anonymize company name based on region
  const companyLabel = `ארגון ב${REGION_LABELS[job.region]}`;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3 gap-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-primary-600">{job.title}</h3>
          <p className="text-sm text-neutral-600 mt-1">{companyLabel}</p>
        </div>
      </div>

      <p className="text-sm text-neutral-600 mb-4 line-clamp-2 leading-relaxed">{job.description}</p>

      <div className="flex flex-wrap gap-2 text-xs mb-6">
        <Tag>{FIELD_LABELS[job.field]}</Tag>
        <Tag>{REGION_LABELS[job.region]}</Tag>
        <Tag>{job.scope}</Tag>
      </div>

      <Link
        href={`/jobs/${job.id}`}
        className="inline-block bg-primary-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full text-center"
      >
        לפרטים ולהגשה ←
      </Link>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-md font-medium">
      {children}
    </span>
  );
}
