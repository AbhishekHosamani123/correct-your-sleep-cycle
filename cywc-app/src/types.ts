export type Alarm = {
  id: string;
  label: string;
  /** 0-23 */
  hour: number;
  /** 0-59 */
  minute: number;
  /** weekday indices 0=Sun .. 6=Sat; empty array = one-time (next day) */
  days: number[];
  enabled: boolean;
};

/** Sleep entries are keyed by the WAKE-morning date (YYYY-MM-DD local). */
export type SleepEntry = {
  /** planned bedtime in minutes 0..1439 (from the shift plan) */
  plannedBed?: number;
  /** what the user actually did (minutes 0..1439; may wrap past midnight) */
  actualBed?: number;
  /** when they woke (minutes 0..1439) */
  woke?: number;
};

export type Logs = Record<string, SleepEntry>;
