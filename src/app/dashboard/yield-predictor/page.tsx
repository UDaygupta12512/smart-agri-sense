'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    BookOpen,
    CheckCircle2,
    Cpu,
    Leaf,
    LineChart,
    MapPin,
    Save,
    Thermometer,
    Trash2,
    TrendingUp,
} from 'lucide-react';
import { buildYieldWeatherContext, clamp, type YieldWeatherContext } from '@/lib/agriWeather';

type SeasonType = 'Kharif (Monsoon)' | 'Rabi (Winter)' | 'Zaid (Summer)';
type SoilHealthType = 'Excellent' | 'Good' | 'Poor';
type IrrigationType = 'Tube-well' | 'Rainfed' | 'Micro-Irrigation (Drip/Sprinkler)';
type TopographyType = 'Plains' | 'Hilly' | 'Coastal';

interface CropModel {
    baseYield: number;
    msp: number;
    hasMsp: boolean;
    recommendedSeasons: SeasonType[];
    optimalTemp: [number, number];
    optimalRainProbability: [number, number];
    optimalPh: [number, number];
    pestSensitivity: 'low' | 'medium' | 'high';
}

interface YieldResult {
    crop: string;
    location: string;
    area: number;
    expectedYield: string;
    yieldPerAcre: string;
    accuracy: string;
    weatherSource: 'live' | 'fallback';
    financial: {
        estimatedRevenue: string;
        mspRevenue: string;
        marketTrend: string;
    };
    factors: {
        weatherImpact: string;
        soilImpact: string;
        pestRisk: string;
    };
    alternateScenario?: {
        name: string;
        expectedYield: string;
        yieldPerAcre: string;
        estimatedRevenue: string;
        improvementPct: string;
    };
    savedAt?: string;
}

const CROP_MODELS: Record<string, CropModel> = {
    Wheat: {
        baseYield: 22,
        msp: 2425,
        hasMsp: true,
        recommendedSeasons: ['Rabi (Winter)'],
        optimalTemp: [14, 26],
        optimalRainProbability: [20, 45],
        optimalPh: [6.0, 7.5],
        pestSensitivity: 'medium',
    },
    Rice: {
        baseYield: 26,
        msp: 2400,
        hasMsp: true,
        recommendedSeasons: ['Kharif (Monsoon)'],
        optimalTemp: [22, 34],
        optimalRainProbability: [45, 85],
        optimalPh: [5.5, 7.0],
        pestSensitivity: 'high',
    },
    Cotton: {
        baseYield: 10,
        msp: 7521,
        hasMsp: true,
        recommendedSeasons: ['Kharif (Monsoon)'],
        optimalTemp: [22, 36],
        optimalRainProbability: [35, 70],
        optimalPh: [6.0, 8.0],
        pestSensitivity: 'high',
    },
    Sugarcane: {
        baseYield: 350,
        msp: 355,
        hasMsp: true,
        recommendedSeasons: ['Kharif (Monsoon)', 'Zaid (Summer)'],
        optimalTemp: [22, 35],
        optimalRainProbability: [30, 70],
        optimalPh: [6.0, 7.8],
        pestSensitivity: 'medium',
    },
    Soybean: {
        baseYield: 18,
        msp: 4892,
        hasMsp: true,
        recommendedSeasons: ['Kharif (Monsoon)'],
        optimalTemp: [20, 33],
        optimalRainProbability: [40, 75],
        optimalPh: [6.0, 7.5],
        pestSensitivity: 'medium',
    },
    Maize: {
        baseYield: 25,
        msp: 2325,
        hasMsp: true,
        recommendedSeasons: ['Kharif (Monsoon)', 'Rabi (Winter)'],
        optimalTemp: [18, 34],
        optimalRainProbability: [30, 65],
        optimalPh: [5.8, 7.2],
        pestSensitivity: 'medium',
    },
    Mustard: {
        baseYield: 12,
        msp: 5950,
        hasMsp: true,
        recommendedSeasons: ['Rabi (Winter)'],
        optimalTemp: [12, 26],
        optimalRainProbability: [15, 40],
        optimalPh: [6.0, 7.5],
        pestSensitivity: 'low',
    },
    Groundnut: {
        baseYield: 15,
        msp: 6983,
        hasMsp: true,
        recommendedSeasons: ['Kharif (Monsoon)', 'Zaid (Summer)'],
        optimalTemp: [20, 34],
        optimalRainProbability: [30, 60],
        optimalPh: [6.0, 7.5],
        pestSensitivity: 'medium',
    },
    Bajra: {
        baseYield: 12,
        msp: 2825,
        hasMsp: true,
        recommendedSeasons: ['Kharif (Monsoon)'],
        optimalTemp: [25, 38],
        optimalRainProbability: [25, 55],
        optimalPh: [6.5, 8.0],
        pestSensitivity: 'medium',
    },
    'Jowar (Sorghum)': {
        baseYield: 14,
        msp: 3571,
        hasMsp: true,
        recommendedSeasons: ['Kharif (Monsoon)', 'Rabi (Winter)'],
        optimalTemp: [25, 35],
        optimalRainProbability: [25, 60],
        optimalPh: [6.0, 7.5],
        pestSensitivity: 'medium',
    },
    Potato: {
        baseYield: 100,
        msp: 2500,
        hasMsp: false,
        recommendedSeasons: ['Rabi (Winter)'],
        optimalTemp: [15, 25],
        optimalRainProbability: [20, 45],
        optimalPh: [5.5, 6.5],
        pestSensitivity: 'high',
    },
    Tomato: {
        baseYield: 120,
        msp: 2000,
        hasMsp: false,
        recommendedSeasons: ['Kharif (Monsoon)', 'Rabi (Winter)'],
        optimalTemp: [18, 30],
        optimalRainProbability: [25, 55],
        optimalPh: [6.0, 7.0],
        pestSensitivity: 'high',
    },
    Onion: {
        baseYield: 80,
        msp: 1800,
        hasMsp: false,
        recommendedSeasons: ['Rabi (Winter)'],
        optimalTemp: [15, 28],
        optimalRainProbability: [20, 45],
        optimalPh: [6.0, 7.5],
        pestSensitivity: 'medium',
    },
    Barley: {
        baseYield: 20,
        msp: 1980,
        hasMsp: true,
        recommendedSeasons: ['Rabi (Winter)'],
        optimalTemp: [12, 24],
        optimalRainProbability: [15, 40],
        optimalPh: [6.0, 7.5],
        pestSensitivity: 'low',
    },
    'Chana (Chickpea)': {
        baseYield: 10,
        msp: 5650,
        hasMsp: true,
        recommendedSeasons: ['Rabi (Winter)'],
        optimalTemp: [15, 28],
        optimalRainProbability: [15, 40],
        optimalPh: [6.0, 8.0],
        pestSensitivity: 'medium',
    },
};

function getSeasonMultiplier(model: CropModel, season: SeasonType) {
    return model.recommendedSeasons.includes(season) ? 1 : 0.8;
}

function getSoilMultiplier(soilHealth: SoilHealthType, soilPh: number, phRange: [number, number], soilType: string) {
    const healthMu = soilHealth === 'Excellent' ? 1.15 : soilHealth === 'Good' ? 1.0 : 0.78;
    const [phMin, phMax] = phRange;

    let phMu = 1;
    if (soilPh < phMin) {
        phMu -= Math.min(0.2, (phMin - soilPh) * 0.08);
    } else if (soilPh > phMax) {
        phMu -= Math.min(0.2, (soilPh - phMax) * 0.08);
    }

    // Soil type factor
    const soilFactors: Record<string, number> = {
        'Loamy': 1.0,
        'Alluvial': 1.05,
        'Black (Vertisol)': 1.02,
        'Red': 0.92,
        'Sandy': 0.85,
        'Clay': 0.95,
        'Laterite': 0.88,
    };
    const soilFactor = soilFactors[soilType] ?? 1.0;

    return clamp(healthMu * phMu * soilFactor, 0.55, 1.30);
}

function getIrrigationMultiplier(irrigation: IrrigationType, weather: YieldWeatherContext | null) {
    let multiplier = 1;

    if (irrigation === 'Rainfed') {
        multiplier = 0.9;
        if (weather) {
            if (weather.avgRainProbability < 30) multiplier -= 0.12;
            if (weather.avgRainProbability > 65) multiplier += 0.06;
        }
    }

    if (irrigation === 'Tube-well') {
        multiplier = 1.05;
    }

    if (irrigation === 'Micro-Irrigation (Drip/Sprinkler)') {
        multiplier = 1.18;
    }

    return clamp(multiplier, 0.68, 1.25);
}

function getTopographyMultiplier(topography: TopographyType, cropName: string) {
    if (topography === 'Plains') {
        return 1;
    }

    if (topography === 'Hilly') {
        if (['Wheat', 'Mustard', 'Barley'].includes(cropName)) return 0.92;
        if (['Potato', 'Tomato'].includes(cropName)) return 0.95;
        return 0.86;
    }

    if (topography === 'Coastal') {
        if (cropName === 'Rice') return 1.07;
        if (['Groundnut', 'Onion'].includes(cropName)) return 0.98;
        return 0.93;
    }

    return 1;
}

function getWeatherMultiplier(model: CropModel, weather: YieldWeatherContext | null, irrigation: IrrigationType) {
    if (!weather) {
        return 0.96;
    }

    const [tempMin, tempMax] = model.optimalTemp;
    const idealTemp = (tempMin + tempMax) / 2;
    const tempTolerance = (tempMax - tempMin) / 2;
    const tempDeviation = Math.abs(weather.avgTemp - idealTemp);
    const tempPenalty = Math.max(0, tempDeviation - tempTolerance) * 0.018;
    const tempMu = 1 - tempPenalty;

    const [rainMin, rainMax] = model.optimalRainProbability;
    let rainMu = 1;
    if (weather.avgRainProbability < rainMin) {
        rainMu -= (rainMin - weather.avgRainProbability) * 0.004;
    }
    if (weather.avgRainProbability > rainMax) {
        rainMu -= (weather.avgRainProbability - rainMax) * 0.0035;
    }

    if (irrigation === 'Rainfed' && weather.avgRainProbability < 35) {
        rainMu -= 0.08;
    }

    if (irrigation === 'Micro-Irrigation (Drip/Sprinkler)' && weather.avgRainProbability < rainMin) {
        rainMu += 0.05;
    }

    return clamp(tempMu * rainMu, 0.72, 1.12);
}

function getPestRisk(model: CropModel, weather: YieldWeatherContext | null, season: SeasonType) {
    let score = model.pestSensitivity === 'high' ? 60 : model.pestSensitivity === 'medium' ? 45 : 30;

    if (weather) {
        if (weather.avgHumidity >= 78) score += 12;
        if (weather.avgHumidity >= 65 && weather.avgHumidity < 78) score += 6;
        if (weather.avgTemp >= 30) score += 5;
    }

    if (season === 'Kharif (Monsoon)') score += 8;
    if (season === 'Rabi (Winter)' && model.pestSensitivity === 'low') score -= 4;

    const bounded = clamp(score, 20, 85);
    const impactPercent = Math.round(clamp(bounded / 10, 2, 9));
    const riskBand = bounded >= 65 ? 'High' : bounded >= 45 ? 'Moderate' : 'Low';

    return {
        impactPercent,
        riskBand,
        message: `${riskBand} risk (~${impactPercent}% potential yield drag). Prioritize field scouting every 5-7 days and follow threshold-based spray decisions.`,
    };
}

function toCurrency(value: number) {
    return `₹ ${Math.round(value).toLocaleString('en-IN')}`;
}

export default function YieldPredictorPage() {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<YieldResult | null>(null);
    const [inputError, setInputError] = useState('');

    const [crop, setCrop] = useState('Wheat');
    const [customCropName, setCustomCropName] = useState('');
    const [customBaseYield, setCustomBaseYield] = useState(18);
    const [customMsp, setCustomMsp] = useState(2500);

    const [location, setLocation] = useState('Nagpur');
    const [area, setArea] = useState(5);
    const [soilHealth, setSoilHealth] = useState<SoilHealthType>('Good');
    const [soilPh, setSoilPh] = useState(6.8);
    const [soilTypeField, setSoilTypeField] = useState('Loamy');
    const [season, setSeason] = useState<SeasonType>('Kharif (Monsoon)');
    const [irrigation, setIrrigation] = useState<IrrigationType>('Tube-well');
    const [topography, setTopography] = useState<TopographyType>('Plains');
    const [lastSeasonYield, setLastSeasonYield] = useState<number | ''>('');

    const [latestWeatherContext, setLatestWeatherContext] = useState<YieldWeatherContext | null>(null);
    const [savedPredictions, setSavedPredictions] = useState<YieldResult[]>(() => {
        if (typeof window === 'undefined') {
            return [];
        }

        try {
            const stored = window.localStorage.getItem('savedYieldPredictions');
            if (!stored) {
                return [];
            }

            const parsed = JSON.parse(stored) as YieldResult[];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });
    const [showSaved, setShowSaved] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    // What-If Scenario States
    const [rainDev, setRainDev] = useState(0);
    const [fertUsage, setFertUsage] = useState(100);
    const [pestControl, setPestControl] = useState(50);

    const activeCropModel: CropModel =
        crop === 'Custom'
            ? {
                baseYield: customBaseYield,
                msp: customMsp,
                hasMsp: false,
                recommendedSeasons: ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)'],
                optimalTemp: [18, 32],
                optimalRainProbability: [25, 65],
                optimalPh: [6.0, 7.5],
                pestSensitivity: 'medium',
            }
            : CROP_MODELS[crop];

    const cropLabel = crop === 'Custom' ? (customCropName.trim() || 'Custom Crop') : crop;

    const handlePredict = async () => {
        setInputError('');
        setResult(null);
        setRainDev(0);
        setFertUsage(100);
        setPestControl(50);

        // Validate location
        const trimmedLocation = location.trim();
        if (!trimmedLocation) {
            setInputError('Please enter a location for weather-normalized prediction.');
            return;
        }

        if (trimmedLocation.length < 2) {
            setInputError('Location name must be at least 2 characters.');
            return;
        }

        if (trimmedLocation.length > 100) {
            setInputError('Location name is too long. Maximum 100 characters.');
            return;
        }

        // Validate area
        if (!Number.isFinite(area) || area <= 0) {
            setInputError('Cultivation area must be greater than 0.');
            return;
        }

        if (area > 10000) {
            setInputError('Cultivation area cannot exceed 10,000 acres. Please enter a realistic value.');
            return;
        }

        // Validate soil pH
        if (!Number.isFinite(soilPh) || soilPh < 3.5 || soilPh > 9.5) {
            setInputError('Soil pH must be between 3.5 and 9.5.');
            return;
        }

        // Validate custom crop inputs
        if (crop === 'Custom') {
            if (!customCropName.trim()) {
                setInputError('Please provide a custom crop name.');
                return;
            }

            if (customCropName.trim().length > 50) {
                setInputError('Custom crop name is too long. Maximum 50 characters.');
                return;
            }

            if (!Number.isFinite(customBaseYield) || customBaseYield <= 0) {
                setInputError('Custom base yield must be a positive number.');
                return;
            }

            if (customBaseYield > 500) {
                setInputError('Custom base yield seems too high. Maximum 500 qtl/acre.');
                return;
            }

            if (!Number.isFinite(customMsp) || customMsp <= 0) {
                setInputError('Custom MSP must be a positive number.');
                return;
            }

            if (customMsp > 100000) {
                setInputError('Custom MSP seems too high. Maximum ₹100,000/qtl.');
                return;
            }
        }

        // Validate last season yield if provided
        if (typeof lastSeasonYield === 'number' && lastSeasonYield !== 0) {
            if (lastSeasonYield < 0) {
                setInputError('Last season yield cannot be negative.');
                return;
            }
            if (lastSeasonYield > 500) {
                setInputError('Last season yield seems too high. Maximum 500 qtl/acre.');
                return;
            }
        }

        setAnalyzing(true);

        let weatherContext: YieldWeatherContext | null = null;
        try {
            weatherContext = await buildYieldWeatherContext(location);
            setLatestWeatherContext(weatherContext);
        } catch {
            weatherContext = null;
            setLatestWeatherContext(null);
        }

        const seasonMu = getSeasonMultiplier(activeCropModel, season);
        const soilMu = getSoilMultiplier(soilHealth, soilPh, activeCropModel.optimalPh, soilTypeField);
        const irrigationMu = getIrrigationMultiplier(irrigation, weatherContext);
        const weatherMu = getWeatherMultiplier(activeCropModel, weatherContext, irrigation);
        const topographyMu = getTopographyMultiplier(topography, cropLabel);
        const pestRisk = getPestRisk(activeCropModel, weatherContext, season);
        const pestMu = 1 - pestRisk.impactPercent / 100;

        const normalizedLastYield = typeof lastSeasonYield === 'number' && lastSeasonYield > 0 ? lastSeasonYield : null;
        const calibratedBaseYield = normalizedLastYield
            ? (activeCropModel.baseYield * 0.65) + (normalizedLastYield * 0.35)
            : activeCropModel.baseYield;

        const finalYieldPerAcre = calibratedBaseYield * seasonMu * soilMu * irrigationMu * weatherMu * topographyMu * pestMu;
        const totalYield = finalYieldPerAcre * area;

        const marketPremium =
            finalYieldPerAcre >= calibratedBaseYield * 1.08
                ? 0.11
                : finalYieldPerAcre >= calibratedBaseYield
                    ? 0.06
                    : -0.03;

        const mspRevenue = totalYield * activeCropModel.msp;
        const marketRevenue = mspRevenue * (1 + marketPremium);

        const spreadPenalty =
            Math.abs(1 - seasonMu) +
            Math.abs(1 - soilMu) +
            Math.abs(1 - irrigationMu) +
            Math.abs(1 - weatherMu) +
            Math.abs(1 - topographyMu);

        let accuracy = 93 - (spreadPenalty * 12);
        if (!weatherContext) accuracy -= 10;
        if (crop === 'Custom') accuracy -= 7;
        if (normalizedLastYield) accuracy += 2;
        accuracy = clamp(accuracy, 68, 96);

        const weatherImpact = weatherContext
            ? `Live weather (${weatherContext.locationLabel}): avg temp ${weatherContext.avgTemp.toFixed(1)}°C, rain chance ${weatherContext.avgRainProbability.toFixed(0)}%, humidity ${weatherContext.avgHumidity.toFixed(0)}%. Weather multiplier ${weatherMu.toFixed(2)}x.`
            : `Live weather was unavailable. A fallback climatology factor was used with multiplier ${weatherMu.toFixed(2)}x.`;

        const soilImpact = `Soil health ${soilHealth}, pH ${soilPh.toFixed(1)}, type ${soilTypeField}. Soil multiplier ${soilMu.toFixed(2)}x (${activeCropModel.optimalPh[0]}-${activeCropModel.optimalPh[1]} optimal pH range for ${cropLabel}).`;
        const pestImpact = `${pestRisk.message} Pest multiplier ${pestMu.toFixed(2)}x.`;

        const optimizedSoilMu = getSoilMultiplier('Excellent', (activeCropModel.optimalPh[0] + activeCropModel.optimalPh[1]) / 2, activeCropModel.optimalPh, soilTypeField);
        const optimizedIrrigationMu = getIrrigationMultiplier('Micro-Irrigation (Drip/Sprinkler)', weatherContext);
        const optimizedPestMu = clamp(pestMu + 0.15, 0, 1);
        const optimizedYieldPerAcre = calibratedBaseYield * seasonMu * optimizedSoilMu * optimizedIrrigationMu * weatherMu * topographyMu * optimizedPestMu;
        const optimizedTotalYield = optimizedYieldPerAcre * area;
        const optimizedMarketRevenue = optimizedTotalYield * activeCropModel.msp * (1 + marketPremium);
        const improvementPct = (((optimizedTotalYield - totalYield) / totalYield) * 100).toFixed(1);

        const fallbackResult: YieldResult = {
            crop: cropLabel,
            location: weatherContext?.locationLabel ?? location,
            area,
            expectedYield: totalYield.toFixed(1),
            yieldPerAcre: finalYieldPerAcre.toFixed(2),
            accuracy: accuracy.toFixed(1),
            weatherSource: weatherContext ? 'live' as const : 'fallback' as const,
            financial: {
                estimatedRevenue: toCurrency(marketRevenue),
                mspRevenue: toCurrency(mspRevenue),
                marketTrend:
                    marketPremium >= 0.1
                        ? 'Bullish (+11% over MSP assumption)'
                        : marketPremium > 0
                            ? 'Positive (+6% over MSP assumption)'
                            : 'Weak market scenario (-3% below MSP assumption)',
            },
            factors: {
                weatherImpact,
                soilImpact,
                pestRisk: pestImpact,
            },
            alternateScenario: {
                name: 'Optimized (Drip Irrigation + Excellent Soil)',
                expectedYield: optimizedTotalYield.toFixed(1),
                yieldPerAcre: optimizedYieldPerAcre.toFixed(2),
                estimatedRevenue: toCurrency(optimizedMarketRevenue),
                improvementPct: improvementPct,
            }
        };

        try {
            const aiResponse = await fetch('/api/yield-predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crop: cropLabel,
                    area,
                    location,
                    soilHealth,
                    soilPh,
                    soilTypeField,
                    season,
                    irrigation,
                    topography,
                    lastSeasonYield,
                    weatherContext,
                    baseExpectedYield: totalYield,
                    baseYieldPerAcre: finalYieldPerAcre
                })
            });

            if (aiResponse.ok) {
                const data = await aiResponse.json();
                if (data.prediction && data.source === 'ai') {
                    setResult({ ...data.prediction, weatherSource: weatherContext ? 'live' : 'fallback' });
                    setAnalyzing(false);
                    return;
                }
            }
        } catch (error) {
            console.error("AI prediction failed, falling back to local math algorithm:", error);
        }

        // Fallback to mathematical estimation if AI fails
        setResult(fallbackResult);
        setAnalyzing(false);
    };

    const savePrediction = () => {
        if (!result) return;
        const toSave = { ...result, savedAt: new Date().toLocaleDateString('en-IN') };
        const updated = [toSave, ...savedPredictions.slice(0, 4)];
        setSavedPredictions(updated);
        try { localStorage.setItem('savedYieldPredictions', JSON.stringify(updated)); } catch {}
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1800);
    };

    const deleteSaved = (idx: number) => {
        const updated = savedPredictions.filter((_, i) => i !== idx);
        setSavedPredictions(updated);
        try { localStorage.setItem('savedYieldPredictions', JSON.stringify(updated)); } catch {}
    };

    const baseExpectedYield = result ? parseFloat(result.expectedYield) || 0 : 0;
    const baseYieldPerAcre = result ? parseFloat(result.yieldPerAcre) || 0 : 0;
    const rainMu = 1 + (rainDev / 100) * 0.5;
    const fertMu = fertUsage < 100 ? (fertUsage / 100) : (1 + (fertUsage - 100) / 250);
    const pestMu = 1 + (pestControl - 50) / 100 * 0.4;
    const whatIfMu = rainMu * fertMu * pestMu;
    
    const displayYield = baseExpectedYield * whatIfMu;
    const displayYieldPerAcre = baseYieldPerAcre * whatIfMu;
    
    const parsedRev = result ? parseInt(result.financial.estimatedRevenue.replace(/[^0-9]/g, '')) || 0 : 0;
    const displayRevenue = result ? `₹ ${Math.round(parsedRev * whatIfMu).toLocaleString('en-IN')}` : '';

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 min-h-screen font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-xl">
                            <Cpu className="h-8 w-8 text-primary" />
                        </div>
                        AI Yield Predictor
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-xl text-lg">
                        Data-driven yield simulation using crop model parameters, soil health, and live weather context.
                    </p>
                </div>
                <button
                    onClick={() => setShowSaved(!showSaved)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        showSaved ? 'bg-primary text-white' : 'border border-border bg-white dark:bg-card hover:bg-muted'
                    }`}
                >
                    <BookOpen className="h-4 w-4" />
                    Saved ({savedPredictions.length})
                </button>
            </div>

            {showSaved && (
                <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 shadow-sm animate-in slide-in-from-top-4">
                    <h3 className="font-bold mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Saved Predictions</h3>
                    {savedPredictions.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No saved predictions yet. Run a prediction and click Save.</p>
                    ) : (
                        <div className="space-y-2">
                            {savedPredictions.map((prediction, i) => (
                                <div key={`${prediction.crop}-${prediction.savedAt}-${i}`} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                                    <div>
                                        <p className="font-semibold text-sm">{prediction.crop} — {prediction.area} acres</p>
                                        <p className="text-xs text-muted-foreground">
                                            {prediction.location} • {prediction.expectedYield} qtl • {prediction.financial.estimatedRevenue} • {prediction.savedAt}
                                        </p>
                                    </div>
                                    <button onClick={() => deleteSaved(i)} className="p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {inputError && (
                <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
                    {inputError}
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Simulation Parameters
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Target Crop</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={crop}
                                    onChange={(event) => setCrop(event.target.value)}
                                >
                                    {Object.keys(CROP_MODELS).map((option) => <option key={option}>{option}</option>)}
                                    <option>Custom</option>
                                </select>
                            </div>

                            {crop === 'Custom' ? (
                                <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/20 p-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground">Custom Crop Name</label>
                                        <input
                                            value={customCropName}
                                            onChange={(event) => setCustomCropName(event.target.value)}
                                            placeholder="e.g. Banana, Papaya"
                                            className="w-full p-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-foreground">Base Yield (qtl/acre)</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={500}
                                                step={0.1}
                                                value={customBaseYield}
                                                onChange={(event) => {
                                                    const val = event.target.value === '' ? 18 : parseFloat(event.target.value);
                                                    setCustomBaseYield(Number.isNaN(val) || val < 1 ? 18 : clamp(val, 1, 500));
                                                }}
                                                onBlur={(event) => {
                                                    const val = parseFloat(event.target.value);
                                                    if (Number.isNaN(val) || val < 1) {
                                                        setCustomBaseYield(18);
                                                    }
                                                }}
                                                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-foreground">MSP/Rate (₹/qtl)</label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={100000}
                                                step={1}
                                                value={customMsp}
                                                onChange={(event) => {
                                                    const val = event.target.value === '' ? 2500 : parseFloat(event.target.value);
                                                    setCustomMsp(Number.isNaN(val) || val < 1 ? 2500 : clamp(val, 1, 100000));
                                                }}
                                                onBlur={(event) => {
                                                    const val = parseFloat(event.target.value);
                                                    if (Number.isNaN(val) || val < 1) {
                                                        setCustomMsp(2500);
                                                    }
                                                }}
                                                className="w-full p-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    {activeCropModel.hasMsp ? 'MSP' : 'Est. Market Price'} {(() => { const now = new Date(); const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; return `${y}-${String(y + 1).slice(2)}`; })()} baseline: ₹{activeCropModel.msp.toLocaleString('en-IN')}/qtl
                                </p>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Location (for live weather fit)</label>
                                <input
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                    placeholder="City / District"
                                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Cultivation Area (Acres)</label>
                                <input
                                    type="number"
                                    min={0.1}
                                    max={10000}
                                    step={0.1}
                                    value={area}
                                    onChange={(event) => {
                                        const val = event.target.value === '' ? 0.1 : parseFloat(event.target.value);
                                        setArea(Number.isNaN(val) || val < 0.1 ? 0.1 : clamp(val, 0.1, 10000));
                                    }}
                                    onBlur={(event) => {
                                        const val = parseFloat(event.target.value);
                                        if (Number.isNaN(val) || val < 0.1) {
                                            setArea(1);
                                        }
                                    }}
                                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-foreground">Current Soil Index</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={soilHealth}
                                        onChange={(event) => setSoilHealth(event.target.value as SoilHealthType)}
                                    >
                                        <option>Excellent</option>
                                        <option>Good</option>
                                        <option>Poor</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-foreground">Soil pH</label>
                                    <input
                                        type="number"
                                        min={3.5}
                                        max={9.5}
                                        step={0.1}
                                        value={soilPh}
                                        onChange={(event) => {
                                            const val = event.target.value === '' ? 6.5 : parseFloat(event.target.value);
                                            setSoilPh(Number.isNaN(val) || val < 3.5 ? 6.5 : clamp(val, 3.5, 9.5));
                                        }}
                                        onBlur={(event) => {
                                            const val = parseFloat(event.target.value);
                                            if (Number.isNaN(val) || val < 3.5 || val > 9.5) {
                                                setSoilPh(6.5);
                                            }
                                        }}
                                        className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Soil Type</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={soilTypeField}
                                    onChange={(event) => setSoilTypeField(event.target.value)}
                                >
                                    <option>Loamy</option>
                                    <option>Alluvial</option>
                                    <option value="Black (Vertisol)">Black (Vertisol)</option>
                                    <option>Red</option>
                                    <option>Sandy</option>
                                    <option>Clay</option>
                                    <option>Laterite</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-foreground">Season</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                        value={season}
                                        onChange={(event) => setSeason(event.target.value as SeasonType)}
                                    >
                                        <option>Kharif (Monsoon)</option>
                                        <option>Rabi (Winter)</option>
                                        <option>Zaid (Summer)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-foreground">Irrigation Type</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                        value={irrigation}
                                        onChange={(event) => setIrrigation(event.target.value as IrrigationType)}
                                    >
                                        <option>Tube-well</option>
                                        <option>Rainfed</option>
                                        <option>Micro-Irrigation (Drip/Sprinkler)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-foreground">Topography</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={topography}
                                        onChange={(event) => setTopography(event.target.value as TopographyType)}
                                    >
                                        <option>Plains</option>
                                        <option>Hilly</option>
                                        <option>Coastal</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-foreground">Last Season Yield (optional)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="qtl/acre"
                                        value={lastSeasonYield}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setLastSeasonYield(value === '' ? '' : parseFloat(value));
                                        }}
                                        className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 border border-blue-100 dark:border-blue-900/30 rounded-xl text-sm text-blue-800 dark:text-blue-300">
                                <b>Live fitting:</b> This model automatically normalizes predictions using current weather for the provided location.
                            </div>

                            <button
                                onClick={() => {
                                    void handlePredict();
                                }}
                                disabled={analyzing}
                                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {analyzing ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Running calibrated prediction...
                                    </>
                                ) : (
                                    <>
                                        <LineChart className="h-5 w-5" />
                                        Predict Harvest
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    {!result && !analyzing ? (
                        <div className="h-full bg-muted/20 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                            <LineChart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-bold text-muted-foreground">Ready to Simulate</h3>
                            <p className="text-muted-foreground/70 mt-2 max-w-sm">Enter crop and farm conditions to generate a weather-adjusted yield and financial projection.</p>
                        </div>
                    ) : analyzing ? (
                        <div className="h-full bg-card border border-border shadow-sm rounded-2xl flex flex-col items-center justify-center p-12 min-h-[400px] relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 animate-pulse" />

                            <Cpu className="h-16 w-16 text-primary animate-bounce mb-6 relative z-10" />
                            <h3 className="text-2xl font-bold text-foreground relative z-10 mb-2">Calibrating Yield Model</h3>

                            <div className="space-y-2 text-sm font-medium text-muted-foreground w-80 relative z-10">
                                <div className="flex justify-between items-center">
                                    <span>Fetching location weather context...</span>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Applying crop-specific multipliers...</span>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-primary animate-pulse">Computing risk-adjusted output...</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
                            {/* Live Speedometer Gauge */}
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" /> Live Yield Gauge
                                </h4>
                                <div className="flex justify-center">
                                    <svg viewBox="0 0 200 120" className="w-64 h-40">
                                        {/* Background arc segments */}
                                        <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />
                                        <path d="M 100 20 A 80 80 0 0 1 140 30" fill="none" stroke="#eab308" strokeWidth="12" strokeLinecap="round" />
                                        <path d="M 140 30 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
                                        {/* Needle */}
                                        <motion.line
                                            x1="100" y1="100"
                                            x2="100" y2="30"
                                            stroke="#1e293b" strokeWidth="3" strokeLinecap="round"
                                            style={{ transformOrigin: '100px 100px' }}
                                            animate={{ rotate: -90 + Math.min(displayYieldPerAcre, 50) * (180 / 50) }}
                                            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                                        />
                                        {/* Center dot */}
                                        <circle cx="100" cy="100" r="6" fill="#1e293b" />
                                        <circle cx="100" cy="100" r="3" fill="white" />
                                        {/* Labels */}
                                        <text x="20" y="115" textAnchor="middle" className="text-[8px] fill-muted-foreground">0</text>
                                        <text x="100" y="12" textAnchor="middle" className="text-[8px] fill-muted-foreground">25</text>
                                        <text x="180" y="115" textAnchor="middle" className="text-[8px] fill-muted-foreground">50</text>
                                    </svg>
                                </div>
                                <div className="text-center mt-2">
                                    <motion.span
                                        key={displayYieldPerAcre.toFixed(2)}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-3xl font-extrabold text-foreground"
                                    >
                                        {displayYieldPerAcre.toFixed(2)}
                                    </motion.span>
                                    <span className="text-sm text-muted-foreground ml-2">qtl/acre</span>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4 border-none">
                                <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-20">
                                        <Leaf className="h-24 w-24" />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-primary-foreground/80 font-medium tracking-wide text-sm uppercase">Total Expected Yield</h4>
                                        <div className="mt-4 flex items-baseline gap-2">
                                            <motion.span 
                                                key={displayYield.toFixed(1)}
                                                initial={{ opacity: 0.5, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-5xl font-extrabold"
                                            >
                                                {displayYield.toFixed(1)}
                                            </motion.span>
                                            <span className="text-xl font-medium text-primary-foreground/90">Quintals</span>
                                        </div>
                                        <div className="mt-4 inline-flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <motion.span
                                                key={displayYieldPerAcre.toFixed(2)}
                                                initial={{ opacity: 0.5 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                {displayYieldPerAcre.toFixed(2)}
                                            </motion.span> q/acre average
                                        </div>
                                        <div className="mt-3 text-xs text-primary-foreground/90">
                                            Location: {result?.location}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                        <TrendingUp className="h-24 w-24" />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-muted-foreground font-medium tracking-wide text-sm uppercase">Estimated Financial Value</h4>
                                        <div className="mt-3 flex items-baseline gap-2">
                                            <motion.span 
                                                key={displayRevenue}
                                                initial={{ opacity: 0.5, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-4xl font-extrabold text-foreground"
                                            >
                                                {displayRevenue}
                                            </motion.span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">At MSP: {result?.financial.mspRevenue}</p>
                                        <div className="mt-3 inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                                            <TrendingUp className="h-4 w-4" />
                                            {result?.financial.marketTrend}
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Weather source: {result?.weatherSource === 'live' ? 'Live forecast' : 'Fallback climatology'}
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-border">
                                            <button
                                                onClick={savePrediction}
                                                className={`w-full py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                                                    justSaved
                                                        ? 'bg-green-500 text-white'
                                                        : 'border border-border hover:bg-muted text-foreground'
                                                }`}
                                            >
                                                {justSaved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Prediction</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alternate Scenario Section */}
                            {result?.alternateScenario && (
                                <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                                                <Leaf className="h-5 w-5" /> What-If Scenario Comparison
                                            </h4>
                                            <p className="text-sm text-blue-700/80 dark:text-blue-400 mt-1">If you upgraded to: <b>{result.alternateScenario.name}</b></p>
                                        </div>
                                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                            +{result.alternateScenario.improvementPct}% Yield
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/60 dark:bg-card/50 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">Expected Yield</p>
                                            <p className="text-lg font-bold text-foreground">{result.alternateScenario.expectedYield} qtl</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase">Yield / Acre</p>
                                            <p className="text-lg font-bold text-foreground">{result.alternateScenario.yieldPerAcre} qtl</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-muted-foreground uppercase">Est. Revenue</p>
                                            <p className="text-lg font-bold text-green-600 dark:text-green-400">{result.alternateScenario.estimatedRevenue}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {latestWeatherContext && (
                                <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/40 p-4 text-sm text-blue-700 dark:text-blue-300">
                                    <div className="font-semibold flex items-center gap-2 mb-1"><MapPin className="h-4 w-4" /> Latest Weather Context</div>
                                    Avg temp {latestWeatherContext.avgTemp.toFixed(1)}°C, rain probability {latestWeatherContext.avgRainProbability.toFixed(0)}%, humidity {latestWeatherContext.avgHumidity.toFixed(0)}% for {latestWeatherContext.locationLabel}.
                                </div>
                            )}

                            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                                <div className="border-b border-border/50 p-5 flex justify-between items-center bg-muted/20">
                                    <h3 className="font-bold text-foreground">AI Confidence Score</h3>
                                    <span className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-sm">{result?.accuracy}% reliability</span>
                                </div>

                                <div className="p-6">
                                    <h4 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-4">Key Predictive Factors</h4>

                                    <div className="space-y-4">
                                        <div className="flex gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg shrink-0 h-fit">
                                                <Thermometer className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-foreground text-sm">Agro-Climatology Impact</h5>
                                                <p className="text-sm text-blue-800 dark:text-blue-300 mt-1 leading-relaxed">{result?.factors.weatherImpact}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                            <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg shrink-0 h-fit">
                                                <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-foreground text-sm">Soil & Topography Impact</h5>
                                                <p className="text-sm text-amber-800 dark:text-amber-300 mt-1 leading-relaxed">{result?.factors.soilImpact}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 p-4 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                            <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg shrink-0 h-fit">
                                                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-foreground text-sm">Pest & Disease Pressure</h5>
                                                <p className="text-sm text-green-800 dark:text-green-300 mt-1 leading-relaxed">{result?.factors.pestRisk}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* What-If Sliders */}
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg flex items-center gap-2 mb-6 text-foreground">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Interactive What-If Scenario
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-semibold text-foreground">Rainfall Deviation (%)</label>
                                            <span className="text-sm font-bold text-primary">{rainDev > 0 ? `+${rainDev}` : rainDev}%</span>
                                        </div>
                                        <input type="range" min="-50" max="50" value={rainDev} onChange={e => setRainDev(Number(e.target.value))} className="w-full accent-primary" />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>-50%</span>
                                            <span>Baseline</span>
                                            <span>+50%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-semibold text-foreground">Fertilizer Usage (%)</label>
                                            <span className="text-sm font-bold text-primary">{fertUsage}%</span>
                                        </div>
                                        <input type="range" min="0" max="150" value={fertUsage} onChange={e => setFertUsage(Number(e.target.value))} className="w-full accent-primary" />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>0%</span>
                                            <span>100% (Baseline)</span>
                                            <span>150%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-semibold text-foreground">Pest Control Level</label>
                                            <span className="text-sm font-bold text-primary">{pestControl}/100</span>
                                        </div>
                                        <input type="range" min="0" max="100" value={pestControl} onChange={e => setPestControl(Number(e.target.value))} className="w-full accent-primary" />
                                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                            <span>Low</span>
                                            <span>Medium</span>
                                            <span>High</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
