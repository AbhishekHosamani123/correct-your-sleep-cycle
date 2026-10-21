import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, GAP, cardStyle } from '../theme';
import { Alarm, Logs } from '../types';
import { anchorWake, computePlan, dayLabel, fmt, nextOccurrence, streakDays } from '../engine';
import type { PlanNight } from '../engine';

export default function HomeScreen({
  alarms,
  plan,
  logs,
  anchor,
  onBedNow,
  onWokeNow,
  onGotoAlarms,
}: {
  alarms: Alarm[];
  plan: PlanNight[];
  logs: Logs;
  anchor: ReturnType<typeof anchorWake>;
  onBedNow: () => void;
  onWokeNow: () => void;
  onGotoAlarms: () => void;
}) {
  const next = anchor ? nextOccurrence(anchor.alarm) : null;
  const tonight = plan[0];
  const streak = streakDays(logs);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      {!anchor && (
        <View style={card}>
          <Text style={cardTitle}>No anchor yet</Text>
          <Text style={body}>
            Your plan is built around one fixed wake time. Add your first alarm to anchor your
            morning.
          </Text>
          <TouchableOpacity style={btn} onPress={onGotoAlarms}>
            <Text style={btnText}>Go to Alarms</Text>
          </TouchableOpacity>
        </View>
      )}

      {anchor && (
        <>
          <View style={card}>
            <Text style={cardTitle}>Target wake · never moves</Text>
            <Text style={big}>{fmt(anchor.min)}</Text>
            <Text style={body}>
              Anchor alarm · {dayLabel(anchor.alarm.days)}
              {next ? ` · next fires ${NEXT_DAYS[next.getDay()]} ${fmt(anchor.min)}` : ''}
            </Text>
          </View>

          <View style={card}>
            <Text style={cardTitle}>Tonight’s planned bedtime</Text>
            <Text style={[big, { color: C.accent2 }]}>{tonight ? fmt(tonight.bedtimeMin) : '—'}</Text>
            <Text style={body}>
              {tonight
                ? tonight.atIdeal
                  ? 'At your ideal window — hold this bedtime every night.'
                  : `Shift earlier by 15 min a night until ${fmt(0)}`.replace(
                      'until 00:00',
                      'the ideal window',
                    )
                : 'Set an anchor alarm to generate the plan.'}
            </Text>
          </View>

          <View style={[card, { flexDirection: 'row', gap: GAP }]}>
            <View style={{ flex: 1 }}>
              <Text style={cardTitle}>Consistency streak</Text>
              <Text style={[big, { fontSize: 34 }]}>
                {streak}
                <Text style={[body, { fontSize: 14 }]}> nights</Text>
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity style={btn} onPress={onBedNow}>
                <Text style={btnText}>🛌 I’m going to bed</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[btn, { backgroundColor: C.accent2 }]} onPress={onWokeNow}>
                <Text style={[btnText, { color: '#06281F' }]}>☀️ I woke up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const NEXT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const card = cardStyle;
const cardTitle = { color: C.sub, fontSize: 12, fontWeight: '700', marginBottom: 6 } as const;
const body = { color: C.sub, fontSize: 13, marginTop: 4, lineHeight: 18 } as const;
const big = { color: C.text, fontSize: 44, fontWeight: '900', letterSpacing: 1, marginTop: 4 } as const;
const btn = {
  backgroundColor: C.accent,
  borderRadius: 12,
  paddingVertical: 10,
  alignItems: 'center',
} as const;
const btnText = { color: C.text, fontWeight: '800', fontSize: 14 } as const;
