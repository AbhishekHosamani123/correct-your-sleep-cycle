import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, GAP, cardStyle } from '../theme';
import { Logs } from '../types';
import { fmt, streakDays } from '../engine';
import type { PlanNight } from '../engine';
import type { anchorWake } from '../engine';

export default function PlanScreen({
  plan,
  logs,
  anchor,
  onBedNow,
  onWokeNow,
}: {
  plan: PlanNight[];
  logs: Logs;
  anchor: ReturnType<typeof anchorWake>;
  onBedNow: () => void;
  onWokeNow: () => void;
}) {
  const today = new Date();
  const streak = streakDays(logs);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={card}>
        <Text style={cardTitle}>How the correction works</Text>
        <Text style={body}>
          Your wake time stays fixed ({anchor ? fmt(anchor.min) : 'set it first'}). Each night we
          pull bedtime <Text style={{ color: C.accent2, fontWeight: '800' }}>15 minutes earlier</Text>{' '}
          until it hits the ideal window 7 h 30 m before your wake time. Miss a night? Nothing
          breaks — the plan re-anchors from your latest real bedtime.
        </Text>
      </View>

      <View style={card}>
        <Text style={cardTitle}>Upcoming nights</Text>
        {plan.length === 0 && <Text style={body}>Add an anchor alarm to generate the plan.</Text>}
        {plan.map((n, i) => (
          <View key={n.dateKey} style={row}>
            <Text style={rowMain}>
              {i === 0 ? 'Tonight' : i === 1 ? 'Tomorrow' : `Day ${i + 1}`}
            </Text>
            <Text style={rowSub}>{n.dateKey.slice(5)}</Text>
            <View style={{ flex: 1 }} />
            <Text style={[rowTime, n.atIdeal && { color: C.accent2 }]}>{fmt(n.bedtimeMin)}</Text>
            {n.atIdeal ? (
              <Text style={badgeOk}>IDEAL</Text>
            ) : (
              <Text style={badgeShift}>−{n.minutesFromNow}m</Text>
            )}
          </View>
        ))}
      </View>

      <View style={[card, { flexDirection: 'row', gap: GAP }]}>
        <View style={{ flex: 1 }}>
          <Text style={cardTitle}>Streak</Text>
          <Text style={{ color: C.text, fontSize: 30, fontWeight: '900' }}>{streak}</Text>
        </View>
        <View style={{ flex: 1.4, justifyContent: 'flex-end', gap: 8 }}>
          <TouchableOpacity style={btn} onPress={onBedNow}>
            <Text style={btnText}>Log going to bed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[btn, { backgroundColor: C.accent2 }]} onPress={onWokeNow}>
            <Text style={[btnText, { color: '#06281F' }]}>Log waking up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const card = cardStyle;
const cardTitle = { color: C.sub, fontSize: 12, fontWeight: '700', marginBottom: 6 } as const;
const body = { color: C.sub, fontSize: 13, lineHeight: 18 } as const;
const row = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingVertical: 7,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: C.line,
} as const;
const rowMain = { color: C.text, fontWeight: '700', width: 74 } as const;
const rowSub = { color: C.sub, width: 46, fontSize: 12 } as const;
const rowTime = { color: C.text, fontWeight: '800', fontSize: 16, marginRight: 10 } as const;
const badgeShift = { color: C.warn, fontWeight: '800', fontSize: 11 } as const;
const badgeOk = { color: C.accent2, fontWeight: '800', fontSize: 11 } as const;
const btn = {
  backgroundColor: C.accent,
  borderRadius: 12,
  paddingVertical: 10,
  alignItems: 'center',
} as const;
const btnText = { color: C.text, fontWeight: '800', fontSize: 14 } as const;
