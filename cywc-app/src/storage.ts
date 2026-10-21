import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alarm, Logs } from './types';
import { fmtTime, nextOccurrence } from './engine';

const K_ALARMS = 'cywc.alarms.v1';
const K_LOGS = 'cywc.logs.v1';

const SEED: Alarm[] = [
  { id: 'seed-anchor', label: 'Wake anchor', hour: 6, minute: 30, days: [0, 1, 2, 3, 4, 5, 6], enabled: true },
];

export async function loadState(): Promise<{ alarms: Alarm[]; logs: Logs }> {
  const raw = await AsyncStorage.getItem(K_ALARMS);
  const rawLogs = await AsyncStorage.getItem(K_LOGS);
  return {
    alarms: raw ? (JSON.parse(raw) as Alarm[]) : SEED,
    logs: rawLogs ? (JSON.parse(rawLogs) as Logs) : {},
  };
}

export const saveAlarms = (alarms: Alarm[]) =>
  AsyncStorage.setItem(K_ALARMS, JSON.stringify(alarms));

export const saveLogs = (logs: Logs) => AsyncStorage.setItem(K_LOGS, JSON.stringify(logs));

/** Cancel everything, then schedule one notification per enabled alarm. */
export async function rescheduleNotifications(alarms: Alarm[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const a of alarms) {
    if (!a.enabled) continue;
    const when = nextOccurrence(a);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${fmtTime(a.hour, a.minute)} — Rise`,
        body: a.label || 'Anchor time. Get up, log your wake in the app.',
        sound: 'default',
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  }
}
