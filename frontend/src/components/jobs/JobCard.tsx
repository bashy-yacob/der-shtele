import Link from "next/link";
import type { Icon } from "@/lib/icons";
import {
  Buildings,
  MapPin,
  Clock,
  ChartLineUp,
  Briefcase,
  ArrowLeft,
} from "@/lib/icons";
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
      {job.featured && (
        <span className="mb-2 inline-block w-fit rounded-full bg-olive-100 px-2 py-0.5 text-xs font-semibold text-olive-700">
          מקודם
        </span>
      )}
      <h3 className="font-display text-ink-900 text-xl font-bold pe-12">
        {job.title}
      </h3>
      <p className="flex items-center gap-1.5 text-sm text-ink-500 mt-1">
        <Buildings className="w-4 h-4 text-olive-500 shrink-0" />
        {companyLabel}
      </p>

      <p className="text-sm text-ink-700 mt-3 mb-5 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 text-xs mb-6">
        <Tag icon={Briefcase}>{FIELD_LABELS[job.field]}</Tag>
        <Tag icon={MapPin}>{regionLabel(job.region)}</Tag>
        <Tag icon={Clock}>{job.scope}</Tag>
        {job.experience && <Tag icon={ChartLineUp}>{job.experience}</Tag>}
      </div>

      <Link
        href={`/jobs/${job.id}`}
        className="mt-auto inline-flex items-center justify-center gap-2 bg-navy-600 hover:bg-navy-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors w-full text-center"
      >
        לפרטים ולהגשה
        <ArrowLeft className="w-[1.05rem] h-[1.05rem] shrink-0" weight="bold" />
      </Link>
    </div>
  );
}

function Tag({
  icon: Icon,
  children,
}: {
  icon: Icon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-olive-50 text-olive-700 border border-olive-100 px-2.5 py-1 rounded-md font-semibold">
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {children}
    </span>
  );
}
