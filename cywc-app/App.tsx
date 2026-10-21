import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { C, GAP, PAD, cardStyle } from './src/theme';
import { Alarm, Logs } from './src/types';
import { loadState, rescheduleNotifications, saveAlarms, saveLogs } from './src/storage';
import { toMin, mod, keyForBedtime, dateKey, anchorWake, computePlan, fmt } from './src/engine';
import HomeScreen from './src/screens/HomeScreen';
import PlanScreen from './src/screens/PlanScreen';
import AlarmsScreen from './src/screens/AlarmsScreen';

type Tab = 'home' | 'plan' | 'alarms';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [ready, setReady] = useState(false);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [logs, setLogs] = useState<Logs>({});

  useEffect(() => {
    (async () => {
      const { alarms: a, logs: l } = await loadState();
      setAlarms(a);
      setLogs(l);
      setReady(true);
      const perm = await Notifications.getPermissionsAsync();
      if (!perm.granted) await Notifications.requestPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    void saveAlarms(alarms);
    rescheduleNotifications(alarms).catch((e) =>
      console.warn('[alarms] scheduling skipped:', e),
    );
  }, [alarms, ready]);

  useEffect(() => {
    if (!ready) return;
    void saveLogs(logs);
  }, [logs, ready]);

  const persistAlarms = useCallback((next: Alarm[]) => setAlarms(next), []);

  /** “I’m going to bed now.” Bedtimes ≥18:00 belong to tomorrow’s key. */
  const logBedNow = useCallback(() => {
    const now = new Date();
    const key = keyForBedtime(now);
    setLogs((prev) => ({
      ...prev,
      [key]: { ...prev[key], actualBed: mod(toMin(now.getHours(), now.getMinutes())) },
    }));
  }, []);

  /** “I’m awake.” Wakes log under today’s key. */
  const logWokeNow = useCallback(() => {
    const now = new Date();
    const key = dateKey(now);
    setLogs((prev) => ({
      ...prev,
      [key]: { ...prev[key], woke: mod(toMin(now.getHours(), now.getMinutes())) },
    }));
  }, []);

  const anchor = useMemo(() => anchorWake(alarms), [alarms]);
  const plan = useMemo(
    () =>
      anchor
        ? computePlan({ targetWakeMin: anchor.min, currentBedMin: usualBed(logs) })
        : [],
    [anchor, logs],
  );

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <View style={s.header}>
        <Text style={s.h1}>Correct Your Sleep Cycle</Text>
        <Text style={s.h2}>anchor the morning · shift the evening</Text>
      </View>

      <View style={s.body}>
        {tab === 'home' && (
          <HomeScreen
            alarms={alarms}
            plan={plan}
            logs={logs}
            anchor={anchor}
            onBedNow={logBedNow}
            onWokeNow={logWokeNow}
            onGotoAlarms={() => setTab('alarms')}
          />
        )}
        {tab === 'plan' && (
          <PlanScreen
            plan={plan}
            logs={logs}
            anchor={anchor}
            onBedNow={logBedNow}
            onWokeNow={logWokeNow}
          />
        )}
        {tab === 'alarms' && <AlarmsScreen alarms={alarms} onPersist={persistAlarms} />}
      </View>

      <View style={s.tabs}>
        {(
          [
            ['home', 'Home'],
            ['plan', 'Plan'],
            ['alarms', 'Alarms'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[s.tabBtn, tab === key && s.tabBtnOn]}
            onPress={() => setTab(key)}
          >
            <Text style={[s.tabText, tab === key && { color: C.text }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/** Usual bedtime = latest *logged* bedtime; else 23:00 default. */
export function usualBed(logs: Logs): number {
  const entries = Object.values(logs)
    .filter((e) => e.actualBed != null)
    .sort((a, b) => (a.actualBed! < b.actualBed! ? -1 : 0));
  const last = entries[entries.length - 1];
  return last ? last.actualBed! : mod(23 * 60); // 23:00
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: 40 },
  header: { paddingHorizontal: PAD, paddingBottom: GAP },
  h1: { color: C.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  h2: { color: C.sub, fontSize: 12, marginTop: 2 },
  body: { flex: 1, paddingHorizontal: PAD },
  tabs: {
    flexDirection: 'row',
    margin: PAD,
    marginTop: 0,
    backgroundColor: cardStyle.backgroundColor,
    borderRadius: cardStyle.borderRadius,
    padding: 6,
    gap: GAP,
  },
  tabBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  tabBtnOn: { backgroundColor: C.accent },
  tabText: { color: C.sub, fontWeight: '700' },
});
