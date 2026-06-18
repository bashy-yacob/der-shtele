import Link from "next/link";
import type { PublicJob } from "@/types";
import { FIELD_LABELS, regionLabel } from "@/lib/constants";
import { SaveJobButton } from "./SaveJobButton";

interface JobCardProps {
  job: PublicJob;
}

export function JobCard({ job }: JobCardProps) {
  // זהות מעסיק אנונימית לפי אזור (פרטי החברה נמסרים רק דרך הצוות)
  const companyLabel = `ארגון ב${regionLabel(job.region)}`;

  return (
    <div className="relative flex flex-col bg-white border border-sand-200 rounded-2xl shadow-soft p-6 hover:border-olive-300 transition-colors">
      <SaveJobButton
        jobId={job.id}
        className="absolute top-4 left-4 shadow-soft"
      />
      <h3 className="font-display text-ink-900 text-xl font-bold pe-12">
        {job.title}
      </h3>
      <p className="text-sm text-ink-500 mt-1">{companyLabel}</p>

      <p className="text-sm text-ink-700 mt-3 mb-5 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 text-xs mb-6">
        <Tag>{FIELD_LABELS[job.field]}</Tag>
        <Tag>{regionLabel(job.region)}</Tag>
        <Tag>{job.scope}</Tag>
        {job.experience && <Tag>{job.experience}</Tag>}
      </div>

      <Link
        href={`/jobs/${job.id}`}
        className="mt-auto inline-block bg-navy-600 hover:bg-navy-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors w-full text-center"
      >
        לפרטים ולהגשה ←
      </Link>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-olive-50 text-olive-700 border border-olive-100 px-2.5 py-1 rounded-md font-semibold">
      {children}
    </span>
  );
}
