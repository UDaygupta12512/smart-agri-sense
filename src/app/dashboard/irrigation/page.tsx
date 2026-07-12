"use client";

import React, { useState, useEffect } from 'react';
import { useSiteLanguage } from '@/lib/siteLanguage';
import {
  Droplets,
  CalendarDays,
  Activity,
  Settings,
  CloudRain,
  Sun,
  RefreshCcw,
  MapPin,
  Bot
} from 'lucide-react';

interface ScheduleItem {
  dayStr: string;
  dateNum: number;
  title: string;
  time: string;
  skippedByRain: boolean;
  isPast: boolean;
  isToday: boolean;
}

export default function SmartIrrigationPage() {
  const { t } = useSiteLanguage();
  const [cropType, setCropType] = useState('wheat');
  const [soilType, setSoilType] = useState('loamy');
  const [cropStage, setCropStage] = useState('vegetative');
  const [locationQuery, setLocationQuery] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [liveMoisture, setLiveMoisture] = useState(65);
  const [waterRequirement, setWaterRequirement] = useState('12.5');
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [weatherContext, setWeatherContext] = useState('');
  
  const [isIrrigating, setIsIrrigating] = useState(false);
  
  const handleSyncData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/irrigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropType,
          soilType,
          cropStage,
          locationQuery: locationQuery || 'Nagpur'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch smart irrigation data');
      }
      
      const resData = await response.json();
      
      if (resData.data) {
        setLiveMoisture(resData.data.liveMoisture);
        setWaterRequirement(resData.data.waterRequirement);
        setSchedule(resData.data.schedule || []);
        setWeatherContext(resData.weatherContext || '');
      }
      
    } catch (error) {
      console.error('Irrigation API failed:', error);
      alert('Failed to connect to Smart Irrigation AI.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on first mount
  useEffect(() => {
    const loc = localStorage.getItem('userLocation');
    if (loc) {
      setLocationQuery(loc);
    }
    // We intentionally do not auto-fetch on mount without the user clicking sync, 
    // to prevent excessive API calls, but we could if needed.
  }, []);

  const handleManualIrrigate = () => {
    setIsIrrigating(true);
    let current = liveMoisture;
    const fillInterval = setInterval(() => {
      current += 5;
      if (current >= 95) {
        setLiveMoisture(95);
        clearInterval(fillInterval);
        setTimeout(() => setIsIrrigating(false), 500);
      } else {
        setLiveMoisture(current);
      }
    }, 100);
  };

  const moistureStatus = liveMoisture < 35 ? 'Critical Low' : liveMoisture > 80 ? 'Saturated' : 'Optimal';
  const moistureStatusColor = liveMoisture < 35 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : liveMoisture > 80 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

  return (
    <div className="space-y-6 p-1 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Smart Irrigation Engine</h2>
          <p className="text-muted-foreground">AI-powered irrigation scheduling using real-time weather integration.</p>
        </div>
        <button
          onClick={handleSyncData}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCcw className="w-5 h-5 animate-spin" />
          ) : (
            <Bot className="w-5 h-5" />
          )}
          {isLoading ? 'Syncing AI Data...' : 'Analyze via AI'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {/* Soil Moisture Tracking */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10 col-span-1 relative overflow-hidden">
          {isIrrigating && (
             <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 animate-pulse pointer-events-none" />
          )}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300">Live Moisture</h3>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${moistureStatusColor}`}>{moistureStatus}</span>
          </div>
          
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-end">
              <span className="text-5xl font-black text-blue-700 dark:text-blue-400 tabular-nums transition-all duration-300">{Math.round(liveMoisture)}%</span>
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium pb-1">Volumetric</span>
            </div>
            <div className="w-full bg-blue-200/50 dark:bg-blue-900/30 rounded-full h-4 overflow-hidden relative">
              <div className={`h-full rounded-full transition-all duration-500 ease-out ${liveMoisture < 35 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${liveMoisture}%` }}>
                <div className="w-full h-full opacity-30 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_1s_infinite_linear]" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-blue-700/80 dark:text-blue-300/80 font-medium">
                {liveMoisture < 35 ? 'Warning: Critical drop!' : 'Stable condition.'}
              </p>
              <button 
                onClick={handleManualIrrigate} 
                disabled={isIrrigating || liveMoisture > 90}
                className="text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Droplets className="w-3 h-3" />
                {isIrrigating ? 'Irrigating...' : 'Trigger Pump'}
              </button>
            </div>
          </div>
        </div>

        {/* AI Requirements Engine */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2.5 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg">AI Requirement Engine</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4 col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Crop Type</label>
                  <select 
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="wheat">Wheat</option>
                    <option value="rice">Rice (Paddy)</option>
                    <option value="cotton">Cotton</option>
                    <option value="maize">Maize</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Soil Type</label>
                  <select 
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="loamy">Loamy (Balanced)</option>
                    <option value="clay">Clay (High Retention)</option>
                    <option value="sandy">Sandy (Fast Draining)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Growth Phase</label>
                  <select 
                    value={cropStage}
                    onChange={(e) => setCropStage(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="seedling">Seedling / Early</option>
                    <option value="vegetative">Vegetative Growth</option>
                    <option value="flowering">Flowering</option>
                    <option value="fruiting">Fruiting / Maturation</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </label>
                  <input 
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="e.g. Nagpur, Maharashtra"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <p className="text-sm text-muted-foreground font-medium mb-1">AI Calculated Need</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-primary tabular-nums">{waterRequirement}</span>
                <span className="text-sm font-medium text-muted-foreground">mm/day</span>
              </div>
              {weatherContext && (
                <p className="text-[10px] text-muted-foreground mt-3 leading-tight px-2">
                  {weatherContext}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Irrigation Schedule */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/40 p-2.5 rounded-lg">
              <CalendarDays className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-lg">AI Action Plan</h3>
          </div>
          {schedule.length > 0 && (
             <div className="text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full flex items-center gap-1">
               <Bot className="w-3 h-3" /> AI Generated
             </div>
          )}
        </div>
        <div className="p-0">
          {schedule.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CloudRain className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Click "Analyze via AI" to generate a smart irrigation schedule based on real weather data.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {schedule.map((item, idx) => (
                <div key={idx} className={`p-4 sm:px-6 hover:bg-muted/30 transition-colors flex items-center justify-between ${item.isPast ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg flex flex-col items-center justify-center shadow-sm ${
                      item.isPast ? 'bg-muted text-muted-foreground' :
                      (item.skippedByRain) ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                      item.isToday ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-muted text-muted-foreground'
                    }`}>
                      <span className="text-xs font-bold uppercase">{item.dayStr}</span>
                      <span className="text-lg font-black leading-none">{item.dateNum}</span>
                    </div>
                    <div>
                      <h4 className={`font-bold text-foreground ${item.skippedByRain ? 'line-through opacity-50' : ''}`}>{item.title}</h4>
                      {item.skippedByRain ? (
                        <p className="text-sm text-blue-600 font-medium flex items-center gap-1"><CloudRain className="h-3 w-3" /> Skipped due to rain forecast</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      )}
                    </div>
                  </div>
                  {item.isPast ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium border border-border text-muted-foreground">
                      Completed
                    </span>
                  ) : item.isToday ? (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${item.skippedByRain ? 'bg-blue-100 text-blue-700' : 'bg-primary text-primary-foreground animate-pulse'}`}>
                      {item.skippedByRain ? 'Skipped' : 'Action Required'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      Scheduled
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: -40px 0; }
          100% { background-position: 40px 0; }
        }
      `}} />
    </div>
  );
}
