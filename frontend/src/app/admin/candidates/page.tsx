"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listCandidatesPaged, listRegions } from "@/lib/admin-api";
import type {
  CandidateListItem,
  CandidateStatus,
  JobField,
  Region,
} from "@/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminPager } from "@/components/admin/AdminPager";
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

const PAGE_SIZE = 15;

export default function CandidatesListPage() {
  const [items, setItems] = useState<CandidateListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [field, setField] = useState<JobField | "">("");
  const [region, setRegion] = useState<Region | "">("");
  const [status, setStatus] = useState<CandidateStatus | "">("");
  const [cityOptions, setCityOptions] = useState<string[]>(buildCityOptions());
  const [page, setPage] = useState(1);

  // debounce לחיפוש — לא שולחים בקשה על כל הקשה.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // איפוס לעמוד 1 כשהסינון משתנה.
  useEffect(() => setPage(1), [debouncedSearch, field, region, status]);

  // רשימת הערים לבחירה — פעם אחת.
  useEffect(() => {
    listRegions()
      .then((r) => setCityOptions(buildCityOptions(r)))
      .catch(() => undefined);
  }, []);

  // טעינת העמוד מהשרת בכל שינוי סינון/עמוד.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    listCandidatesPaged({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      field: field || undefined,
      region: region || undefined,
      status: status || undefined,
    })
      .then((res) => {
        if (!alive) return;
        setItems(res.items);
        setTotal(res.total);
        setError("");
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [page, debouncedSearch, field, region, status]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilter = !!(debouncedSearch || field || region || status);

  return (
    <div>
      <PageHeader
        title="ניהול מועמדים"
        subtitle={
          hasFilter
            ? `נמצאו ${total} מועמדים`
            : `${total} מועמדים במערכת`
        }
      />

      <Card className="mb-6">
        <div className="grid md:grid-cols-4 gap-3">
          <Input
            label="חיפוש"
            placeholder="שם / טלפון / מייל"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            label="תחום"
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
            label="אזור"
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
            label="סטטוס"
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

      {loading && items.length === 0 ? (
        <Loading />
      ) : error ? (
        <ErrorNote message={error} />
      ) : total === 0 ? (
        <EmptyState
          message={
            hasFilter
              ? "לא נמצאו מועמדים התואמים לסינון"
              : "עדיין אין מועמדים במערכת"
          }
        />
      ) : (
        <>
          <Card className="p-0 overflow-x-auto" aria-busy={loading}>
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
                  <th className="px-4 py-3 text-start font-semibold">נוצר</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {items.map((c) => (
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
                        <span className="text-xs text-ink-400">ללא שיוך</span>
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
          <AdminPager page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}
