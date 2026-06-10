// lib/statusMachine.ts
// כל מעבר סטטוס חוקי מוגדר כאן — לא לעדכן ישירות ב-DB
// בשלב ב: פונקציות אלה יקראו ל-db.candidate.update / db.job.update

import type {
  CandidateStatus,
  JobStatus,
  PlacementStatus,
} from '@/types';

// ----------------------------------------------------------------
// מועמד
// ----------------------------------------------------------------

const CANDIDATE_TRANSITIONS: Record<CandidateStatus, CandidateStatus[]> = {
  new:          ['in_progress', 'not_suitable'],
  in_progress:  ['presented', 'not_suitable'],
  presented:    ['hired', 'in_progress', 'not_suitable'],
  hired:        [],                                          // סופי
  not_suitable: ['in_progress'],                             // אפשר להחזיר
};

export function canTransitionCandidate(
  from: CandidateStatus,
  to: CandidateStatus
): boolean {
  return CANDIDATE_TRANSITIONS[from].includes(to);
}

/** זורק שגיאה אם המעבר לא חוקי */
export function assertCandidateTransition(
  from: CandidateStatus,
  to: CandidateStatus
): void {
  if (!canTransitionCandidate(from, to)) {
    throw new Error(
      `מעבר סטטוס לא חוקי למועמד: ${from} → ${to}`
    );
  }
}

// ----------------------------------------------------------------
// משרה
// ----------------------------------------------------------------

const JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  active:  ['paused', 'closed', 'filled'],
  paused:  ['active', 'closed'],
  closed:  [],   // סופי
  filled:  [],   // סופי
};

export function canTransitionJob(from: JobStatus, to: JobStatus): boolean {
  return JOB_TRANSITIONS[from].includes(to);
}

export function assertJobTransition(from: JobStatus, to: JobStatus): void {
  if (!canTransitionJob(from, to)) {
    throw new Error(`מעבר סטטוס לא חוקי למשרה: ${from} → ${to}`);
  }
}

// ----------------------------------------------------------------
// גיוס (Placement)
// ----------------------------------------------------------------

const PLACEMENT_TRANSITIONS: Record<PlacementStatus, PlacementStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['guarantee'],
  guarantee: ['completed', 'cancelled'],  // cancelled = החזר חלקי בתוך ערבות
  completed: [],
  cancelled: [],
};

export function canTransitionPlacement(
  from: PlacementStatus,
  to: PlacementStatus
): boolean {
  return PLACEMENT_TRANSITIONS[from].includes(to);
}

export function assertPlacementTransition(
  from: PlacementStatus,
  to: PlacementStatus
): void {
  if (!canTransitionPlacement(from, to)) {
    throw new Error(`מעבר סטטוס לא חוקי לגיוס: ${from} → ${to}`);
  }
}

// ----------------------------------------------------------------
// עזר — חישוב תאריך סיום ערבות
// ----------------------------------------------------------------

/** מחזיר את תאריך סיום ערבות: placedAt + 3 חודשים */
export function calcGuaranteeEnd(placedAt: Date): Date {
  const d = new Date(placedAt);
  d.setMonth(d.getMonth() + 3);
  return d;
}
