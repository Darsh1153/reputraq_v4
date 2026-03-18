import { getDisplaySettings } from '@/lib/displaySettings';

function getHour12Preference(): boolean {
  const { timeFormat } = getDisplaySettings();
  return timeFormat !== '24h';
}

export function formatDateOnly(value: Date | string | number, locale = 'en-US') {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(locale);
}

export function formatDateTime(value: Date | string | number, locale = 'en-US') {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: getHour12Preference(),
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

