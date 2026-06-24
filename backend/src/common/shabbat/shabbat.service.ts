import { Injectable, Logger } from "@nestjs/common";
import {
  isShabbatOrHoliday as heuristicIsForbidden,
  nextAllowedSendTime as heuristicNext,
} from "./shabbat";

/** חלון אסור לשליחה — מכניסת שבת/חג (הדלקת נרות) ועד צאתם (הבדלה). */
interface ForbiddenWindow {
  start: number; // epoch ms — כניסת שבת/חג
  end: number; // epoch ms — צאת שבת/חג
}

interface HebcalItem {
  category: string;
  date: string;
}

/**
 * ShabbatService — זיהוי מדויק של שבת ויו"ט מול Hebcal REST API (סעיף 10 + 8.3).
 *
 * מביא את חלונות "הדלקת נרות → הבדלה" לירושלים (לוח א"י, יום טוב אחד), מאחד
 * רצפי חג+שבת לחלון אחד, ושומר אותם ב-cache בזיכרון עם רענון פעמיים ביום.
 * אם Hebcal לא זמין — נופלים להיוריסטיקת השעון השמרנית שב-`shabbat.ts`, כדי
 * שלעולם לא נשלח בטעות בשבת/חג גם כשה-API נופל.
 *
 * הכלל: מוטב לחסום בטעות (לדחות מייל) מאשר לשלוח בטעות בשבת.
 */
@Injectable()
export class ShabbatService {
  private readonly logger = new Logger(ShabbatService.name);

  private windows: ForbiddenWindow[] = [];
  private rangeStart = 0;
  private rangeEnd = 0;
  private fetchedAt = 0;
  private inflight: Promise<void> | null = null;

  private readonly TTL_MS = 12 * 60 * 60 * 1000; // רענון פעמיים ביום
  private readonly TIMEOUT_MS = 8_000;
  private readonly DAY_MS = 24 * 60 * 60 * 1000;

  /** האם כרגע שבת או יום טוב? (Hebcal, עם נפילה להיוריסטיקה) */
  async isForbidden(now: Date = new Date()): Promise<boolean> {
    await this.ensureFresh(now);
    const t = now.getTime();
    if (this.covers(t)) {
      return this.windows.some((w) => t >= w.start && t < w.end);
    }
    return heuristicIsForbidden(now);
  }

  /** הזמן הבא שמותר לשלוח בו — צאת השבת/החג הנוכחית, או עכשיו אם מותר. */
  async nextAllowedSendTime(now: Date = new Date()): Promise<Date> {
    await this.ensureFresh(now);
    const t = now.getTime();
    if (this.covers(t)) {
      const open = this.windows.find((w) => t >= w.start && t < w.end);
      return open ? new Date(open.end) : now;
    }
    return heuristicNext(now);
  }

  /** האם ה-cache מכסה את הרגע הזה (יש נתונים והוא בתוך הטווח שנטען)? */
  private covers(t: number): boolean {
    return this.windows.length > 0 && t >= this.rangeStart && t < this.rangeEnd;
  }

  private async ensureFresh(now: Date): Promise<void> {
    const stale =
      Date.now() - this.fetchedAt > this.TTL_MS ||
      now.getTime() >= this.rangeEnd - this.DAY_MS;
    if (!stale) return;
    if (this.inflight) return this.inflight;
    this.inflight = this.refresh(now).finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  private async refresh(now: Date): Promise<void> {
    const start = new Date(now.getTime() - 2 * this.DAY_MS);
    const end = new Date(now.getTime() + 60 * this.DAY_MS);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.TIMEOUT_MS);
    try {
      const res = await fetch(this.buildUrl(start, end), {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Hebcal HTTP ${res.status}`);
      const data = (await res.json()) as { items?: HebcalItem[] };
      this.windows = this.parseWindows(data.items ?? []);
      this.rangeStart = start.getTime();
      this.rangeEnd = end.getTime();
      this.fetchedAt = Date.now();
      this.logger.log(`Hebcal: נטענו ${this.windows.length} חלונות שבת/חג`);
    } catch (err) {
      // משאירים את ה-cache הקודם אם קיים; אחרת isForbidden ייפול להיוריסטיקה.
      this.fetchedAt = Date.now(); // לא לנסות שוב מיד — רק ברענון הבא
      this.logger.warn(
        `כשל בטעינת Hebcal — שימוש בהיוריסטיקת שעון. (${(err as Error).message})`,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  /** מאחד את אירועי ה-candles/havdalah לחלונות אסורים רציפים. */
  private parseWindows(items: HebcalItem[]): ForbiddenWindow[] {
    const sorted = items
      .filter((i) => i.category === "candles" || i.category === "havdalah")
      .map((i) => ({ category: i.category, t: new Date(i.date).getTime() }))
      .filter((i) => Number.isFinite(i.t))
      .sort((a, b) => a.t - b.t);

    const windows: ForbiddenWindow[] = [];
    let open: number | null = null;
    for (const i of sorted) {
      if (i.category === "candles") {
        // רצף חג+שבת (למשל יו"ט בערב שבת) → חלון אחד רציף
        if (open === null) open = i.t;
      } else if (open !== null) {
        windows.push({ start: open, end: i.t });
        open = null;
      }
    }
    return windows;
  }

  private buildUrl(start: Date, end: Date): string {
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const params = new URLSearchParams({
      v: "1",
      cfg: "json",
      maj: "on", // חגים מרכזיים (כולל ימים טובים)
      min: "off",
      mod: "off",
      nx: "off",
      ss: "off",
      mf: "off",
      s: "off",
      c: "on", // הדלקת נרות — כניסת שבת/חג
      M: "on", // הבדלה לפי צאת הכוכבים — צאת שבת/חג
      b: "40", // הדלקת נרות 40 דק' לפני השקיעה (שמרני)
      geo: "geoname",
      geonameid: "281184", // ירושלים
      i: "on", // לוח ארץ ישראל — יום טוב אחד
      start: fmt(start),
      end: fmt(end),
    });
    return `https://www.hebcal.com/hebcal?${params.toString()}`;
  }
}
