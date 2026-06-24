-- DAT-2 (חלקי) — אינדקסים לסינון מועמדים ב-CRM/דיוור לפי תחום/אזור/סטטוס.
-- בטוח לחלוטין: CREATE INDEX לא נכשל על נתונים קיימים.
-- (לא נוסף @unique על email — מייל מועמד הוא טקסט חופשי מטופס ההגשה, ושיתוף
--  מייל משפחתי נפוץ בקהל היעד; unique היה גורם לכשל בהגשה שנייה.)

CREATE INDEX "candidates_field_idx" ON "candidates"("field");
CREATE INDEX "candidates_region_idx" ON "candidates"("region");
CREATE INDEX "candidates_status_idx" ON "candidates"("status");
