# סקירת דשבורד מנהלים — דער שטעלע

> סקירה מעמיקה של כל עמודי `/admin` — מלל, עיצוב, ונוחות משתמש.
> נוצר 2026-06-30. דרגות: 🔴 קריטי · 🟠 חשוב · 🟡 קטן · 💡 שדרוג.

עמודים שנסקרו: `layout`, `page` (לוח בקרה), `contacts`, `candidates` + `[id]`,
`jobs` + `new` + `[id]`, `employers`, `commissions` + `[id]/invoice`,
`reminders`, `mailing`, `testimonials`, `advertisements`, וכל הקומפוננטות המשותפות.

---

## A. בעיות חוצות-דשבורד — תיקון אחד משפר את כל העמודים

### A1. 🔴 כל ה-labels בטפסים מנותקים מהשדות (a11y שבור בכל הדשבורד)

`Input.tsx`, `Select.tsx`, `Textarea.tsx` מרנדרים `<label htmlFor={id}>` + `<input id={id}>`,
אבל **אף אחד מהקריאות בעמודים לא מעביר `id`** → `htmlFor="undefined"`. הלייבל מוצג ויזואלית
אבל לא מקושר: קורא-מסך לא מקריא אותו, ולחיצה על הלייבל לא ממקדת את השדה. משפיע על ~כל שדה בדשבורד.

- תיקון: ב-3 הקומפוננטות, `const inputId = id ?? useId();` ולהשתמש בו ל-`htmlFor` ול-`id`. תיקון יחיד מסדר הכל.
- קבצים: [Input.tsx:14-22](frontend/src/components/ui/Input.tsx#L14-L22), [Select.tsx:15-22](frontend/src/components/ui/Select.tsx#L15-L22), [Textarea.tsx:15-22](frontend/src/components/ui/Textarea.tsx#L15-L22)

### A2. 🔴 אין אישור על פעולות בלתי-הפיכות / כספיות

לחיצה בודדת מבצעת פעולה סופית בלי confirm:

- סימון מועמד "גויס" / "לא מתאים" — [candidates/[id]/page.tsx:161](frontend/src/app/admin/candidates/[id]/page.tsx#L161)
- סימון עמלה "שולם" / "חויב" — [commissions/page.tsx:295-312](frontend/src/app/admin/commissions/page.tsx#L295-L312)
- אישור מעסיק (פותח גישה לפורטל) — [employers/page.tsx:158](frontend/src/app/admin/employers/page.tsx#L158)
- דחיית/סגירת משרה — [jobs/[id]/page.tsx:260-291](frontend/src/app/admin/jobs/[id]/page.tsx#L260-L291)
- שליחת דיוור לכל הרשימה — [mailing/page.tsx:258](frontend/src/app/admin/mailing/page.tsx#L258)
- תיקון: confirm על כל פעולה סופית/כספית. "one-click" טוב לניווט, לא לפעולות בלתי-הפיכות.

### A3. 🟠 הודעת "נשמר בהצלחה" לא מוצגת אף פעם ביצירה

בטפסי יצירה, ההורה סוגר את הטופס (`setShowForm(false)`) מיד אחרי `setMsg(...)`, כך שה-`SuccessNote` לא מספיק להופיע. המשתמש לא מקבל אישור.

- מעסיקים: [employers/page.tsx:321-322](frontend/src/app/admin/employers/page.tsx#L321-L322)
- המלצות: [testimonials/page.tsx:268](frontend/src/app/admin/testimonials/page.tsx#L268)
- פרסומות: [advertisements/page.tsx:393](frontend/src/app/admin/advertisements/page.tsx#L393)
- משרה חדשה (מעסיק inline): [jobs/new/page.tsx:393-394](frontend/src/app/admin/jobs/new/page.tsx#L393-L394)
- תיקון: להרים הודעת הצלחה לרמת העמוד (אחרי שהטופס נסגר), כמו שעמוד העמלות עושה.

### A4. 🟠 אין חיפוש / סינון / מיון / pagination ברשימות הארוכות

כל הרשימות מרנדרות הכל בבת אחת, בלי דרך לסנן או למיין. הכי כואב: אי אפשר למצוא במהירות משרות `pending` שמחכות לאישור, או עמלות שניתן לגבות.

- משרות: [jobs/page.tsx:49-94](frontend/src/app/admin/jobs/page.tsx#L49-L94) (אין פילטר סטטוס/חיפוש)
- מועמדים: [candidates/page.tsx](frontend/src/app/admin/candidates/page.tsx) (יש חיפוש, אין מיון/pagination)
- פניות: [contacts/page.tsx:73](frontend/src/app/admin/contacts/page.tsx#L73) (אין חיפוש/מיון/pagination)
- עמלות: [commissions/page.tsx:147-338](frontend/src/app/admin/commissions/page.tsx#L147-L338) (אין פילטר/מיון)
- מעסיקים: [employers/page.tsx:92-95](frontend/src/app/admin/employers/page.tsx#L92-L95) (מאושרים+נדחים מעורבבים, אין חיפוש)
- יש כבר `Pagination.tsx` בריפו — אפשר לעשות בו שימוש חוזר.

### A5. 🟠 חיצי כיוון הפוכים ל-RTL + גליפים במקום אייקונים

חיצי `→`/`←` משובצים בתוך מחרוזות עברית — לא עקבי, ומתהפך לא נכון. כנ"ל גליפים `✓ ⏰ + —` שמשובצים ידנית במקום אייקוני המערכת.

- "→ חזרה ל..." (צריך להצביע ל-RTL נכון) — [jobs/new/page.tsx:198](frontend/src/app/admin/jobs/new/page.tsx#L198), [jobs/[id]/page.tsx:87](frontend/src/app/admin/jobs/[id]/page.tsx#L87), [candidates/[id]/page.tsx:75](frontend/src/app/admin/candidates/[id]/page.tsx#L75), [invoice/page.tsx:50-55](frontend/src/app/admin/commissions/[id]/invoice/page.tsx#L50-L55)
- תיקון: להשתמש ב-`Button` עם `icon`/`iconEnd` ואייקון Phosphor (`CaretRight`/`CheckCircle`) שמתהפך אוטומטית.

### A6. 🟠 StatCard בודד בתוך grid של 3 עמודות → שורה שבורה למראה

ב-עמלות וב-דיוור, `grid grid-cols-2 md:grid-cols-3` עוטף **כרטיס מדד יחיד**, ומשאיר 2 עמודות ריקות.

- [commissions/page.tsx:126-133](frontend/src/app/admin/commissions/page.tsx#L126-L133), [mailing/page.tsx:104-110](frontend/src/app/admin/mailing/page.tsx#L104-L110)
- תיקון: להוסיף מדדים שחסרים (למשל "לגבייה עכשיו", "סה״כ מנויים") או לצמצם את ה-grid.

### A7. 🟠 שתי מפות `FIELD_LABELS` שונות (דשבורד מול אתר ציבורי)

הדשבורד מציג `tech:"מחשבים"`, `admin:"אדמיניסטרציה"`; האתר הציבורי מציג `"מחשבים וטכנולוגיה"`, `"מנהלה ומשרד"`. הצוות בוחר תחום שמופיע אחרת לציבור.

- [labels.ts:15-24](frontend/src/lib/labels.ts#L15-L24) מול [constants.ts:4-13](frontend/src/lib/constants.ts#L4-L13)
- תיקון: מקור אמת אחד — לייצא מחדש את הציבורי, ולמחוק את הכפילות.

### A8. 🟠 תווית "בתקופת ערבות" כפולה — עמלה (`not_due`) וגיוס (`guarantee`)

שני הסטטוסים מתורגמים לאותו טקסט, ובטבלת העמלות הם מופיעים זה לצד זה בעמודות שונות → בלבול.

- [labels.ts:46](frontend/src/lib/labels.ts#L46) + [labels.ts:51](frontend/src/lib/labels.ts#L51)
- תיקון: לשנות את `not_due` ל-"טרם לגבייה" / "לא לגבייה עדיין".

### A9. 🟠 פילטר אזור — ערך = שם עיר, אבל הסינון לפי `region`

ה-dropdown נטען מ-`buildCityOptions()` (שמות ערים) אבל שולח/משווה מול `region`. אם ה-DB שומר קוד/slug ישן, הסינון מחזיר 0 בשקט.

- מועמדים: [candidates/page.tsx:53,92](frontend/src/app/admin/candidates/page.tsx#L53), דיוור: [mailing/page.tsx:127-139](frontend/src/app/admin/mailing/page.tsx#L127-L139)
- תיקון: לוודא ש-value של ה-option וה-`region` ב-DB באותו ייצוג.

### A10. 🟡 כפילות קוד של שער ההרשאות `staff/admin`

מוגדר מקומית ב-3+ מקומות ([GlobalReminderAlert.tsx:7](frontend/src/components/admin/GlobalReminderAlert.tsx#L7), [AdminHeaderLink.tsx:9](frontend/src/components/layout/AdminHeaderLink.tsx#L9), [layout.tsx:43](frontend/src/app/admin/layout.tsx#L43)). לחלץ `isStaff(user)`.

---

## B. ממצאים לפי עמוד

### B0. Layout + לוח בקרה ראשי

- 🟡 ניווט מובייל צפוף — [layout.tsx:92](frontend/src/app/admin/layout.tsx#L92) `flex-wrap` עם 10 פריטים + התנתקות נשבר לשורות עקומות במובייל. לשקול סרגל גלילה אופקי.
- 🟡 מצב טעינה לא עקבי — [layout.tsx:67](frontend/src/app/admin/layout.tsx#L67) "טוען..." טקסט פשוט במקום קומפוננטת `Loading` המשותפת.
- 🟡 a11y — אין `aria-label` ל-`nav` ואין `aria-current` על הקישור הפעיל.
- 🟡 פלורליזציה — [page.tsx:173](frontend/src/app/admin/page.tsx#L173) "{N} מועמדים הוצגו" יציג "1 מועמדים הוצגו". לטפל ביחיד.
- 🟡 שימוש semantic שגוי — [page.tsx:213](frontend/src/app/admin/page.tsx#L213) `StatusBadge status="cancelled"` (אדום) כדי לסמן "עבר זמנו" — hack ויזואלי.
- 💡 אימוג'י לא עקבי — [page.tsx:111](frontend/src/app/admin/page.tsx#L111) 🎉 ב-empty state אחד בלבד.

### B1. פניות (`contacts`)

- 🔴 אין כפתור "פתח קו״ח" למרות שמוצג תג "צורפו קו״ח" — [contacts/page.tsx:176](frontend/src/app/admin/contacts/page.tsx#L176). מבוי סתום.
- 🟠 שגיאת toggle מוחקת את כל הרשימה — [contacts/page.tsx:147-155](frontend/src/app/admin/contacts/page.tsx#L147-L155) ה-ternary של `error` מחליף את כל העמוד. להציג שגיאה inline.
- 🟠 אין חיפוש חופשי (בניגוד לעמוד מועמדים) — לא עקבי.
- 🟡 `<button>` בתוך `<Link>` — [contacts/page.tsx:235](frontend/src/app/admin/contacts/page.tsx#L235) HTML לא תקין.
- 🟡 `opacity-70` על פניות שטופלו — [contacts/page.tsx:160](frontend/src/app/admin/contacts/page.tsx#L160) מוריד ניגודיות מתחת ל-AA.
- 🟡 "סמן כלא טופל" מסורבל — לשנות ל-"החזר לטיפול".
- 🟡 שני pills באותה משפחת olive בגוונים שונים (`olive-50` vs `olive-100`).

### B2. מועמדים — רשימה (`candidates`)

- 🟠 כותרת מציגה ספירה לא-מסוננת — [candidates/page.tsx:67](frontend/src/app/admin/candidates/page.tsx#L67). לשנות ל-"מציג X מתוך Y".
- 🟠 פילטר אזור — ראה A9.
- 🟡 כותרת עמודה "נכנס" עמומה — [candidates/page.tsx:131](frontend/src/app/admin/candidates/page.tsx#L131). לשנות ל-"נוצר".
- 🟡 "כללי" בעמודת "הוגש למשרה" מבלבל — [candidates/page.tsx:163](frontend/src/app/admin/candidates/page.tsx#L163). לשנות ל-"ללא שיוך" / "—".
- 🟡 אין הבחנה בין empty אמיתי ל-no-results — [candidates/page.tsx:118](frontend/src/app/admin/candidates/page.tsx#L118).
- 🟡 השורה כולה לא לחיצה — [candidates/page.tsx:136](frontend/src/app/admin/candidates/page.tsx#L136) (רק השם).
- 🟡 טבלה 6 עמודות ב-`overflow-x-auto` במובייל — לשקול layout כרטיסים.

### B3. כרטיס מועמד (`candidates/[id]`)

- 🔴 אין confirm על מעברים סופיים (`hired`/`not_suitable`) — A2.
- 🟠 `notes` לא מסונכרן אחרי refetch — [candidates/[id]/page.tsx:151](frontend/src/app/admin/candidates/[id]/page.tsx#L151). נציג שני יכול לדרוס. להוסיף `useEffect([c.notes])`.
- 🟠 פתיחת קו״ח חסומה ע"י popup-blocker — [candidates/[id]/page.tsx:370-381](frontend/src/app/admin/candidates/[id]/page.tsx#L370-L381) `window.open` אחרי `await`. לפתוח tab סינכרוני ואז להזריק URL.
- 🟠 תאריך "שיחה חוזרת" מאפשר עבר — [candidates/[id]/page.tsx:323-328](frontend/src/app/admin/candidates/[id]/page.tsx#L323-L328). להוסיף `min`.
- 🟡 `<select>` גולמי ב-HireForm במקום `Select` המשותף — [candidates/[id]/page.tsx:539](frontend/src/app/admin/candidates/[id]/page.tsx#L539).
- 🟡 דקדוק כפתורים מעורב — חלק imperative ("קח לטיפול") חלק gerund ("שמירת הערות"). לאחד.
- 💡 אין עריכה/מחיקה של שיחה שתועדה — [candidates/[id]/page.tsx:338-359](frontend/src/app/admin/candidates/[id]/page.tsx#L338-L359).
- 💡 גיל מחושב לפי שנה בלבד (off-by-one) — [candidates/[id]/page.tsx:393](frontend/src/app/admin/candidates/[id]/page.tsx#L393).

### B4. משרות — רשימה (`jobs`)

- 🟠 אין פילטר/חיפוש (אי אפשר למצוא `pending`) — A4.
- 🟠 דקדוק יחיד — [jobs/page.tsx:34](frontend/src/app/admin/jobs/page.tsx#L34) "1 משרות". לטפל ביחיד.
- 🟡 fallback "—" למעסיק חסר — [jobs/page.tsx:73](frontend/src/app/admin/jobs/page.tsx#L73). להציג "מעסיק חסר".
- 🟡 כותרת "נפתחה" מטעה למשרת `pending` — [jobs/page.tsx:58](frontend/src/app/admin/jobs/page.tsx#L58).
- 💡 שורה כולה לא לחיצה / overflow מובייל.

### B5. משרה חדשה (`jobs/new`)

- 🔴 סיכון ליצירת משרה כפולה — [jobs/new/page.tsx:147-184](frontend/src/app/admin/jobs/new/page.tsx#L147-L184). אם `createJob` הצליח אבל `updateJob(paused)` נכשל → שליחה חוזרת יוצרת משרה שנייה. לעקוב אחרי id שנוצר ולנסות שוב רק את ה-patch.
- 🟠 ולידציה מגובבת להודעה אחת — [jobs/new/page.tsx:147-160](frontend/src/app/admin/jobs/new/page.tsx#L147-L160). הקומפוננטות תומכות ב-`error` per-field, לא בשימוש. לעבור ל-Zod + per-field.
- 🟡 סיכון פרטיות — [jobs/new/page.tsx:106-108](frontend/src/app/admin/jobs/new/page.tsx#L106-L108) prefill מהפנייה ממלא גם תיאור **ציבורי** וגם פנימי. לציבורי לתת ריק (לאלץ אנונימיזציה) או באנר אזהרה.
- 🟡 `*` שדה חובה ללא מקרא + הינטים ארוכים בתוך הלייבל. להוסיף מקרא אחד ולהעביר "(גלוי באתר)" ל-helper.
- 🟡 צ'קבוקס "פרסם מיד / אחרת טיוטה מושהית" מבלבל — לפצל ל-label + helper, ולהשתמש ב-"מושהית" עקבי (לא "טיוטה").
- 💡 לא `<form>` — אין Enter-to-submit / ולידציה native.

### B6. כרטיס משרה (`jobs/[id]`)

- 🔴 נתיב דחייה מתויג "סגורה" בלי confirm — [jobs/[id]/page.tsx:260-291](frontend/src/app/admin/jobs/[id]/page.tsx#L260-L291). למשרת `pending`, "סגורה" = דחייה. לתייג "דחה משרה" (אדום) + confirm.
- 🟠 "לחצו" לשון רבים — [jobs/[id]/page.tsx:262](frontend/src/app/admin/jobs/[id]/page.tsx#L262). לשנות ל-"לחץ" (לשון זכר יחיד).
- 🟠 `<select>` כפעולה לסטטוס מועמד — [jobs/[id]/page.tsx:526-542](frontend/src/app/admin/jobs/[id]/page.tsx#L526-L542). onChange מבצע מיד, כולל `hired` הסופי. להחליף בכפתורים מפורשים.
- 🟠 בורר מועמדים בלי חיפוש — [jobs/[id]/page.tsx:443-500](frontend/src/app/admin/jobs/[id]/page.tsx#L443-L500). טוען כל המועמדים ל-`<select>` אחד. להחליף ב-combobox מסונן לפי תחום המשרה.
- 🟠 type mismatch — [jobs/[id]/page.tsx:438](frontend/src/app/admin/jobs/[id]/page.tsx#L438) `Candidate[]` אבל ה-API מחזיר `CandidateListItem[]`.
- 🟠 "פרסם באתר" למשרת `paused` מטעה — [jobs/[id]/page.tsx:272-276](frontend/src/app/admin/jobs/[id]/page.tsx#L272-L276). למשרה שכבר פורסמה: "החזר לאתר".
- 🟠 אין dirty-guard בעריכה + עריכת תיאור ציבורי דוחפת ישר ל-live — [jobs/[id]/page.tsx:105-231](frontend/src/app/admin/jobs/[id]/page.tsx#L105-L231).
- 🟡 פרטי מעסיק ללא `tel:`/`mailto:` — [jobs/[id]/page.tsx:408-429](frontend/src/app/admin/jobs/[id]/page.tsx#L408-L429).
- 🟡 "סימון תשלום כשולם" מסורבל → "סמן כשולם" — [jobs/[id]/page.tsx:385](frontend/src/app/admin/jobs/[id]/page.tsx#L385).
- 🟡 תאריך featured עלול לזוז ב-timezone — [jobs/[id]/page.tsx:306-327](frontend/src/app/admin/jobs/[id]/page.tsx#L306-L327).
- 💡 אין success ב-StatusCard (הפעולה הכי חשובה) / אין הסרת presentation.

### B7. מעסיקים (`employers`)

- 🔴 אישור ללא confirm + דחייה דרך `window.prompt` — [employers/page.tsx:158-182](frontend/src/app/admin/employers/page.tsx#L158-L182). להחליף את ה-prompt ב-Textarea inline.
- 🟠 `busy` לא מתאפס בנתיב הצלחה — [employers/page.tsx:158-182](frontend/src/app/admin/employers/page.tsx#L158-L182). לעבור ל-`try/finally`.
- 🟠 "מסרו" לשון רבים + נתיב גולמי `/portal/login` — [employers/page.tsx:242](frontend/src/app/admin/employers/page.tsx#L242). לשנות ל-"מסור" + קישור אמיתי.
- 🟠 אין משוב הצלחה אחרי אישור/דחייה — A3.
- 🟡 סיסמת פורטל ב-plaintext (אולי בכוונה) — [employers/page.tsx:261-265](frontend/src/app/admin/employers/page.tsx#L261-L265). אם בכוונה, להוסיף הינט.
- 🟡 ✓ גליפי במקום `SuccessNote` — [employers/page.tsx:240-244](frontend/src/app/admin/employers/page.tsx#L240-L244).
- 🟡 שמות חברה ארוכים גולשים — [employers/page.tsx:97-104](frontend/src/app/admin/employers/page.tsx#L97-L104). `min-w-0` + `truncate`.
- 💡 טלפון/מייל ללא click-to-call.

### B8. עמלות (`commissions`)

- 🔴 אין confirm על "שולם"/"חויב" — A2.
- 🟠 "סמן כשולם" מוצג גם ב-`due` ומאפשר דילוג על `invoiced` — [commissions/page.tsx:304-312](frontend/src/app/admin/commissions/page.tsx#L304-L312). להציג רק כש-`status==="invoiced"`.
- 🟠 "חויב" (כפתור) ≠ "חשבונית נשלחה" (תווית) — [commissions/page.tsx:302](frontend/src/app/admin/commissions/page.tsx#L302) מול [labels.ts:53](frontend/src/lib/labels.ts#L53). לאחד מונח.
- 🟠 אין פילטר/מיון — A4. שורות `collectible` נקברות בין ששולמו.
- 🟡 עריכת סכום אפשרית גם אחרי `paid`/`invoiced` — [commissions/page.tsx:231-238](frontend/src/app/admin/commissions/page.tsx#L231-L238). להסתיר.
- 🟡 `min={0}` בעוד 0 לא חוקי — [commissions/page.tsx:199-205](frontend/src/app/admin/commissions/page.tsx#L199-L205). `min={1}` + שגיאה inline.
- 🟡 ספירה לאחור שלילית — [commissions/page.tsx:277](frontend/src/app/admin/commissions/page.tsx#L277) "עוד -3 ימים". guard ל-`days<=0`.
- 🟡 כפתור "חשבונית" מופיע גם בשורות `not_due` — [commissions/page.tsx:290-294](frontend/src/app/admin/commissions/page.tsx#L290-L294).
- 🟡 footer כפול ל-subtitle — [commissions/page.tsx:340-343](frontend/src/app/admin/commissions/page.tsx#L340-L343).
- 💡 סוגריים ריקים בתזכורת כשאין סכום — [commissions/page.tsx:106](frontend/src/app/admin/commissions/page.tsx#L106).

### B9. חשבונית (`commissions/[id]/invoice`)

- 🔴 מע״מ קבוע 17% — המע״מ בישראל 18% מ-1.1.2025 — [invoice/page.tsx:32,102](frontend/src/app/admin/commissions/[id]/invoice/page.tsx#L32). לחלץ קבוע `VAT_RATE` ולתייג דינמית.
- 🟠 אין `@media print` — `window.print()` ידפיס את ה-sidebar והניווט — [invoice/page.tsx:56](frontend/src/app/admin/commissions/[id]/invoice/page.tsx#L56). להוסיף print stylesheet שמסתיר את ה-shell ומאפס `@page margin`.
- 🟠 חשבונית מתרנדרת גם ל-`not_due` — [invoice/page.tsx:29-45](frontend/src/app/admin/commissions/[id]/invoice/page.tsx#L29-L45). מסמך "חשבון עמלה" עם סטטוס "בתקופת ערבות" — סותר את חוק העסק. להציג אזהרה ולחסום הדפסה.
- 🟠 בלוק מספר/תאריך החשבונית `text-start` במקום `text-end` — [invoice/page.tsx:65](frontend/src/app/admin/commissions/[id]/invoice/page.tsx#L65). מתנגש עם המותג.
- 🟡 עמודת הסכומים לא מיושרת — [invoice/page.tsx:82-107](frontend/src/app/admin/commissions/[id]/invoice/page.tsx#L82-L107). מע״מ/סה״כ לא מתיישרים אנכית.
- 🟡 "חשבון עמלה" / "חשבונית" / "אינו חשבונית מס" — שלושה מונחים. לאחד.
- 🟡 תאריך ללא תווית "תאריך:" — [invoice/page.tsx:67-68](frontend/src/app/admin/commissions/[id]/invoice/page.tsx#L67-L68).

### B10. תזכורות (`reminders`)

- 🔴 אין מחיקה כלל — [reminders/page.tsx](frontend/src/app/admin/reminders/page.tsx). תזכורת שגויה היא לצמיתות (רק "סמן כטופל"). להוסיף מחיקה + confirm.
- 🟠 שגיאת עריכת-שורה מוצגת בראש העמוד — [reminders/page.tsx:39-43](frontend/src/app/admin/reminders/page.tsx#L39-L43). להציג בתוך ה-Card של השורה.
- 🟠 הודעת ולידציה "ותאריך" אבל השדה "מועד" — [reminders/page.tsx:41](frontend/src/app/admin/reminders/page.tsx#L41). לאחד ל-"ומועד".
- 🟡 email נחשף בשורת ה-audit כש-fullName ריק — [reminders/page.tsx:50,224](frontend/src/app/admin/reminders/page.tsx#L50).
- 🟡 אין `min-w-0`/`truncate` להודעות ארוכות — [reminders/page.tsx:216](frontend/src/app/admin/reminders/page.tsx#L216).
- 💡 empty state חיוור — אפשר "אין תזכורות פתוחות — הכול מטופל".

### B11. רשימת תפוצה (`mailing`)

- 🔴 שליחה לכל הרשימה בלי confirm/preview — A2. הפעולה הכי בלתי-הפיכה בדשבורד.
- 🔴 שבת/יו"ט רק טקסט, ללא אכיפה בצד-לקוח — [mailing/page.tsx:241-244](frontend/src/app/admin/mailing/page.tsx#L241-L244). יש כבר Hebcal — להוסיף אינדיקטור חי + השבתת כפתור.
- 🟠 שלושת ה-Selects ללא `label` — [mailing/page.tsx:114-154](frontend/src/app/admin/mailing/page.tsx#L114-L154).
- 🟠 פילטר אזור — A9.
- 🟡 הסבר פער "נשלח X מתוך Y" — [mailing/page.tsx:228](frontend/src/app/admin/mailing/page.tsx#L228).
- 🟡 ייצוא CSV — שם קובץ אנגלי גנרי, ללא toast, ויש לוודא gating על הסכמה — [mailing/page.tsx:63-86](frontend/src/app/admin/mailing/page.tsx#L63-L86).
- 🟡 אין הערה על קישור הסרה (חוק ספאם) — [mailing/page.tsx:250-255](frontend/src/app/admin/mailing/page.tsx#L250-L255).
- 🟡 כפתור שליחה לא מושבת כשנושא/גוף ריקים — [mailing/page.tsx:258-260](frontend/src/app/admin/mailing/page.tsx#L258-L260).
- 💡 הטבלה ללא עמודת "אזור" למרות שמסננים לפיה.

### B12. המלצות (`testimonials`)

- 🟠 הודעת הצלחה ביצירה לא מוצגת — A3.
- 🟠 create עושה `reload()` (הבהוב Loading) בעוד edit אופטימי — [testimonials/page.tsx:113-149](frontend/src/app/admin/testimonials/page.tsx#L113-L149). לאחד.
- 🟡 שדה `order` ללא וליד' — "" הופך ל-0 ומתנגש — [testimonials/page.tsx:266](frontend/src/app/admin/testimonials/page.tsx#L266).
- 🟡 `mt-6` שביר ליישור צ'קבוקס — [testimonials/page.tsx:307](frontend/src/app/admin/testimonials/page.tsx#L307).
- 💡 `window.confirm` למחיקה — תקין אך לא מעוצב.
- ✅ "מפורסמת"/"מוסתרת" — תקין (תואם "המלצה" נקבה, לא הפרת לשון-זכר).

### B13. פרסומות (`advertisements`)

- 🔴 "ללא תמונות אנשים" — הכלל המחמיר ביותר — רק טקסט, ללא אכיפה — [advertisements/page.tsx:453-466](frontend/src/app/admin/advertisements/page.tsx#L453-L466). להוסיף צ'קבוק אישור חובה לפני הפעלה עם תמונה.
- 🟠 "הוסיפו" לשון רבים — [advertisements/page.tsx:200](frontend/src/app/admin/advertisements/page.tsx#L200). לשנות ל-"הוסף".
- 🟠 שער prepaid לא משתקף ב-UI — [advertisements/page.tsx:280-298](frontend/src/app/admin/advertisements/page.tsx#L280-L298). אפשר "הפעלה" של מודעה שלא שולמה. להשבית עד `paid`.
- 🟠 ערך placement `footer` יתום — [advertisements/page.tsx:25-34](frontend/src/app/admin/advertisements/page.tsx#L25-L34). מודעה קיימת עם `footer` תשנה placement בעריכה.
- 🟠 הודעת הצלחה ביצירה לא מוצגת — A3.
- 🟡 bidi — טלפון/תאריכים/₪ ללא `<bdi>` — [advertisements/page.tsx:235-247](frontend/src/app/admin/advertisements/page.tsx#L235-L247).
- 🟡 טקסט option מפורט מדי ("קבוע בצד שמאל") — [advertisements/page.tsx:32](frontend/src/app/admin/advertisements/page.tsx#L32).

### B14. קומפוננטות משותפות

- 🟠 `DueRemindersBanner.markDone` בולע שגיאות בשקט — [DueRemindersBanner.tsx:62-72](frontend/src/components/admin/DueRemindersBanner.tsx#L62-L72). לחיצה על "בוצע" בכשל = no-op שקט.
- 🟠 `AdminHeaderLink` מוסתר לגמרי במובייל ללא חלופה — [AdminHeaderLink.tsx:13](frontend/src/components/layout/AdminHeaderLink.tsx#L13). לוודא כניסה דרך תפריט מובייל.
- 🟡 מונחים שונים לאותו דבר: "בוצע" / "טופל" / "שטופלו" — [DueRemindersBanner.tsx:139](frontend/src/components/admin/DueRemindersBanner.tsx#L139). לאחד.
- 🟡 כפתור ממוזער בלי `dir="rtl"` — [DueRemindersBanner.tsx:80](frontend/src/components/admin/DueRemindersBanner.tsx#L80).
- 🟡 `PlacementTimeline` — לוודא עיגול `daysUntil` (ceil/floor) שלא יכריז על סיום ערבות יום מוקדם — קריטי עסקית — [PlacementTimeline.tsx:33-38](frontend/src/components/admin/PlacementTimeline.tsx#L33-L38).
- 🟡 גליפי `✓ ⏰` במקום אייקונים — [PlacementTimeline.tsx:54-60](frontend/src/components/admin/PlacementTimeline.tsx#L54-L60).

---

## C. תיקוני מלל — לשון זכר יחיד (חובה לפי כללי הפרויקט)

| מיקום                                                                              | כעת    | לתקן ל- |
| ---------------------------------------------------------------------------------- | ------ | ------- |
| [jobs/[id]/page.tsx:262](frontend/src/app/admin/jobs/[id]/page.tsx#L262)           | לחצו   | לחץ     |
| [employers/page.tsx:242](frontend/src/app/admin/employers/page.tsx#L242)           | מסרו   | מסור    |
| [advertisements/page.tsx:200](frontend/src/app/admin/advertisements/page.tsx#L200) | הוסיפו | הוסף    |

✅ לא נמצאו ניסוחים כפולי-מגדר (מועמד/ת וכו') באף עמוד. "פניות ממתינות", "מפורסמת/מוסתרת" — תקינים (התאמת תואר לשם נקבה, לא פנייה למשתמש).

---

## D. סדר עדיפויות מומלץ

1. 🔴 `useId()` ב-Input/Select/Textarea (A1) — מתקן a11y בכל הדשבורד בתיקון יחיד.
2. 🔴 confirm לכל הפעולות הבלתי-הפיכות (A2) + שליחת דיוור + אכיפת שבת.
3. 🔴 מע״מ 18% (B9) + חסימת חשבונית ל-`not_due`.
4. 🔴 סיכון משרה כפולה (B5) + נתיב דחייה מתויג שגוי (B6).
5. 🔴 אכיפת "ללא תמונות אנשים" בפרסומות (B13).
6. 🟠 3 תיקוני לשון-זכר (C) — מהיר.
7. 🟠 תווית `not_due` כפולה (A8) + כפילות `FIELD_LABELS` (A7).
8. 🟠 הודעות הצלחה ביצירה (A3) + פילטר/חיפוש ברשימות (A4).
9. 🟠 print stylesheet לחשבונית (B9) + פתיחת קו״ח חסומה (B3).
