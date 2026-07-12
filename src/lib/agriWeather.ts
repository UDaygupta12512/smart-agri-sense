export interface GeoLocation {
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface WeatherForecast {
  timezone: string;
  current: {
    time: string;
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    precipitation: number;
    weatherCode: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
  };
  hourly: {
    time: string[];
    temperature: number[];
    humidity: number[];
    windSpeed: number[];
    windDirection: number[];
    rainProbability: number[];
  };
  daily: {
    time: string[];
    weatherCode: number[];
    tempMax: number[];
    tempMin: number[];
    sunrise: string[];
    sunset: string[];
    rainProbabilityMax: number[];
    precipitationSum: number[];
  };
}

interface OpenMeteoSearchResponse {
  results?: Array<{
    name?: string;
    admin1?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }>;
}

interface OpenMeteoForecastResponse {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    weather_code?: number;
    surface_pressure?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    visibility?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
    precipitation_probability?: number[];
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    sunrise?: string[];
    sunset?: string[];
    precipitation_probability_max?: number[];
    precipitation_sum?: number[];
  };
}

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly Clear',
  2: 'Partly Cloudy',
  3: 'Cloudy',
  45: 'Foggy',
  48: 'Rime Fog',
  51: 'Light Drizzle',
  53: 'Drizzle',
  55: 'Dense Drizzle',
  56: 'Freezing Drizzle',
  57: 'Freezing Drizzle',
  61: 'Light Rain',
  63: 'Rain',
  65: 'Heavy Rain',
  66: 'Freezing Rain',
  67: 'Freezing Rain',
  71: 'Light Snow',
  73: 'Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Rain Showers',
  81: 'Rain Showers',
  82: 'Heavy Showers',
  85: 'Snow Showers',
  86: 'Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Severe Storm',
};

export const DEFAULT_LOCATION: GeoLocation = {
  name: 'Nagpur',
  state: 'Maharashtra',
  country: 'India',
  latitude: 21.14631,
  longitude: 79.08491,
  timezone: 'Asia/Kolkata',
};

// Simple in-memory cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const weatherCache = new Map<string, CacheEntry<WeatherForecast>>();
const locationCache = new Map<string, CacheEntry<GeoLocation[]>>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCachedData<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  if (entry) {
    cache.delete(key); // Clean up expired entry
  }
  return null;
}

function setCachedData<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Retry logic for API calls
async function fetchWithRetry(
  url: string,
  options: { maxRetries?: number; retryDelayMs?: number } = {}
): Promise<Response> {
  const { maxRetries = 3, retryDelayMs = 1000 } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      // For 4xx errors, don't retry (client error)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      // For 5xx errors, retry
      lastError = new Error(`Server error: ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelayMs * Math.pow(2, attempt)));
    }
  }

  throw lastError ?? new Error('Request failed after retries');
}

function average(values: number[]): number {
  if (!values || !Array.isArray(values) || values.length === 0) {
    return 0;
  }

  const validValues = values.filter(v => Number.isFinite(v));
  if (validValues.length === 0) {
    return 0;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

export function weatherCodeToLabel(code: number): string {
  return WEATHER_CODE_LABELS[code] ?? 'Unknown';
}

export function degToDirection(degrees: number): string {
  if (!Number.isFinite(degrees)) return 'N';
  const normalized = ((degrees % 360) + 360) % 360;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export async function searchLocations(query: string, count = 8): Promise<GeoLocation[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  // Check cache first
  const cacheKey = `${normalized}|${count}`;
  const cached = getCachedData(locationCache, cacheKey);
  if (cached) {
    return cached;
  }

  const isClient = typeof window !== 'undefined';
  const url = isClient
    ? `/api/weather?type=search&query=${encodeURIComponent(normalized)}&count=${count}`
    : `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(normalized)}&count=${count}&language=en&format=json`;

  try {
    const response = await fetchWithRetry(url);
    const payload = (await response.json()) as OpenMeteoSearchResponse;
    const results = payload.results ?? [];

    const unique = new Map<string, GeoLocation>();
    for (const candidate of results) {
      const name = candidate.name ?? '';
      const latitude = candidate.latitude;
      const longitude = candidate.longitude;

      if (!name || typeof latitude !== 'number' || typeof longitude !== 'number') {
        continue;
      }

      // Validate coordinates
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        continue;
      }

      const location: GeoLocation = {
        name,
        state: candidate.admin1 ?? '',
        country: candidate.country ?? '',
        latitude,
        longitude,
        timezone: candidate.timezone ?? 'auto',
      };

      const key = `${location.name}|${location.state}|${location.country}`.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, location);
      }
    }

    const locationList = Array.from(unique.values());
    setCachedData(locationCache, cacheKey, locationList);
    return locationList;
  } catch (error) {
    // Return empty array on error, caller can use default location
    console.error('Location search failed:', error);
    return [];
  }
}

export async function fetchWeatherForecast(latitude: number, longitude: number, days = 7): Promise<WeatherForecast> {
  // Validate coordinates
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error('Invalid latitude. Must be between -90 and 90.');
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('Invalid longitude. Must be between -180 and 180.');
  }

  const forecastDays = clamp(Math.round(days), 1, 16);

  // Check cache first
  const cacheKey = `${latitude.toFixed(4)}|${longitude.toFixed(4)}|${forecastDays}`;
  const cached = getCachedData(weatherCache, cacheKey);
  if (cached) {
    return cached;
  }

  const isClient = typeof window !== 'undefined';
  const url = isClient
    ? `/api/weather?type=forecast&latitude=${latitude}&longitude=${longitude}&forecast_days=${forecastDays}`
    : `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,visibility' +
      '&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation_probability' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,precipitation_sum' +
      `&timezone=auto&forecast_days=${forecastDays}`;

  try {
    const response = await fetchWithRetry(url);
    const payload = (await response.json()) as OpenMeteoForecastResponse;

    const forecast: WeatherForecast = {
      timezone: payload.timezone ?? 'auto',
      current: {
        time: payload.current?.time ?? new Date().toISOString(),
        temperature: payload.current?.temperature_2m ?? 0,
        apparentTemperature: payload.current?.apparent_temperature ?? payload.current?.temperature_2m ?? 0,
        humidity: clamp(payload.current?.relative_humidity_2m ?? 0, 0, 100),
        precipitation: Math.max(0, payload.current?.precipitation ?? 0),
        weatherCode: payload.current?.weather_code ?? 0,
        pressure: Math.max(0, payload.current?.surface_pressure ?? 0),
        windSpeed: Math.max(0, payload.current?.wind_speed_10m ?? 0),
        windDirection: clamp(payload.current?.wind_direction_10m ?? 0, 0, 360),
        visibility: Math.max(0, payload.current?.visibility ?? 0),
      },
      hourly: {
        time: payload.hourly?.time ?? [],
        temperature: payload.hourly?.temperature_2m ?? [],
        humidity: (payload.hourly?.relative_humidity_2m ?? []).map(h => clamp(h, 0, 100)),
        windSpeed: (payload.hourly?.wind_speed_10m ?? []).map(w => Math.max(0, w)),
        windDirection: (payload.hourly?.wind_direction_10m ?? []).map(d => clamp(d, 0, 360)),
        rainProbability: (payload.hourly?.precipitation_probability ?? []).map(p => clamp(p, 0, 100)),
      },
      daily: {
        time: payload.daily?.time ?? [],
        weatherCode: payload.daily?.weather_code ?? [],
        tempMax: payload.daily?.temperature_2m_max ?? [],
        tempMin: payload.daily?.temperature_2m_min ?? [],
        sunrise: payload.daily?.sunrise ?? [],
        sunset: payload.daily?.sunset ?? [],
        rainProbabilityMax: (payload.daily?.precipitation_probability_max ?? []).map(p => clamp(p, 0, 100)),
        precipitationSum: (payload.daily?.precipitation_sum ?? []).map(p => Math.max(0, p)),
      },
    };

    setCachedData(weatherCache, cacheKey, forecast);
    return forecast;
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw new Error('Unable to fetch weather data. Please try again.');
  }
}

export function buildFarmingAlerts(forecast: WeatherForecast): string[] {
  const alerts: string[] = [];

  if (!forecast || !forecast.current || !forecast.daily || !forecast.hourly) {
    return alerts;
  }

  const tempMaxSlice = (forecast.daily.tempMax || []).filter(t => Number.isFinite(t)).slice(0, 3);
  const tempMinSlice = (forecast.daily.tempMin || []).filter(t => Number.isFinite(t)).slice(0, 2);
  const windSlice = (forecast.hourly.windSpeed || []).filter(w => Number.isFinite(w)).slice(0, 24);
  const precipSlice = (forecast.daily.precipitationSum || []).filter(p => Number.isFinite(p));

  const nextThreeMax = tempMaxSlice.length ? Math.max(...tempMaxSlice) : forecast.current.temperature;
  const nextTwoMin = tempMinSlice.length ? Math.min(...tempMinSlice) : forecast.current.temperature;
  const rainNextThree = precipSlice.slice(0, 3).reduce((sum, value) => sum + value, 0);
  const rainTomorrow = precipSlice[1] ?? 0;
  const maxWindNextDay = windSlice.length ? Math.max(...windSlice) : forecast.current.windSpeed;
  const avgHumidityNext24 = average((forecast.hourly.humidity || []).slice(0, 24));
  const currentTemp = forecast.current.temperature;
  const currentHumidity = forecast.current.humidity;

  // Only generate alerts if we have valid data
  if (!Number.isFinite(nextThreeMax) || !Number.isFinite(nextTwoMin)) {
    return alerts;
  }

  if (nextThreeMax >= 42) {
    alerts.push(`Severe Heatwave: Maximum temperature may reach ${Math.round(nextThreeMax)}°C. Halt all spraying, irrigate twice daily (morning & evening), use mulching to protect soil moisture. High risk of sunburn on fruits.`);
  } else if (nextThreeMax >= 38) {
    alerts.push(`Heatwave Alert: Maximum temperature may touch ${Math.round(nextThreeMax)}°C. Prefer evening irrigation and avoid midday sprays. Consider light sprinkler irrigation for evaporative cooling.`);
  }

  if (nextTwoMin <= 4) {
    alerts.push(`Severe Frost Warning: Night temperature may drop to ${Math.round(nextTwoMin)}°C. Apply light irrigation before sunset to raise soil temperature. Cover nurseries with polythene sheets. Avoid nitrogen application.`);
  } else if (nextTwoMin <= 9) {
    alerts.push(`Frost Risk Alert: Night temperature may drop to ${Math.round(nextTwoMin)}°C. Protect nurseries and flowering crops. Light smoke screening in early morning may reduce frost damage.`);
  }

  if (Number.isFinite(rainNextThree) && rainNextThree >= 100) {
    alerts.push(`Flood Risk Advisory: About ${Math.round(rainNextThree)} mm rain expected over 3 days. Activate all drainage channels immediately. Harvest any mature crops before the wet spell. Do NOT apply any soil fertilizer.`);
  } else if (Number.isFinite(rainNextThree) && rainNextThree >= 50) {
    alerts.push(`Heavy Rain Advisory: About ${Math.round(rainNextThree)} mm rain expected over 3 days. Improve drainage and postpone top dressing. Apply preventive fungicide (Mancozeb) before the rain starts.`);
  } else if (Number.isFinite(rainTomorrow) && rainTomorrow >= 15) {
    alerts.push(`Rain Expected Tomorrow: About ${Math.round(rainTomorrow)} mm rainfall likely. Postpone any spray applications. Complete irrigation today as rain may provide natural moisture.`);
  }

  if (Number.isFinite(maxWindNextDay) && maxWindNextDay >= 40) {
    alerts.push(`High Wind Warning: Wind speed may reach ${Math.round(maxWindNextDay)} km/h. Secure crop supports, trellises, and polytunnels. Do NOT spray — product will be wasted and may cause drift damage. Stake tall crops like maize and sugarcane.`);
  } else if (Number.isFinite(maxWindNextDay) && maxWindNextDay >= 25) {
    alerts.push(`Strong Wind Alert: Wind speed may rise to ${Math.round(maxWindNextDay)} km/h. Avoid spray drift and secure trellised crops. Postpone foliar applications to calm conditions.`);
  }

  if (Number.isFinite(avgHumidityNext24) && avgHumidityNext24 >= 85) {
    alerts.push(`High Humidity Alert: Average humidity above ${Math.round(avgHumidityNext24)}% over next 24 hours. Very high risk of fungal diseases (Blast, Blight, Downy Mildew). Apply preventive fungicide and ensure good air circulation in dense canopy crops.`);
  } else if (Number.isFinite(avgHumidityNext24) && Number.isFinite(currentTemp) && avgHumidityNext24 >= 75 && currentTemp >= 28) {
    alerts.push(`Disease Watch: Warm and humid conditions (${Math.round(currentTemp)}°C, ${Math.round(avgHumidityNext24)}% humidity) favor rapid fungal disease spread. Scout fields closely and prepare fungicide if symptoms appear.`);
  }

  if (Number.isFinite(currentTemp) && Number.isFinite(currentHumidity) && currentTemp >= 30 && currentHumidity >= 70) {
    alerts.push(`Pest Pressure Alert: Hot and humid conditions (${Math.round(currentTemp)}°C, ${Math.round(currentHumidity)}% humidity) accelerate pest breeding cycles. Increase scouting frequency to every 3–4 days. Check for sucking pests (aphids, whiteflies, thrips).`);
  }

  if (precipSlice.length >= 3 && precipSlice.slice(0, 7).every(mm => Number.isFinite(mm) && mm < 2) && nextThreeMax >= 32) {
    alerts.push(`Dry Spell Alert: No significant rainfall expected for 7 days with high temperatures. Prioritize irrigation scheduling, especially for flowering and grain-filling stage crops. Consider mulching to conserve soil moisture.`);
  }

  return alerts;
}

export function buildFarmingAlert(forecast: WeatherForecast): string | null {
  const alerts = buildFarmingAlerts(forecast);
  return alerts.length > 0 ? alerts[0] : null;
}

export interface YieldWeatherContext {
  locationLabel: string;
  avgTemp: number;
  avgRainProbability: number;
  avgHumidity: number;
}

export async function buildYieldWeatherContext(locationQuery: string): Promise<YieldWeatherContext> {
  try {
    const sanitizedQuery = locationQuery?.trim() || '';
    const matches = await searchLocations(sanitizedQuery || 'Nagpur', 1);
    const selected = matches[0] ?? DEFAULT_LOCATION;
    const forecast = await fetchWeatherForecast(selected.latitude, selected.longitude, 7);

    const avgTemp = average(
      (forecast.daily.tempMax || []).map((maxValue, idx) => {
        const minValue = forecast.daily.tempMin?.[idx] ?? maxValue;
        return (maxValue + minValue) / 2;
      })
    );

    const avgRainProbability = average((forecast.daily.rainProbabilityMax || []).slice(0, 7));
    const avgHumidity = average((forecast.hourly.humidity || []).slice(0, 24));

    return {
      locationLabel: `${selected.name}${selected.state ? `, ${selected.state}` : ''}`,
      avgTemp: Number.isFinite(avgTemp) ? avgTemp : 25,
      avgRainProbability: Number.isFinite(avgRainProbability) ? avgRainProbability : 50,
      avgHumidity: Number.isFinite(avgHumidity) ? avgHumidity : 60,
    };
  } catch {
    return {
      locationLabel: DEFAULT_LOCATION.name,
      avgTemp: 25,
      avgRainProbability: 50,
      avgHumidity: 60,
    };
  }
}
