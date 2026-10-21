import { Alarm, Logs } from './types';

export const T24 = 1440;
export const toMin = (h: number, m: number) => h * 60 + m;
/** normalize any minute value into 0..1439 */
export const mod = (x: number) => ((x % T24) + T24) % T24;
/** forward distance from a to b on the clock face (0..1439) */
export const diffForward = (a: number, b: number) => mod(b - a);

export const fmt = (min: number) => {
  const t = mod(min);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

export const fmtTime = (h: number, m: number) =>
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

export function sortAlarms(alarms: Alarm[]): Alarm[] {
  return [...alarms].sort((a, b) => toMin(a.hour, a.minute) - toMin(b.hour, b.minute));
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function dayLabel(days: number[]): string {
  if (!days.length) return 'One time';
  if (days.length === 7) return 'Every day';
  return [...days].sort().map((d) => DAY_NAMES[d]).join(', ');
}

/** Next datetime at which this alarm fires (strictly after `from`). */
export function nextOccurrence(a: Alarm, from: Date = new Date()): Date {
  for (let i = 0; i < 9; i++) {
    const d = new Date(from);
    d.setHours(a.hour, a.minute, 0, 0);
    d.setDate(d.getDate() + i);
    if (d <= from) continue;
    if (a.days.length === 0) return d; // one-time
    if (a.days.includes(d.getDay())) return d;
  }
  const fallback = new Date(from);
  fallback.setHours(a.hour, a.minute, 0, 0);
  return fallback;
}

/** The anchor = the earliest ENABLED alarm; the whole plan is built around it. */
export function anchorWake(alarms: Alarm[]) {
  const enabled = alarms.filter((a) => a.enabled);
  if (!enabled.length) return null;
  const best = enabled.reduce((cur, acc) =>
    toMin(cur.hour, cur.minute) < toMin(acc.hour, acc.minute) ? cur : acc,
  );
  return { alarm: best, min: toMin(best.hour, best.minute) };
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ---------------------------------------------------------------
   Bedtime-shift correction plan
   Wake time is ANCHORED (never moves). Bedtime walks earlier by
   `stepMinutes` per night until it reaches the ideal bedtime
   (= targetWake - 7,5h), then holds steady.
---------------------------------------------------------------- */

export type PlanNight = {
  dateKey: string;
  bedtimeMin: number;
  minutesFromNow: number;
  /** true when the bedtime has reached the clinically ideal spot */
  atIdeal: boolean;
};

/** Bedtimes 18:00+ count for tomorrow's key; 00:00–11:59 count for today. */
export function keyForBedtime(now = new Date()): string {
  const d = new Date(now);
  if (d.getHours() >= 18) d.setDate(d.getDate() + 1);
  return dateKey(d);
}

export function computePlan(opts: {
  targetWakeMin: number;
  currentBedMin: number;
  nights?: number;
  stepMinutes?: number;
  sleepHours?: number;
}): PlanNight[] {
  const { targetWakeMin, currentBedMin, nights = 9, stepMinutes = 15, sleepHours = 7.5 } = opts;
  const ideal = mod(targetWakeMin - Math.round(sleepHours * 60));
  const total = diffForward(currentBedMin, ideal);
  const out: PlanNight[] = [];
  for (let i = 0; i < nights; i++) {
    const shift = Math.min(total, stepMinutes * i);
    const bed = mod(currentBedMin - shift);
    const d = new Date();
    if (i < nights - 1 || true) d.setDate(d.getDate() + i);
    out.push({ dateKey: dateKey(d), bedtimeMin: bed, minutesFromNow: shift, atIdeal: shift >= total });
  }
  return out;
}

/** Consecutive woke-up days ending yesterday or today (today optional). */
export function streakDays(logs: Logs): number {
  let count = 0;
  let missedToday = false;
  for (let i = 0; i < 400; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const e = logs[dateKey(d)];
    if (e && e.woke != null) {
      count++;
    } else if (i === 0) {
      missedToday = true; // today may still be in progress
    } else {
      break;
    }
  }
  return count;
}
