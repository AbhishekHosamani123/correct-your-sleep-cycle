export const C = {
  bg: '#0B1020',
  card: '#131B36',
  cardAlt: '#1A2242',
  line: '#252F5C',
  text: '#E7ECFF',
  sub: '#8E9BC7',
  accent: '#7C6FF3',
  accent2: '#2DD4BF',
  warn: '#F59E0B',
  danger: '#EF476F',
};

export const GAP = 12;
export const PAD = 18;
export const RADIUS = 18;

export const cardStyle = {
  backgroundColor: C.card,
  borderRadius: RADIUS,
  padding: PAD,
  marginBottom: GAP,
} as const;
