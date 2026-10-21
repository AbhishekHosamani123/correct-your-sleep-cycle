import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { C, GAP, cardStyle } from '../theme';
import { Alarm } from '../types';
import { dayLabel, fmtTime, mod, sortAlarms, toMin } from '../engine';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AlarmsScreen({
  alarms,
  onPersist,
}: {
  alarms: Alarm[];
  onPersist: (next: Alarm[]) => void;
}) {
  const [editing, setEditing] = useState<Alarm | null>(null);

  const toggle = (id: string) =>
    onPersist(sortAlarms(alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))));

  const save = (a: Alarm) => {
    const exists = alarms.some((x) => x.id === a.id);
    onPersist(sortAlarms(exists ? alarms.map((x) => (x.id === a.id ? a : x)) : [...alarms, a]));
    setEditing(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {alarms.length === 0 && (
          <View style={card}>
            <Text style={body}>No alarms. Tap ➕ to create your anchor wake time.</Text>
          </View>
        )}
        {sortAlarms(alarms).map((a) => (
          <TouchableOpacity
            key={a.id}
            style={[card, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}
            onPress={() => setEditing(a)}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[time, { color: a.enabled ? C.text : C.sub }]}
              >{`${fmtTime(a.hour, a.minute)}`}</Text>
              <Text style={sub}>
                {(a.label || 'Alarm') + ' · ' + dayLabel(a.days)}
              </Text>
            </View>
            <Switch
              value={a.enabled}
              onValueChange={() => toggle(a.id)}
              thumbColor={a.enabled ? C.accent2 : C.sub}
              trackColor={{ true: C.accent, false: C.line }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={fab} onPress={() => setEditing(nullAlarm())}>
        <Text style={fabText}>＋</Text>
      </TouchableOpacity>

      <Modal visible={editing != null} transparent animationType="slide">
        {editing && (
          <Editor
            value={editing}
            onClose={() => setEditing(null)}
            onSave={save}
            onDelete={(id) => {
              onPersist(alarms.filter((x) => x.id !== id));
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </View>
  );
}

function nullAlarm(): Alarm {
  return {
    id: `a${Date.now().toString(36)}`,
    label: 'Wake anchor',
    hour: 6,
    minute: 30,
    days: [1, 2, 3, 4, 5, 6, 0],
    enabled: true,
  };
}

function Editor({
  value,
  onClose,
  onSave,
  onDelete,
}: {
  value: Alarm;
  onClose: () => void;
  onSave: (a: Alarm) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Alarm>(value);

  const setMin = (delta: number) =>
    setDraft((d) => {
      const t = mod(toMin(d.hour, d.minute) + delta);
      return { ...d, hour: Math.floor(t / 60), minute: t % 60 };
    });

  const toggleDay = (i: number) =>
    setDraft((d) => {
      const days = d.days.includes(i) ? d.days.filter((x) => x !== i) : [...d.days, i];
      return { ...d, days: [...days] };
    });

  return (
    <View style={ov}>
      <View style={sheet}>
        <View style={stepperRow}>
          <Text style={edLabel}>Wake time</Text>
          <Text style={edBig}>{fmtTime(draft.hour, draft.minute)}</Text>
          <View style={stepperBtns}>
            {[
              [-60, '−1h'],
              [-5, '−5m'],
              [5, '+5m'],
              [60, '+1h'],
            ].map(([d, l]) => (
              <TouchableOpacity key={l} style={chip} onPress={() => setMin(d as number)}>
                <Text style={chipText}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TextInput
          style={input}
          placeholder="Label (e.g. Wake anchor)"
          placeholderTextColor={C.sub}
          value={draft.label}
          onChangeText={(t) => setDraft((d) => ({ ...d, label: t }))}
        />

        <Text style={edLabel}>Repeat</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: GAP }}>
          {DAYS.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[dayChip, draft.days.includes(i) && dayChipOn]}
              onPress={() => toggleDay(i)}
            >
              <Text style={[dayChipText, draft.days.includes(i) && { color: C.text }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={[btn, { flex: 1 }]} onPress={onClose}>
            <Text style={btnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[btn, { flex: 1, backgroundColor: C.danger }]}
            onPress={() => onDelete(draft.id)}
          >
            <Text style={btnText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[btn, { flex: 1, backgroundColor: C.accent2 }]}
            onPress={() => onSave(draft)}
          >
            <Text style={[btnText, { color: '#06281F' }]}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const card = cardStyle;
const time = { color: C.text, fontSize: 30, fontWeight: '900' } as const;
const sub = { color: C.sub, fontSize: 12, marginTop: 2 } as const;
const body = { color: C.sub, fontSize: 13 } as const;
const fab = {
  position: 'absolute',
  right: 10,
  bottom: 10,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: C.accent,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  elevation: 4,
} as const;
const fabText = { color: C.text, fontSize: 26, fontWeight: '700' } as const;
const ov = {
  flex: 1,
  backgroundColor: 'rgba(4,8,20,0.72)',
  justifyContent: 'flex-end',
} as const;
const sheet = {
  backgroundColor: C.cardAlt,
  borderTopLeftRadius: 22,
  borderTopRightRadius: 22,
  padding: 20,
  gap: 12,
} as const;
const stepperRow = { marginBottom: 2 } as const;
const edLabel = { color: C.sub, fontSize: 12, fontWeight: '700' } as const;
const edBig = { color: C.text, fontSize: 44, fontWeight: '900', letterSpacing: 1, marginVertical: 6 } as const;
const stepperBtns = { flexDirection: 'row', gap: 8 } as const;
const chip = { backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 } as const;
const chipText = { color: C.text, fontWeight: '800' } as const;
const input = {
  backgroundColor: C.card,
  borderRadius: 12,
  color: C.text,
  padding: 12,
  fontSize: 15,
} as const;
const dayChip = {
  backgroundColor: C.card,
  borderRadius: 10,
  width: 34,
  height: 34,
  alignItems: 'center',
  justifyContent: 'center',
} as const;
const dayChipOn = { backgroundColor: C.accent } as const;
const dayChipText = { color: C.sub, fontWeight: '800' } as const;
const btn = {
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: 'center',
  backgroundColor: C.card,
} as const;
const btnText = { color: C.text, fontWeight: '800', fontSize: 14 } as const;
