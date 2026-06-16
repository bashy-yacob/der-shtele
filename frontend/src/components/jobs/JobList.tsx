import type { PublicJob } from "@/types";
import { JobCard } from "./JobCard";

interface JobListProps {
  jobs: PublicJob[];
  emptyMessage?: string;
}

/** רשת כרטיסי משרות. */
export function JobList({
  jobs,
  emptyMessage = "לא נמצאו משרות.",
}: JobListProps) {
  if (jobs.length === 0) {
    return <p className="text-center text-ink-500 py-12">{emptyMessage}</p>;
  }
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
