"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listCandidates, listRegions } from "@/lib/admin-api";
import type {
  CandidateListItem,
  CandidateStatus,
  JobField,
  Region,
} from "@/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Loading,
  ErrorNote,
  EmptyState,
  PageHeader,
} from "@/components/admin/Feedback";
import { Card, Input, Select } from "@/components/ui";
import {
  FIELD_LABELS,
  regionLabel,
  buildCityOptions,
  CANDIDATE_STATUS_LABELS,
} from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export default function CandidatesListPage() {
  const [candidates, setCandidates] = useState<CandidateListItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [field, setField] = useState<JobField | "">("");
  const [region, setRegion] = useState<Region | "">("");
  const [status, setStatus] = useState<CandidateStatus | "">("");
  const [cityOptions, setCityOptions] = useState<string[]>(buildCityOptions());

  useEffect(() => {
    listCandidates()
      .then(setCandidates)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    listRegions()
      .then((r) => setCityOptions(buildCityOptions(r)))
      .catch(() => undefined);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      if (field && c.field !== field) return false;
      if (region && c.region !== region) return false;
      if (status && c.status !== status) return false;
      if (q) {
        const hay = `${c.fullName} ${c.phone} ${c.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [candidates, search, field, region, status]);

  return (
    <div>
      <PageHeader
        title="ניהול מועמדים"
        subtitle={`${candidates.length} מועמדים במערכת`}
      />

      <Card className="mb-6">
        <div className="grid md:grid-cols-4 gap-3">
          <Input
            placeholder="חיפוש לפי שם / טלפון / מייל"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={field}
            onChange={(e) => setField(e.target.value as JobField | "")}
          >
            <option value="">כל התחומים</option>
            {Object.entries(FIELD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region | "")}
          >
            <option value="">כל האזורים</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as CandidateStatus | "")}
          >
            <option value="">כל הסטטוסים</option>
            {Object.entries(CANDIDATE_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorNote message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState message="לא נמצאו מועמדים התואמים לסינון" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 text-ink-500">
              <tr className="text-start">
                <th className="px-4 py-3 text-start font-semibold">שם</th>
                <th className="px-4 py-3 text-start font-semibold">תחום</th>
                <th className="px-4 py-3 text-start font-semibold">אזור</th>
                <th className="px-4 py-3 text-start font-semibold">
                  הוגש למשרה
                </th>
                <th className="px-4 py-3 text-start font-semibold">סטטוס</th>
                <th className="px-4 py-3 text-start font-semibold">נכנס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-sand-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/candidates/${c.id}`}
                      className="font-semibold text-navy-600 hover:underline"
                    >
                      {c.fullName}
                    </Link>
                    <div className="text-xs text-ink-400">{c.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {FIELD_LABELS[c.field]}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {regionLabel(c.region)}
                  </td>
                  <td className="px-4 py-3">
                    {c.presentations.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-olive-700 bg-olive-50 rounded-full px-2.5 py-1">
                        {c.presentations[0].job?.title ?? "משרה"}
                        {c.presentations.length > 1 && (
                          <span className="text-ink-400">
                            +{c.presentations.length - 1}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-400">כללי</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={c.status}
                      label={CANDIDATE_STATUS_LABELS[c.status]}
                    />
                  </td>
                  <td className="px-4 py-3 text-ink-400 whitespace-nowrap">
                    {formatDate(c.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
