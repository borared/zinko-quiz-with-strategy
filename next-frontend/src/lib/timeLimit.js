export const TIME_LIMIT_OPTIONS = [
  { value: 20, label: '20 Seconds' },
  { value: 30, label: '30 Seconds' },
  { value: 60, label: '60 Seconds' },
  { value: 100, label: '100 Seconds' },
  { value: 120, label: '120 Seconds' },
];

export const DEFAULT_TIME_LIMIT = 20;

export function normalizeTimeLimit(value) {
  const parsed = Number(value);
  if (TIME_LIMIT_OPTIONS.some((option) => option.value === parsed)) {
    return parsed;
  }
  return DEFAULT_TIME_LIMIT;
}