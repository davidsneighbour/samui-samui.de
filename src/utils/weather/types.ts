// Provider-independent weather model. Everything downstream of the Netlify
// proxy (summary generation, the Astro presentation component, the client
// controller, and any future larger weather page) reads this shape only --
// never the raw Open-Meteo response. See
// documentation/features/weather-widget.md#internal-normalised-format.

import type { WeatherLocation } from '@config/weather';

export interface WeatherForecastHour {
  /** ISO 8601 timestamp in the location's local offset (as returned by Open-Meteo's `timezone` param). */
  time: string;
  temperatureCelsius: number;
  apparentTemperatureCelsius: number | null;
  precipitationProbabilityPercent: number | null;
  precipitationMillimetres: number | null;
  rainMillimetres: number | null;
  weatherCode: number;
}

export interface WeatherCurrentConditions {
  /** ISO 8601 timestamp of the provider's "current" reading -- the "Wetterstand" time. */
  observedAt: string;
  temperatureCelsius: number;
  apparentTemperatureCelsius: number | null;
  relativeHumidityPercent: number | null;
  precipitationMillimetres: number | null;
  rainMillimetres: number | null;
  cloudCoverPercent: number | null;
  windSpeedKilometresPerHour: number | null;
  weatherCode: number;
  isDay: boolean;
}

export interface WeatherSnapshot {
  schemaVersion: 1;
  location: WeatherLocation;
  current: WeatherCurrentConditions;
  hourly: WeatherForecastHour[];
  /** When the Netlify function produced this snapshot -- diagnostics/caching only, not shown as "Wetterstand". */
  generatedAt: string;
  provider: {
    id: 'open-meteo';
    label: 'Open-Meteo';
  };
}
