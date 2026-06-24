// status-machine — כל מעבר סטטוס חוקי מוגדר כאן.
// אין לעדכן סטטוס ב-DB בלי לעבור דרך assert* המתאים.

import { BadRequestException } from '@nestjs/common';
import {
  CandidateStatus,
  CommissionStatus,
  JobStatus,
  PlacementStatus,
} from '@prisma/client';

// ----------------------------------------------------------------
// מועמד
// ----------------------------------------------------------------

const CANDIDATE_TRANSITIONS: Record<CandidateStatus, CandidateStatus[]> = {
  new: ['in_progress', 'not_suitable'],
  in_progress: ['presented', 'not_suitable'],
  presented: ['hired', 'in_progress', 'not_suitable'],
  hired: [], // סופי
  not_suitable: ['in_progress'], // אפשר להחזיר
};

export function canTransitionCandidate(
  from: CandidateStatus,
  to: CandidateStatus,
): boolean {
  return CANDIDATE_TRANSITIONS[from].includes(to);
}

export function assertCandidateTransition(
  from: CandidateStatus,
  to: CandidateStatus,
): void {
  if (!canTransitionCandidate(from, to)) {
    throw new BadRequestException(`מעבר סטטוס לא חוקי למועמד: ${from} → ${to}`);
  }
}

// ----------------------------------------------------------------
// משרה
// ----------------------------------------------------------------

const JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  active: ['paused', 'closed', 'filled'],
  paused: ['active', 'closed'],
  closed: [], // סופי
  filled: [], // סופי
};

export function canTransitionJob(from: JobStatus, to: JobStatus): boolean {
  return JOB_TRANSITIONS[from].includes(to);
}

export function assertJobTransition(from: JobStatus, to: JobStatus): void {
  if (!canTransitionJob(from, to)) {
    throw new BadRequestException(`מעבר סטטוס לא חוקי למשרה: ${from} → ${to}`);
  }
}

// ----------------------------------------------------------------
// גיוס (Placement)
// ----------------------------------------------------------------

const PLACEMENT_TRANSITIONS: Record<PlacementStatus, PlacementStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['guarantee'],
  guarantee: ['completed', 'cancelled'], // cancelled = החזר חלקי בתוך ערבות
  completed: [],
  cancelled: [],
};

export function canTransitionPlacement(
  from: PlacementStatus,
  to: PlacementStatus,
): boolean {
  return PLACEMENT_TRANSITIONS[from].includes(to);
}

export function assertPlacementTransition(
  from: PlacementStatus,
  to: PlacementStatus,
): void {
  if (!canTransitionPlacement(from, to)) {
    throw new BadRequestException(`מעבר סטטוס לא חוקי לגיוס: ${from} → ${to}`);
  }
}

// ----------------------------------------------------------------
// עמלה (Commission) — חוק ברזל: not_due → due → invoiced → paid.
// אסור לדלג ל-invoiced/paid לפני שהעמלה הפכה ל-due (תום הערבות).
// partial_refund — מצב סופי שמגיע מביטול גיוס בערבות (לא מהמסך הזה).
// ----------------------------------------------------------------

const COMMISSION_TRANSITIONS: Record<CommissionStatus, CommissionStatus[]> = {
  not_due: ['due', 'partial_refund'],
  due: ['invoiced', 'paid', 'partial_refund'],
  invoiced: ['paid', 'partial_refund'],
  paid: [], // סופי
  partial_refund: [], // סופי
};

export function canTransitionCommission(
  from: CommissionStatus,
  to: CommissionStatus,
): boolean {
  return from === to || COMMISSION_TRANSITIONS[from].includes(to);
}

export function assertCommissionTransition(
  from: CommissionStatus,
  to: CommissionStatus,
): void {
  if (!canTransitionCommission(from, to)) {
    throw new BadRequestException(
      `מעבר סטטוס עמלה לא חוקי: ${from} → ${to}`,
    );
  }
}
