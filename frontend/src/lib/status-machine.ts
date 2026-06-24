// status-machine — מראה של מעברי הסטטוס בצד שרת (backend/common/status-machine).
// משמש את ה-UI להציג רק מעברים חוקיים. ה-backend אוכף שוב — זו רק נוחות.
import type { CandidateStatus, JobStatus, PlacementStatus } from "@/types";

export const CANDIDATE_TRANSITIONS: Record<CandidateStatus, CandidateStatus[]> =
  {
    new: ["in_progress", "not_suitable"],
    in_progress: ["presented", "not_suitable"],
    presented: ["hired", "in_progress", "not_suitable"],
    hired: [],
    not_suitable: ["in_progress"],
  };

export const JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  pending: ["active", "closed"], // אישור הצוות → active; דחייה → closed
  active: ["paused", "closed", "filled"],
  paused: ["active", "closed"],
  closed: [],
  filled: [],
};

export const PLACEMENT_TRANSITIONS: Record<PlacementStatus, PlacementStatus[]> =
  {
    pending: ["confirmed", "cancelled"],
    confirmed: ["guarantee"],
    guarantee: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };
