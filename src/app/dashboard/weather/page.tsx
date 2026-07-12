'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    CalendarCheck,
    Cloud,
    CloudRain,
    CloudSun,
    Droplets,
    Eye,
    Gauge,
    Loader2,
    MapPin,
    Navigation,
    Search,
    Sprout,
    Sun,
    Sunrise,
    Sunset,
    Thermometer,
    Wind,
} from 'lucide-react';
import {
    DEFAULT_LOCATION,
    buildFarmingAlerts,
    degToDirection,
    fetchWeatherForecast,
    searchLocations,
    weatherCodeToLabel,
    type GeoLocation,
    type WeatherForecast,
} from '@/lib/agriWeather';

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeatherIcon(code: number) {
    if (code === 0) return Sun;
    if ([1, 2].includes(code)) return CloudSun;
    if ([3, 45, 48].includes(code)) return Cloud;
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return CloudRain;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return Cloud;
    if ([95, 96, 99].includes(code)) return CloudRain;
    return CloudSun;
}

function getWeatherBackground(code: number) {
    if (code === 0) return 'from-amber-400 to-orange-600'; // Clear
    if ([1, 2].includes(code)) return 'from-blue-400 to-amber-500'; // Partly Cloudy
    if ([3, 45, 48].includes(code)) return 'from-slate-400 to-slate-600'; // Overcast/Fog
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'from-slate-700 to-blue-900'; // Rain
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'from-sky-300 to-slate-500'; // Snow
    if ([95, 96, 99].includes(code)) return 'from-slate-900 to-purple-900'; // Thunderstorm
    return 'from-blue-500 to-blue-700'; // Default
}

function formatClock(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '--';
    }

    return date.toLocaleTimeString('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function WeatherBackgroundEffect({ code }: { code: number }) {
    const isSunny = code === 0;
    const isCloudy = [1, 2, 3, 45, 48, 71, 73, 75, 77, 85, 86].includes(code);
    const isRainy = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes float-cloud {
                    0% { transform: translateX(-5%) translateY(0); }
                    50% { transform: translateX(5%) translateY(10px); }
                    100% { transform: translateX(-5%) translateY(0); }
                }
                @keyframes rain-fall {
                    0% { transform: translateY(-100%) skewX(-10deg); }
                    100% { transform: translateY(100%) skewX(-10deg); }
                }
                @keyframes sun-spin {
                    0% { transform: rotate(0deg) scale(1); }
                    50% { transform: rotate(180deg) scale(1.1); }
                    100% { transform: rotate(360deg) scale(1); }
                }
            `}} />
            
            {isSunny && (
                <>
                    <div className="absolute -top-32 -right-32 w-96 h-96 bg-yellow-300/30 rounded-full blur-3xl mix-blend-overlay" style={{ animation: 'sun-spin 20s linear infinite' }}></div>
                    <div className="absolute top-10 right-10 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl" style={{ animation: 'sun-spin 15s linear infinite reverse' }}></div>
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl mix-blend-overlay" style={{ animation: 'sun-spin 25s ease-in-out infinite' }}></div>
                </>
            )}

            {isCloudy && (
                <>
                    <div className="absolute top-10 -left-20 w-80 h-32 bg-white/20 rounded-full blur-2xl" style={{ animation: 'float-cloud 20s ease-in-out infinite' }}></div>
                    <div className="absolute top-40 -right-20 w-96 h-40 bg-white/10 rounded-full blur-3xl" style={{ animation: 'float-cloud 25s ease-in-out infinite reverse' }}></div>
                    <div className="absolute -bottom-10 left-20 w-72 h-32 bg-white/10 rounded-full blur-2xl" style={{ animation: 'float-cloud 22s ease-in-out infinite' }}></div>
                </>
            )}

            {isRainy && (
                <>
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'linear-gradient(transparent, rgba(255,255,255,0.6) 50%, transparent)',
                        backgroundSize: '3px 60px',
                        backgroundRepeat: 'repeat',
                        animation: 'rain-fall 0.7s linear infinite'
                    }}></div>
                    <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: 'linear-gradient(transparent, rgba(255,255,255,0.4) 50%, transparent)',
                        backgroundSize: '2px 40px',
                        backgroundRepeat: 'repeat',
                        animation: 'rain-fall 1.1s linear infinite',
                        backgroundPosition: '15px 15px'
                    }}></div>
                    <div className="absolute top-0 left-0 right-0 h-40 bg-slate-900/40 blur-2xl"></div>
                </>
            )}
        </div>
    );
}

function formatDayLabel(dateIso: string, index: number) {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';

    const date = new Date(dateIso);
    if (Number.isNaN(date.getTime())) {
        return `Day ${index + 1}`;
    }

    return DAY_ABBR[date.getDay()];
}

export default function WeatherPage() {
    const [activeTab, setActiveTab] = useState<'today' | 'forecast' | 'insights'>('today');
    const [selectedLocation, setSelectedLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
    const [locationSearch, setLocationSearch] = useState('');
    const [searchResults, setSearchResults] = useState<GeoLocation[]>([DEFAULT_LOCATION]);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [weatherData, setWeatherData] = useState<WeatherForecast | null>(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [weatherError, setWeatherError] = useState('');

    useEffect(() => {
        try {
            const raw = localStorage.getItem('weatherLocation');
            if (!raw) {
                return;
            }

            const parsed = JSON.parse(raw) as Partial<GeoLocation>;
            if (
                typeof parsed.name === 'string' &&
                typeof parsed.latitude === 'number' &&
                typeof parsed.longitude === 'number' &&
                Number.isFinite(parsed.latitude) &&
                Number.isFinite(parsed.longitude) &&
                parsed.latitude >= -90 &&
                parsed.latitude <= 90 &&
                parsed.longitude >= -180 &&
                parsed.longitude <= 180
            ) {
                setSelectedLocation({
                    name: parsed.name,
                    state: parsed.state ?? '',
                    country: parsed.country ?? '',
                    latitude: parsed.latitude,
                    longitude: parsed.longitude,
                    timezone: parsed.timezone ?? 'auto',
                });
            }
        } catch {
            // Fall back to default location when localStorage is unavailable.
        }
    }, []);

    useEffect(() => {
        let active = true;

        async function loadWeather() {
            setLoadingWeather(true);
            setWeatherError('');
            try {
                const forecast = await fetchWeatherForecast(selectedLocation.latitude, selectedLocation.longitude, 7);
                if (!active) {
                    return;
                }

                setWeatherData(forecast);
                try {
                    localStorage.setItem('weatherLocation', JSON.stringify(selectedLocation));
                } catch {
                    // Ignore storage restrictions.
                }
            } catch {
                if (!active) {
                    return;
                }

                setWeatherError('Unable to refresh live weather right now. Showing cached/default values where possible.');
            } finally {
                if (active) {
                    setLoadingWeather(false);
                }
            }
        }

        void loadWeather();

        return () => {
            active = false;
        };
    }, [selectedLocation.latitude, selectedLocation.longitude, selectedLocation]);

    useEffect(() => {
        if (!showLocationPicker) {
            return;
        }

        const query = locationSearch.trim();

        // Validate query length
        if (query.length < 2) {
            setSearchResults([selectedLocation]);
            setLoadingSearch(false);
            return;
        }

        // Prevent excessively long queries
        if (query.length > 100) {
            setSearchResults([selectedLocation]);
            setLoadingSearch(false);
            return;
        }

        let active = true;
        const timer = window.setTimeout(async () => {
            setLoadingSearch(true);
            try {
                const results = await searchLocations(query, 8);
                if (!active) {
                    return;
                }

                setSearchResults(results.length ? results : [selectedLocation]);
            } catch {
                if (active) {
                    setSearchResults([selectedLocation]);
                }
            } finally {
                if (active) {
                    setLoadingSearch(false);
                }
            }
        }, 320);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [locationSearch, showLocationPicker, selectedLocation]);

    const forecastRows = useMemo(() => {
        if (!weatherData) {
            return [] as Array<{
                day: string;
                code: number;
                label: string;
                high: number;
                low: number;
                rain: number;
                rainMm: number;
            }>;
        }

        return weatherData.daily.time.map((dateIso, idx) => ({
            day: formatDayLabel(dateIso, idx),
            code: weatherData.daily.weatherCode[idx] ?? 0,
            label: weatherCodeToLabel(weatherData.daily.weatherCode[idx] ?? 0),
            high: weatherData.daily.tempMax[idx] ?? weatherData.current.temperature,
            low: weatherData.daily.tempMin[idx] ?? weatherData.current.temperature,
            rain: weatherData.daily.rainProbabilityMax[idx] ?? 0,
            rainMm: weatherData.daily.precipitationSum[idx] ?? 0,
        }));
    }, [weatherData]);

    const humidityTimeline = useMemo(() => {
        if (!weatherData) {
            return [] as Array<{ time: string; humidity: number }>;
        }

        const checkpoints = [6, 9, 12, 15, 18, 21];
        const hasHourlySeries = weatherData.hourly.time.length > 0 && weatherData.hourly.humidity.length > 0;

        return checkpoints.map((hour) => {
            if (!hasHourlySeries) {
                return {
                    time: `${hour}:00`,
                    humidity: weatherData.current.humidity,
                };
            }

            const marker = `T${String(hour).padStart(2, '0')}:00`;
            const idx = weatherData.hourly.time.findIndex((item) => item.includes(marker));
            const resolvedIdx = idx >= 0 ? idx : Math.min(hour, weatherData.hourly.humidity.length - 1);

            return {
                time: `${hour}:00`,
                humidity: weatherData.hourly.humidity[resolvedIdx] ?? weatherData.current.humidity,
            };
        });
    }, [weatherData]);

    const windData = useMemo(() => {
        if (!weatherData) {
            return {
                speed: 0,
                direction: 'N',
                gust: 0,
                angle: 0,
                forecast: [] as Array<{ time: string; speed: number; direction: string }>,
            };
        }

        const next12Hours = weatherData.hourly.windSpeed.slice(0, 12);
        const gust = Math.max(weatherData.current.windSpeed * 1.2, ...next12Hours);

        const windSlots = [
            { label: 'Morning', hour: 6 },
            { label: 'Afternoon', hour: 13 },
            { label: 'Evening', hour: 18 },
            { label: 'Night', hour: 22 },
        ];

        const slotForecast = windSlots.map((slot) => {
            const marker = `T${String(slot.hour).padStart(2, '0')}:00`;
            const idx = weatherData.hourly.time.findIndex((item) => item.includes(marker));
            const resolvedIdx = idx >= 0 ? idx : Math.min(slot.hour, weatherData.hourly.windSpeed.length - 1);
            const speed = weatherData.hourly.windSpeed[resolvedIdx] ?? weatherData.current.windSpeed;
            const direction = weatherData.hourly.windDirection[resolvedIdx] ?? weatherData.current.windDirection;

            return {
                time: slot.label,
                speed,
                direction: degToDirection(direction),
            };
        });

        return {
            speed: weatherData.current.windSpeed,
            direction: degToDirection(weatherData.current.windDirection),
            gust,
            angle: weatherData.current.windDirection,
            forecast: slotForecast,
        };
    }, [weatherData]);

    const rainfallData = useMemo(() => {
        if (!weatherData) {
            return [] as Array<{ week: string; rainfall: number; days: number }>;
        }

        const buckets = [
            { week: 'Days 1-2', start: 0, end: 2 },
            { week: 'Days 3-4', start: 2, end: 4 },
            { week: 'Days 5-6', start: 4, end: 6 },
            { week: 'Day 7', start: 6, end: 7 },
        ];

        return buckets.map((bucket) => {
            const rainSlice = weatherData.daily.precipitationSum.slice(bucket.start, bucket.end);
            const daySlice = weatherData.daily.rainProbabilityMax.slice(bucket.start, bucket.end);

            const rainfall = rainSlice.reduce((sum, value) => sum + value, 0);
            const rainyDays = daySlice.filter((probability) => probability >= 40).length;

            return {
                week: bucket.week,
                rainfall,
                days: rainyDays,
            };
        });
    }, [weatherData]);

    const totalRainfall = rainfallData.reduce((sum, point) => sum + point.rainfall, 0);
    const maxRainfall = Math.max(1, ...rainfallData.map((point) => point.rainfall));

    const advisoryAlerts = useMemo(() => {
        if (!weatherData) {
            return [];
        }

        return buildFarmingAlerts(weatherData);
    }, [weatherData]);

    const currentConditions = weatherData?.current;
    const todayForecast = forecastRows[0];
    const CurrentIcon = getWeatherIcon(currentConditions?.weatherCode ?? 0);

    const sprayWindowGood = (todayForecast?.rain ?? 0) < 35 && (currentConditions?.windSpeed ?? 0) <= 12;
    const fertilizerRisk = (todayForecast?.rain ?? 0) > 45 || (weatherData?.daily.precipitationSum[0] ?? 0) > 10;
    const harvestRisk =
        (todayForecast?.rain ?? 0) > 60 ||
        Math.max(0, ...(weatherData?.hourly.windSpeed.slice(0, 24) ?? [])) > 18;

    const rainAlerts = advisoryAlerts.filter(a => a.toLowerCase().includes('rain') || a.toLowerCase().includes('flood') || a.toLowerCase().includes('wet'));
    const stormAlerts = advisoryAlerts.filter(a => a.toLowerCase().includes('wind') || a.toLowerCase().includes('storm') || a.toLowerCase().includes('hail'));
    const heatwaveAlerts = advisoryAlerts.filter(a => a.toLowerCase().includes('heat') || a.toLowerCase().includes('warm') || a.toLowerCase().includes('dry'));
    const otherAlerts = advisoryAlerts.filter(a => !rainAlerts.includes(a) && !stormAlerts.includes(a) && !heatwaveAlerts.includes(a));

    return (
        <div className="space-y-6 p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Weather Intelligence</h2>
                    <p className="text-muted-foreground">Live forecasts and agricultural alerts for any location.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowLocationPicker((prev) => !prev)}
                            className="flex items-center gap-2 px-4 py-2 border border-border bg-white dark:bg-card rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <MapPin className="h-4 w-4 text-primary" />
                            {selectedLocation.name}{selectedLocation.state ? `, ${selectedLocation.state}` : ''}
                        </button>

                        {showLocationPicker && (
                            <div className="absolute top-full mt-2 right-0 bg-white dark:bg-card rounded-2xl border border-border shadow-xl z-10 p-3 w-72">
                                <div className="relative mb-2">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search city, town, district..."
                                        value={locationSearch}
                                        onChange={(event) => setLocationSearch(event.target.value)}
                                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                {loadingSearch ? (
                                    <div className="py-4 flex items-center justify-center text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-1 max-h-48 overflow-y-auto mb-2">
                                            {searchResults.map((location) => (
                                                <button
                                                    key={`${location.name}-${location.state}-${location.country}-${location.latitude}`}
                                                    onClick={() => {
                                                        setSelectedLocation(location);
                                                        setShowLocationPicker(false);
                                                        setLocationSearch('');
                                                    }}
                                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                                                        selectedLocation.name === location.name && selectedLocation.state === location.state
                                                            ? 'bg-primary/10 text-primary font-semibold'
                                                            : 'hover:bg-muted'
                                                    }`}
                                                >
                                                    <span className="font-medium">{location.name}</span>
                                                    <span className="text-muted-foreground text-xs ml-2">
                                                        {[location.state, location.country].filter(Boolean).join(', ')}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="pt-2 border-t border-border mt-2">
                                            <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">Popular</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {['Nagpur', 'Pune', 'Indore', 'Ludhiana', 'Jaipur', 'Hyderabad', 'Bangalore', 'Chennai'].map(city => (
                                                    <button 
                                                        key={city}
                                                        onClick={async () => {
                                                            setLoadingSearch(true);
                                                            try {
                                                                const results = await searchLocations(city, 1);
                                                                if (results.length > 0) {
                                                                    setSelectedLocation(results[0]);
                                                                    setShowLocationPicker(false);
                                                                    setLocationSearch('');
                                                                } else {
                                                                    setLocationSearch(city);
                                                                }
                                                            } catch (err) {
                                                                setLocationSearch(city);
                                                            } finally {
                                                                setLoadingSearch(false);
                                                            }
                                                        }}
                                                        className="px-2.5 py-1.5 text-xs rounded-lg bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                                                    >
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
                        {['today', 'forecast', 'insights'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as 'today' | 'forecast' | 'insights')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === tab
                                        ? 'bg-white dark:bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loadingWeather && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/40 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating live forecast...
                </div>
            )}

            {weatherError && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300">
                    {weatherError}
                </div>
            )}

            {!weatherData && !loadingWeather ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
                    Weather data is unavailable right now. Please try another location.
                </div>
            ) : null}

            {weatherData && activeTab === 'today' && (
                <div className="grid gap-6 md:grid-cols-2">
                    <div className={`rounded-2xl border-0 bg-gradient-to-br ${getWeatherBackground(currentConditions?.weatherCode ?? -1)} text-white p-8 shadow-xl relative overflow-hidden transition-all duration-1000`}>
                        <WeatherBackgroundEffect code={currentConditions?.weatherCode ?? 0} />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-blue-100 font-medium text-lg flex items-center gap-2">
                                        <Thermometer className="h-5 w-5" /> Current Weather
                                    </h3>
                                    <p className="text-sm text-blue-100/80 mt-1">
                                        {selectedLocation.name}{selectedLocation.state ? `, ${selectedLocation.state}` : ''}
                                    </p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/20">
                                    <CurrentIcon className="h-10 w-10 text-yellow-200" />
                                </div>
                            </div>

                            <div className="mt-8 flex items-baseline gap-2">
                                <span className="text-7xl font-bold tracking-tighter">{Math.round(currentConditions?.temperature ?? 0)}°</span>
                                <span className="text-2xl text-blue-100 font-medium">
                                    {weatherCodeToLabel(currentConditions?.weatherCode ?? 0)}
                                </span>
                            </div>

                            <div className="mt-2 text-blue-100 font-medium opacity-90">
                                Feels like: {Math.round(currentConditions?.apparentTemperature ?? 0)}° • High: {Math.round(todayForecast?.high ?? 0)}° • Low: {Math.round(todayForecast?.low ?? 0)}°
                            </div>

                            <div className="mt-8 grid grid-cols-4 gap-3 border-t border-white/10 pt-6">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1 text-blue-100/70 text-xs uppercase font-bold tracking-wider">
                                        <Wind className="h-3 w-3" /> Wind
                                    </div>
                                    <span className="font-semibold text-lg">{Math.round(currentConditions?.windSpeed ?? 0)} <span className="text-sm font-normal text-blue-200">km/h</span></span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1 text-blue-100/70 text-xs uppercase font-bold tracking-wider">
                                        <Droplets className="h-3 w-3" /> Humidity
                                    </div>
                                    <span className="font-semibold text-lg">{Math.round(currentConditions?.humidity ?? 0)}<span className="text-sm font-normal text-blue-200">%</span></span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1 text-blue-100/70 text-xs uppercase font-bold tracking-wider">
                                        <Eye className="h-3 w-3" /> Visibility
                                    </div>
                                    <span className="font-semibold text-lg">{Math.round((currentConditions?.visibility ?? 0) / 1000)} <span className="text-sm font-normal text-blue-200">km</span></span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1 text-blue-100/70 text-xs uppercase font-bold tracking-wider">
                                        <CloudRain className="h-3 w-3" /> Rain
                                    </div>
                                    <span className="font-semibold text-lg">{Math.round(todayForecast?.rain ?? 0)}<span className="text-sm font-normal text-blue-200">%</span></span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-6 text-sm">
                                <div className="flex items-center gap-2 text-blue-100">
                                    <Sunrise className="h-4 w-4 text-orange-300" />
                                    <span>Sunrise: {formatClock(weatherData.daily.sunrise[0] ?? '')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-100">
                                    <Sunset className="h-4 w-4 text-orange-400" />
                                    <span>Sunset: {formatClock(weatherData.daily.sunset[0] ?? '')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="bg-white dark:bg-card rounded-2xl border border-border p-6 shadow-sm flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <Droplets className="h-5 w-5 text-cyan-500" />
                                        Humidity Levels
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Hourly humidity pattern</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Gauge className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-lg font-bold">{Math.round(currentConditions?.humidity ?? 0)}%</span>
                                    <span className="text-xs text-muted-foreground">Current</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {humidityTimeline.map((point) => (
                                    <div key={point.time} className="flex items-center gap-4">
                                        <span className="text-xs font-medium text-muted-foreground w-12">{point.time}</span>
                                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    point.humidity > 70
                                                        ? 'bg-blue-500'
                                                        : point.humidity > 50
                                                            ? 'bg-cyan-500'
                                                            : 'bg-teal-500'
                                                }`}
                                                style={{ width: `${Math.max(0, Math.min(100, point.humidity))}%` }}
                                            ></div>
                                        </div>
                                        <span
                                            className={`text-sm font-bold w-12 text-right ${
                                                point.humidity > 70
                                                    ? 'text-blue-600'
                                                    : point.humidity > 50
                                                        ? 'text-cyan-600'
                                                        : 'text-teal-600'
                                            }`}
                                        >
                                            {Math.round(point.humidity)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {weatherData && activeTab === 'insights' && (
                <div className="space-y-6">
                    {advisoryAlerts.length > 0 ? (
                        <div className="space-y-3">
                            {rainAlerts.map((alert, idx) => (
                                <div key={`rain-${idx}`} className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 flex gap-4 items-start">
                                    <CloudRain className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-blue-800 dark:text-blue-300">Rain Alert</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">{alert}</p>
                                    </div>
                                </div>
                            ))}
                            {stormAlerts.map((alert, idx) => (
                                <div key={`storm-${idx}`} className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-xl p-4 flex gap-4 items-start">
                                    <Wind className="h-6 w-6 text-purple-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-purple-800 dark:text-purple-300">Storm Alert</h4>
                                        <p className="text-sm text-purple-700 dark:text-purple-400 mt-1 leading-relaxed">{alert}</p>
                                    </div>
                                </div>
                            ))}
                            {heatwaveAlerts.map((alert, idx) => (
                                <div key={`heat-${idx}`} className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4 flex gap-4 items-start">
                                    <Sun className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-red-800 dark:text-red-300">Heatwave Alert</h4>
                                        <p className="text-sm text-red-700 dark:text-red-400 mt-1 leading-relaxed">{alert}</p>
                                    </div>
                                </div>
                            ))}
                            {otherAlerts.map((alert, idx) => (
                                <div key={`other-${idx}`} className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-xl p-4 flex gap-4 items-start">
                                    <AlertTriangle className="h-6 w-6 text-orange-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-orange-800 dark:text-orange-300">Weather Advisory</h4>
                                        <p className="text-sm text-orange-700 dark:text-orange-400 mt-1 leading-relaxed">{alert}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl p-4 flex gap-4 items-start">
                            <AlertTriangle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-green-800 dark:text-green-300">No Critical Alert</h4>
                                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                    Conditions are stable for routine farm operations in {selectedLocation.name}.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm p-6 flex flex-col">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <CalendarCheck className="h-5 w-5 text-primary" />
                                Farming Suitability Outlook
                            </h3>

                            <div className="space-y-4 flex-1">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-full">
                                            <Droplets className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Spraying</h4>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {sprayWindowGood ? 'Wind and rain risk are suitable for spray operations' : 'Wait for lower wind and rain probability'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${sprayWindowGood ? 'bg-green-200/50 text-green-700 border-green-200/50' : 'bg-amber-200/50 text-amber-700 border-amber-200/50'}`}>
                                        {sprayWindowGood ? 'Excellent' : 'Moderate'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-full">
                                            <Sprout className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Fertilizer Application</h4>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {fertilizerRisk ? 'Rainfall is high; delay top dressing to reduce nutrient wash-off' : 'Favorable window for split fertilizer dose'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${fertilizerRisk ? 'bg-red-200/50 text-red-700 border-red-200/50' : 'bg-amber-200/50 text-amber-700 border-amber-200/50'}`}>
                                        {fertilizerRisk ? 'Avoid' : 'Moderate'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 dark:bg-red-900/30 p-2.5 rounded-full">
                                            <Wind className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground">Harvesting</h4>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {harvestRisk ? 'Wind or rain intensity is high for safe harvest handling' : 'Harvest operations can proceed with normal caution'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${harvestRisk ? 'bg-red-200/50 text-red-700 border-red-200/50' : 'bg-green-200/50 text-green-700 border-green-200/50'}`}>
                                        {harvestRisk ? 'Avoid' : 'Good'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card rounded-2xl border border-border p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <Thermometer className="h-5 w-5 text-red-500" />
                                        Temperature Trends
                                    </h3>
                                    <p className="text-sm text-muted-foreground">7-day high and low range</p>
                                </div>
                                <div className="flex gap-3 text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                                        <span>High</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                                        <span>Low</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-52 flex items-end gap-2 px-2">
                                {forecastRows.map((day) => (
                                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1 group">
                                        <div className="relative w-full flex flex-col items-center">
                                            <div className="w-full flex flex-col items-center justify-end" style={{ height: '160px' }}>
                                                <div
                                                    className="w-3 rounded-full bg-gradient-to-t from-blue-400 to-red-400 relative group-hover:w-4 transition-all"
                                                    style={{
                                                        height: `${Math.max(8, ((day.high - day.low) / 24) * 130)}px`,
                                                        marginBottom: `${Math.max(6, ((day.low + 5) / 40) * 100)}px`,
                                                    }}
                                                >
                                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-red-600">{Math.round(day.high)}°</div>
                                                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-600">{Math.round(day.low)}°</div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground mt-4">{day.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {weatherData && activeTab === 'forecast' && (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/20">
                            <h3 className="font-bold text-lg">7-Day Forecast</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                {forecastRows.map((day) => {
                                    const DayIcon = getWeatherIcon(day.code);
                                    return (
                                        <div key={day.day} className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border group">
                                            <span className="text-sm font-bold mb-3 text-muted-foreground group-hover:text-primary transition-colors">{day.day}</span>
                                            <DayIcon className="h-10 w-10 text-muted-foreground mb-3 group-hover:scale-110 transition-transform duration-300" />
                                            <span className="text-2xl font-bold tracking-tight">{Math.round(day.high)}°</span>
                                            <span className="text-sm text-muted-foreground">{Math.round(day.low)}°</span>
                                            <span className="text-xs text-muted-foreground mt-1 font-medium text-center">{day.label}</span>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-blue-500">
                                                <Droplets className="h-3 w-3" />
                                                {Math.round(day.rain)}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-card rounded-2xl border border-border p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <Wind className="h-5 w-5 text-slate-500" />
                                        Wind Speed & Direction
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Live wind conditions and daily phases</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="relative h-40 w-40">
                                        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                                        <div className="absolute inset-2 rounded-full border-2 border-muted/50"></div>

                                        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-bold">N</span>
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">S</span>
                                        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">W</span>
                                        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">E</span>

                                        <div
                                            className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
                                            style={{ transform: `rotate(${windData.angle}deg)` }}
                                        >
                                            <div className="h-16 w-1 bg-gradient-to-t from-transparent via-primary to-primary rounded-full relative">
                                                <Navigation className="absolute -top-2 left-1/2 -translate-x-1/2 h-5 w-5 text-primary fill-primary" />
                                            </div>
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-4 w-4 rounded-full bg-primary shadow-lg"></div>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm font-medium">
                                        Direction: <span className="text-primary font-bold">{windData.direction}</span>
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-muted/30 rounded-xl">
                                        <p className="text-xs text-muted-foreground font-medium">Current Speed</p>
                                        <p className="text-3xl font-bold">{Math.round(windData.speed)} <span className="text-lg font-normal text-muted-foreground">km/h</span></p>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-xl">
                                        <p className="text-xs text-muted-foreground font-medium">Peak Gust (12h)</p>
                                        <p className="text-2xl font-bold text-amber-600">{Math.round(windData.gust)} <span className="text-base font-normal text-muted-foreground">km/h</span></p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {windData.forecast.map((slot) => (
                                            <div key={slot.time} className="p-2 bg-muted/20 rounded-lg text-center">
                                                <p className="text-xs text-muted-foreground">{slot.time}</p>
                                                <p className="text-sm font-bold">{Math.round(slot.speed)} km/h {slot.direction}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-card rounded-2xl border border-border p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <CloudRain className="h-5 w-5 text-blue-500" />
                                        Rainfall Distribution
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Next 7-day precipitation split</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">{totalRainfall.toFixed(1)}mm</p>
                                    <p className="text-xs text-muted-foreground">Expected total</p>
                                </div>
                            </div>

                            <div className="h-48 flex items-end gap-4">
                                {rainfallData.map((point) => (
                                    <div key={point.week} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full">
                                            <div
                                                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all group-hover:from-blue-600 group-hover:to-blue-500"
                                                style={{
                                                    height: `${(point.rainfall / maxRainfall) * 140}px`,
                                                    minHeight: point.rainfall > 0 ? '16px' : '4px',
                                                }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium">
                                                    {point.rainfall.toFixed(1)}mm ({point.days} rainy days)
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground">{point.week}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
