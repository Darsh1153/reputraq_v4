export type ThemePreference = 'light' | 'dark' | 'auto';
export type TimeFormatPreference = '12h' | '24h';

export interface DisplaySettings {
  theme: ThemePreference;
  timeFormat: TimeFormatPreference;
}

const STORAGE_KEY = 'displaySettings';

const DEFAULT_SETTINGS: DisplaySettings = {
  theme: 'light',
  timeFormat: '12h',
};

export function getDisplaySettings(): DisplaySettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<DisplaySettings> | null;
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SETTINGS;

    return {
      theme:
        parsed.theme === 'dark' || parsed.theme === 'auto' || parsed.theme === 'light'
          ? parsed.theme
          : DEFAULT_SETTINGS.theme,
      timeFormat: parsed.timeFormat === '24h' || parsed.timeFormat === '12h'
        ? parsed.timeFormat
        : DEFAULT_SETTINGS.timeFormat,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function setDisplaySettings(next: DisplaySettings) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function resolveTheme(theme: ThemePreference): 'light' | 'dark' {
  if (theme === 'light' || theme === 'dark') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyThemePreference(theme: ThemePreference) {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(theme);

  // Dashboard layout uses `data-theme` for styling.
  document.documentElement.setAttribute('data-theme', resolved);

  // Some parts of the app also look for the `dark` class.
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

