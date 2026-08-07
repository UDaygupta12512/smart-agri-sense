'use client';

import React, { useState, useEffect } from 'react';
import {
    Bot,
    CheckCircle2,
    FlaskConical,
    Loader2,
    Sprout,
    TestTube,
    CloudRain,
    Thermometer,
    Droplets,
    Compass,
    TrendingUp,
    Calendar,
    Coins,
    ShieldAlert,
    Volume2,
    VolumeX,
    Sparkles,
    Layers,
    ArrowRight,
    Sliders,
    RefreshCw
} from 'lucide-react';
import { REGIONAL_PRESETS, type SoilData, type RecommendationResult, type RegionalPreset } from '@/lib/cropRecommender';

export default function SmartCropPage() {
    const [formData, setFormData] = useState<SoilData>({
        N: 90,
        P: 42,
        K: 43,
        temperature: 25,
        humidity: 70,
        ph: 6.5,
        rainfall: 150
    });

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<RecommendationResult[] | null>(null);
    const [error, setError] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<string>('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'kharif' | 'rabi' | 'zaid'>('all');

    // Run prediction automatically on mount with default values
    useEffect(() => {
        runPrediction(formData);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: Number(value)
        }));
        setSelectedPreset('');
    };

    const handleApplyPreset = (preset: RegionalPreset) => {
        setSelectedPreset(preset.id);
        setFormData(preset.soil);
        runPrediction(preset.soil);
    };

    const runPrediction = async (soilValues: SoilData) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/recommend-crop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(soilValues)
            });

            if (!res.ok) throw new Error('Prediction API error');
            const data = await res.json();

            if (data.recommendations) {
                setResults(data.recommendations);
            }
        } catch (err) {
            setError('Failed to compute KNN recommendations. Please check server status.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        runPrediction(formData);
    };

    const handleSpeak = (rec: RecommendationResult) => {
        if (!('speechSynthesis' in window)) {
            alert('Text-to-speech is not supported on this browser.');
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const text = `The top recommended crop for your field is ${rec.crop}, with ${rec.confidence} percent suitability. It is best sown in ${rec.agronomy.sowingWindow}, with an expected yield of ${rec.agronomy.expectedYield}, and estimated revenue of ${rec.agronomy.estimatedRevenuePerAcre}. Nutrient guidance: ${rec.agronomy.npkAdvice}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.lang = 'en-IN';

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const filteredResults = results?.filter(r => {
        if (activeTab === 'all') return true;
        if (activeTab === 'kharif') return r.agronomy.season === 'Kharif' || r.agronomy.season === 'Year-round';
        if (activeTab === 'rabi') return r.agronomy.season === 'Rabi' || r.agronomy.season === 'Year-round';
        if (activeTab === 'zaid') return r.agronomy.season === 'Zaid' || r.agronomy.season === 'Year-round';
        return true;
    });

    return (
        <div className="space-y-8 p-1 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        ICAR Agronomic Benchmark Engine • KNN ML
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <FlaskConical className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
                        Smart Crop Recommendation System
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-3xl text-sm sm:text-base leading-relaxed">
                        Evaluates soil chemical composition (N-P-K), soil reaction (pH), and local agro-climatic factors against 28 validated Indian commercial & food crop varieties using multi-dimensional weighted Euclidean distance.
                    </p>
                </div>
            </div>

            {/* Regional Presets Carousel / Quick Badges */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-background dark:to-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Compass className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                        Quick Regional Agro-Climatic Presets
                    </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {REGIONAL_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className={`text-left p-3 rounded-xl border text-xs transition-all duration-200 ${
                                selectedPreset === preset.id
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-semibold ring-2 ring-emerald-400/40'
                                    : 'bg-white dark:bg-card/90 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border-border/80 text-foreground'
                            }`}
                        >
                            <div className="font-bold truncate">{preset.name.split(' ')[0]} {preset.name.split(' ')[1] || ''}</div>
                            <div className={`text-[10px] mt-0.5 truncate ${selectedPreset === preset.id ? 'text-emerald-100' : 'text-muted-foreground'}`}>
                                {preset.state}
                            </div>
                            <div className={`text-[10px] mt-1 line-clamp-1 font-mono ${selectedPreset === preset.id ? 'text-emerald-200' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {preset.soilType}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Grid: Form on Left, Output on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Controls */}
                <div className="lg:col-span-5 bg-white dark:bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Sliders className="h-5 w-5 text-emerald-600" />
                            Soil & Climate Parameters
                        </h2>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({ N: 90, P: 42, K: 43, temperature: 25, humidity: 70, ph: 6.5, rainfall: 150 });
                                setSelectedPreset('');
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            <RefreshCw className="h-3 w-3" /> Reset
                        </button>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        {/* Nutrient NPK Sliders & Inputs */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <TestTube className="h-4 w-4 text-amber-500" />
                                    Soil Primary Nutrients (kg / ha)
                                </span>
                            </div>

                            {/* Nitrogen */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold">
                                    <label htmlFor="N" className="text-foreground">Nitrogen (N)</label>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{formData.N} kg/ha</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="140"
                                    step="1"
                                    id="N"
                                    name="N"
                                    value={formData.N}
                                    onChange={handleChange}
                                    className="w-full accent-emerald-600 h-2 bg-muted rounded-lg cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>0 (Deficient)</span>
                                    <span>70 (Medium)</span>
                                    <span>140 (High)</span>
                                </div>
                            </div>

                            {/* Phosphorus */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold">
                                    <label htmlFor="P" className="text-foreground">Phosphorus (P)</label>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{formData.P} kg/ha</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="145"
                                    step="1"
                                    id="P"
                                    name="P"
                                    value={formData.P}
                                    onChange={handleChange}
                                    className="w-full accent-emerald-600 h-2 bg-muted rounded-lg cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>5 kg/ha</span>
                                    <span>75 kg/ha</span>
                                    <span>145 kg/ha</span>
                                </div>
                            </div>

                            {/* Potassium */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold">
                                    <label htmlFor="K" className="text-foreground">Potassium (K)</label>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{formData.K} kg/ha</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="205"
                                    step="1"
                                    id="K"
                                    name="K"
                                    value={formData.K}
                                    onChange={handleChange}
                                    className="w-full accent-emerald-600 h-2 bg-muted rounded-lg cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>5 kg/ha</span>
                                    <span>100 kg/ha</span>
                                    <span>205 kg/ha</span>
                                </div>
                            </div>
                        </div>

                        {/* Climate & Soil Chemistry */}
                        <div className="space-y-4 pt-2 border-t border-border/40">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Sprout className="h-4 w-4 text-emerald-500" />
                                Environmental & Soil Reaction
                            </span>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Temperature */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Thermometer className="h-3.5 w-3.5 text-rose-500" /> Temperature (°C)
                                    </label>
                                    <input
                                        type="number"
                                        name="temperature"
                                        value={formData.temperature}
                                        onChange={handleChange}
                                        min="5"
                                        max="50"
                                        step="0.5"
                                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                {/* Rainfall */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <CloudRain className="h-3.5 w-3.5 text-sky-500" /> Rainfall (mm)
                                    </label>
                                    <input
                                        type="number"
                                        name="rainfall"
                                        value={formData.rainfall}
                                        onChange={handleChange}
                                        min="10"
                                        max="400"
                                        step="5"
                                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                {/* Humidity */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Droplets className="h-3.5 w-3.5 text-blue-500" /> Humidity (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="humidity"
                                        value={formData.humidity}
                                        onChange={handleChange}
                                        min="10"
                                        max="100"
                                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                {/* pH */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Layers className="h-3.5 w-3.5 text-amber-600" /> Soil pH Level
                                    </label>
                                    <input
                                        type="number"
                                        name="ph"
                                        value={formData.ph}
                                        onChange={handleChange}
                                        min="3.5"
                                        max="10"
                                        step="0.1"
                                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Running KNN Classifier...</span>
                                </>
                            ) : (
                                <>
                                    <Bot className="h-5 w-5" />
                                    <span>Recommend Best Crops</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-xs font-medium flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                {/* Recommendations Results View */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Season Filter Tabs */}
                    {results && results.length > 0 && (
                        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
                            <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-xl">
                                {(['all', 'kharif', 'rabi', 'zaid'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                                            activeTab === tab
                                                ? 'bg-white dark:bg-card text-emerald-600 shadow-sm font-bold'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {tab === 'all' ? 'All Top Crops' : `${tab} Season`}
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground font-mono">
                                Ranked by KNN Distance
                            </span>
                        </div>
                    )}

                    {/* Crop Recommendation Cards */}
                    {loading ? (
                        <div className="min-h-[400px] border border-border/60 rounded-2xl bg-muted/20 flex flex-col items-center justify-center p-8 text-center space-y-3">
                            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                            <h3 className="font-bold text-foreground">Computing Multi-Dimensional Distance...</h3>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                Standardizing feature matrices against 28 ICAR crop archetypes with inverse distance weighting.
                            </p>
                        </div>
                    ) : filteredResults && filteredResults.length > 0 ? (
                        <div className="space-y-5">
                            {filteredResults.map((rec, idx) => (
                                <div
                                    key={rec.crop}
                                    className={`bg-white dark:bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                                        idx === 0
                                            ? 'border-emerald-500/80 ring-1 ring-emerald-500/20'
                                            : 'border-border/80'
                                    }`}
                                >
                                    {/* Top Rank Badge */}
                                    {idx === 0 && (
                                        <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white text-[11px] font-black px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1.5">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            #1 PRIME SUITABILITY MATCH
                                        </div>
                                    )}

                                    {/* Title & Top Stats */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pr-0 sm:pr-24">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                                                    {rec.crop}
                                                </h3>
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border">
                                                    {rec.agronomy.season}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {rec.agronomy.soilPreference}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                                    {rec.confidence}%
                                                </div>
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                                    Suitability Index
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleSpeak(rec)}
                                                title="Read aloud recommendations"
                                                className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {isSpeaking ? (
                                                    <VolumeX className="h-4 w-4 text-emerald-600 animate-pulse" />
                                                ) : (
                                                    <Volume2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Confidence Bar */}
                                    <div className="w-full bg-muted/60 rounded-full h-2 mb-5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-teal-500"
                                            style={{ width: `${rec.confidence}%` }}
                                        />
                                    </div>

                                    {/* Suitability Dimension Triad */}
                                    <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Nutrient Fit</div>
                                            <div className="text-sm font-extrabold text-foreground mt-0.5">{rec.suitabilityFactors.nutrientFit}%</div>
                                        </div>
                                        <div className="border-x border-border/40">
                                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Climate Fit</div>
                                            <div className="text-sm font-extrabold text-foreground mt-0.5">{rec.suitabilityFactors.climateFit}%</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Water Fit</div>
                                            <div className="text-sm font-extrabold text-foreground mt-0.5">{rec.suitabilityFactors.waterFit}%</div>
                                        </div>
                                    </div>

                                    {/* Agronomic Details Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-2.5">
                                            <Calendar className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-foreground">Sowing & Harvest Timing</div>
                                                <div className="text-muted-foreground mt-0.5">
                                                    Sow: {rec.agronomy.sowingWindow} • Harvest: {rec.agronomy.harvestWindow}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-2.5">
                                            <Coins className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-foreground">Economics & Yield Target</div>
                                                <div className="text-muted-foreground mt-0.5">
                                                    Yield: {rec.agronomy.expectedYield} • Est. Rev: {rec.agronomy.estimatedRevenuePerAcre}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* NPK Fertilizer Prescription */}
                                    <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                                        <div className="font-bold text-foreground flex items-center gap-1.5 mb-1">
                                            <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                                            Agronomist Fertilizer Protocol:
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {rec.agronomy.npkAdvice}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                            <Bot className="h-16 w-16 mb-4 text-muted-foreground/40" />
                            <h3 className="font-bold text-foreground text-lg">Awaiting Soil Analysis</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                Adjust the parameters on the left or select a regional agro-climatic preset above to run the KNN classifier.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
