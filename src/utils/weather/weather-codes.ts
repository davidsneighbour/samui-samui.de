// Central WMO weather-interpretation-code mapping for the weather widget.
//
// Source: the WMO weather interpretation codes ("WW") table Open-Meteo
// documents at https://open-meteo.com/en/docs -- the same fixed 0-99 code
// list used by most Open-Meteo-compatible providers, so a future provider
// swap that still speaks WMO codes can reuse this file unchanged (see
// documentation/features/weather-widget.md#weather-code-mapping).
//
// The icon set is deliberately restricted to the icons this widget actually
// ships (see WeatherIconName below). Koh Samui never receives snow, so the
// snow/snow-shower codes are mapped to the plain "cloud" icon rather than
// adding a snow-specific icon that would only ever render in tests.

export type WeatherCodeCategory =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'showers'
  | 'thunderstorm'
  | 'unknown';

export type WeatherIconName =
  | 'sun'
  | 'moon'
  | 'cloud-sun'
  | 'cloud-moon'
  | 'cloud'
  | 'cloud-fog'
  | 'cloud-drizzle'
  | 'cloud-rain'
  | 'cloud-rain-wind'
  | 'cloud-lightning';

export const ALL_WEATHER_ICON_NAMES: readonly WeatherIconName[] = [
  'sun',
  'moon',
  'cloud-sun',
  'cloud-moon',
  'cloud',
  'cloud-fog',
  'cloud-drizzle',
  'cloud-rain',
  'cloud-rain-wind',
  'cloud-lightning',
] as const;

export interface WeatherCodeDefinition {
  category: WeatherCodeCategory;
  GermanLabel: string;
  dayIcon: WeatherIconName;
  nightIcon: WeatherIconName;
}

const UNKNOWN_WEATHER_CODE_DEFINITION: WeatherCodeDefinition = {
  category: 'unknown',
  dayIcon: 'cloud',
  GermanLabel: 'Wetterlage unbekannt',
  nightIcon: 'cloud',
};

const WEATHER_CODE_DEFINITIONS: Record<number, WeatherCodeDefinition> = {
  0: {
    category: 'clear',
    dayIcon: 'sun',
    GermanLabel: 'Sonnig',
    nightIcon: 'moon',
  },
  1: {
    category: 'clear',
    dayIcon: 'sun',
    GermanLabel: 'Überwiegend sonnig',
    nightIcon: 'moon',
  },
  2: {
    category: 'partly-cloudy',
    dayIcon: 'cloud-sun',
    GermanLabel: 'Teilweise bewölkt',
    nightIcon: 'cloud-moon',
  },
  3: {
    category: 'cloudy',
    dayIcon: 'cloud',
    GermanLabel: 'Bewölkt',
    nightIcon: 'cloud',
  },
  45: {
    category: 'fog',
    dayIcon: 'cloud-fog',
    GermanLabel: 'Neblig',
    nightIcon: 'cloud-fog',
  },
  48: {
    category: 'fog',
    dayIcon: 'cloud-fog',
    GermanLabel: 'Neblig mit Reifglätte',
    nightIcon: 'cloud-fog',
  },
  51: {
    category: 'drizzle',
    dayIcon: 'cloud-drizzle',
    GermanLabel: 'Leichter Nieselregen',
    nightIcon: 'cloud-drizzle',
  },
  53: {
    category: 'drizzle',
    dayIcon: 'cloud-drizzle',
    GermanLabel: 'Nieselregen',
    nightIcon: 'cloud-drizzle',
  },
  55: {
    category: 'drizzle',
    dayIcon: 'cloud-drizzle',
    GermanLabel: 'Starker Nieselregen',
    nightIcon: 'cloud-drizzle',
  },
  56: {
    category: 'drizzle',
    dayIcon: 'cloud-drizzle',
    GermanLabel: 'Gefrierender Nieselregen',
    nightIcon: 'cloud-drizzle',
  },
  57: {
    category: 'drizzle',
    dayIcon: 'cloud-drizzle',
    GermanLabel: 'Starker gefrierender Nieselregen',
    nightIcon: 'cloud-drizzle',
  },
  61: {
    category: 'rain',
    dayIcon: 'cloud-rain',
    GermanLabel: 'Leichter Regen',
    nightIcon: 'cloud-rain',
  },
  63: {
    category: 'rain',
    dayIcon: 'cloud-rain',
    GermanLabel: 'Regen',
    nightIcon: 'cloud-rain',
  },
  65: {
    category: 'rain',
    dayIcon: 'cloud-rain-wind',
    GermanLabel: 'Starker Regen',
    nightIcon: 'cloud-rain-wind',
  },
  66: {
    category: 'rain',
    dayIcon: 'cloud-rain',
    GermanLabel: 'Gefrierender Regen',
    nightIcon: 'cloud-rain',
  },
  67: {
    category: 'rain',
    dayIcon: 'cloud-rain-wind',
    GermanLabel: 'Starker gefrierender Regen',
    nightIcon: 'cloud-rain-wind',
  },
  71: {
    category: 'snow',
    dayIcon: 'cloud',
    GermanLabel: 'Leichter Schneefall',
    nightIcon: 'cloud',
  },
  73: {
    category: 'snow',
    dayIcon: 'cloud',
    GermanLabel: 'Schneefall',
    nightIcon: 'cloud',
  },
  75: {
    category: 'snow',
    dayIcon: 'cloud',
    GermanLabel: 'Starker Schneefall',
    nightIcon: 'cloud',
  },
  77: {
    category: 'snow',
    dayIcon: 'cloud',
    GermanLabel: 'Schneegriesel',
    nightIcon: 'cloud',
  },
  80: {
    category: 'showers',
    dayIcon: 'cloud-rain',
    GermanLabel: 'Schauer',
    nightIcon: 'cloud-rain',
  },
  81: {
    category: 'showers',
    dayIcon: 'cloud-rain',
    GermanLabel: 'Schauer',
    nightIcon: 'cloud-rain',
  },
  82: {
    category: 'showers',
    dayIcon: 'cloud-rain-wind',
    GermanLabel: 'Kräftige Schauer',
    nightIcon: 'cloud-rain-wind',
  },
  85: {
    category: 'snow',
    dayIcon: 'cloud',
    GermanLabel: 'Leichte Schneeschauer',
    nightIcon: 'cloud',
  },
  86: {
    category: 'snow',
    dayIcon: 'cloud',
    GermanLabel: 'Starke Schneeschauer',
    nightIcon: 'cloud',
  },
  95: {
    category: 'thunderstorm',
    dayIcon: 'cloud-lightning',
    GermanLabel: 'Gewitter',
    nightIcon: 'cloud-lightning',
  },
  96: {
    category: 'thunderstorm',
    dayIcon: 'cloud-lightning',
    GermanLabel: 'Gewitter mit Hagel',
    nightIcon: 'cloud-lightning',
  },
  99: {
    category: 'thunderstorm',
    dayIcon: 'cloud-lightning',
    GermanLabel: 'Schweres Gewitter mit Hagel',
    nightIcon: 'cloud-lightning',
  },
};

/** Safe fallback for any code not in the table above -- never throws. */
export function getWeatherCodeDefinition(code: number): WeatherCodeDefinition {
  return WEATHER_CODE_DEFINITIONS[code] ?? UNKNOWN_WEATHER_CODE_DEFINITION;
}

export function isThunderstormCode(code: number): boolean {
  return getWeatherCodeDefinition(code).category === 'thunderstorm';
}
