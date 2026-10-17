import type { WeeklySlot } from "./types";

export const TZ = "Europe/London";

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function londonParts(ms: number) {
  const p = Object.fromEntries(partsFormatter.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  };
}

function offsetMinutes(utcMs: number) {
  const p = londonParts(utcMs);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - utcMs) / 60000);
}

/** Convert a wall-clock time in London to a UTC Date (DST-aware). */
export function londonToUtc(year: number, month: number, day: number, hour: number, minute: number) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const first = offsetMinutes(guess);
  let ts = guess - first * 60000;
  const second = offsetMinutes(ts);
  if (second !== first) ts = guess - second * 60000;
  return new Date(ts);
}

export type Slot = { start: string; dateKey: string };

/**
 * Expand a mentor's weekly pattern into concrete upcoming slots.
 * Slots need at least `leadHours` notice and skip anything already booked.
 */
export function upcomingSlots(
  weekly: WeeklySlot[],
  booked: Set<string>,
  { days = 14, leadHours = 12, now = Date.now() }: { days?: number; leadHours?: number; now?: number } = {},
): Slot[] {
  const today = londonParts(now);
  const out: Slot[] = [];
  for (let i = 0; i <= days; i++) {
    const cal = new Date(Date.UTC(today.year, today.month - 1, today.day + i, 12));
    const weekday = cal.getUTCDay();
    for (const s of weekly) {
      if (s.day !== weekday) continue;
      const [hh, mm] = s.time.split(":").map(Number);
      const start = londonToUtc(cal.getUTCFullYear(), cal.getUTCMonth() + 1, cal.getUTCDate(), hh, mm);
      if (start.getTime() < now + leadHours * 3600_000) continue;
      const iso = start.toISOString();
      if (booked.has(iso)) continue;
      out.push({ start: iso, dateKey: dateKey(iso) });
    }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
export function dateKey(iso: string | number | Date) {
  return keyFmt.format(new Date(iso));
}

const timeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true });
export function fmtTime(iso: string | Date) {
  return timeFmt
    .format(new Date(iso))
    .replace(/[\s ]/g, "")
    .replace(":00", "")
    .toLowerCase();
}

const dayShortFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short" });
const dayNumFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric" });
const monthShortFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, month: "short" });
const longFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
const shortFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });

export function fmtWeekday(iso: string | Date) {
  return dayShortFmt.format(new Date(iso));
}
export function fmtDayNum(iso: string | Date) {
  return dayNumFmt.format(new Date(iso));
}
export function fmtMonth(iso: string | Date) {
  return monthShortFmt.format(new Date(iso));
}
export function fmtDateLong(iso: string | Date) {
  return longFmt.format(new Date(iso));
}
export function fmtDateShort(iso: string | Date) {
  return shortFmt.format(new Date(iso));
}

/** "Today", "Tomorrow", or "Thu 22 Oct" */
export function fmtRelativeDay(iso: string, now = Date.now()) {
  const k = dateKey(iso);
  if (k === dateKey(now)) return "Today";
  if (k === dateKey(now + 86400_000)) return "Tomorrow";
  return fmtDateShort(iso);
}

/** Compact "time ago" for message lists. */
export function fmtAgo(iso: string, now = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const d = Math.floor(hr / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d`;
  return fmtDateShort(iso);
}

export function greeting(now = Date.now()) {
  const h = londonParts(now).hour;
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "6:30pm" from "18:30" */
export function fmtClock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}
