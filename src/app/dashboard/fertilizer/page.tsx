'use client';

import { useState } from 'react';
import { Calculator, Sprout, Scale, FlaskConical, AlertCircle, Sparkles, Layers, ShieldCheck } from 'lucide-react';

// Recommended NPK (Nitrogen, Phosphorus, Potassium) in kg per acre (ICAR guidelines)
const CROP_FERTILIZER_DATABASE: Record<string, {
    n: number;
    p: number;
    k: number;
    basalSplit: string;
    topDressing1: string;
    topDressing2?: string;
    bioFertilizer: string;
    microNutrient: string;
}> = {
    'Wheat': {
        n: 48, p: 24, k: 16,
        basalSplit: '50% Urea + 100% DAP + 100% MOP at sowing',
        topDressing1: '25% Urea at 1st irrigation (CRI stage, 21 DAS)',
        topDressing2: '25% Urea at 2nd irrigation (Tillering, 45 DAS)',
        bioFertilizer: 'Azotobacter + PSB seed treatment (250g/10kg seed)',
        microNutrient: 'Zinc Sulphate (21%) @ 10 kg/acre basal'
    },
    'Rice (Paddy)': {
        n: 40, p: 24, k: 16,
        basalSplit: '33% Urea + 100% DAP + 50% MOP before transplanting',
        topDressing1: '33% Urea at active tillering (21-25 DAT)',
        topDressing2: '34% Urea + 50% MOP at panicle initiation (45 DAT)',
        bioFertilizer: 'Azospirillum + Blue Green Algae (BGA @ 4 kg/acre)',
        microNutrient: 'Zinc Sulphate (33%) @ 5 kg/acre'
    },
    'Maize': {
        n: 48, p: 24, k: 16,
        basalSplit: '33% Urea + 100% DAP + 100% MOP at sowing',
        topDressing1: '33% Urea at knee-high stage (30 DAS)',
        topDressing2: '34% Urea at tasseling stage (50 DAS)',
        bioFertilizer: 'Azotobacter + PSB slurry',
        microNutrient: 'Zinc Sulphate @ 10 kg/acre'
    },
    'Sugarcane': {
        n: 100, p: 30, k: 30,
        basalSplit: '20% Urea + 100% DAP + 50% MOP at planting',
        topDressing1: '40% Urea at 45 days after planting',
        topDressing2: '40% Urea + 50% MOP at 90 days (earthing up)',
        bioFertilizer: 'Acetobacter diazotrophicus @ 2 kg/acre',
        microNutrient: 'Ferrous Sulphate @ 10 kg + Zinc Sulphate @ 10 kg'
    },
    'Cotton': {
        n: 48, p: 24, k: 24,
        basalSplit: '25% Urea + 100% DAP + 50% MOP at sowing',
        topDressing1: '50% Urea at square formation (45 DAS)',
        topDressing2: '25% Urea + 50% MOP at peak boll setting (75 DAS)',
        bioFertilizer: 'Azotobacter + PSB',
        microNutrient: 'Boron (Solubor 20%) @ 1g/L foliar spray at flowering'
    },
    'Soybean': {
        n: 12, p: 32, k: 16,
        basalSplit: '100% Urea + 100% DAP + 100% MOP as basal (Legume fixes own N)',
        topDressing1: 'Foliar spray of 19:19:19 NPK @ 1% at flower initiation',
        bioFertilizer: 'Bradyrhizobium japonicum (seed inoculation essential)',
        microNutrient: 'Ammonium Molybdate @ 1g/kg seed + Sulphur @ 10 kg/acre'
    },
    'Gram (Chana / Chickpea)': {
        n: 10, p: 24, k: 12,
        basalSplit: '100% DAP + 100% MOP at sowing (no heavy Urea required)',
        topDressing1: 'Foliar spray of 2% Urea or 0.5% 00:52:34 at pod development',
        bioFertilizer: 'Rhizobium ciceri + PSB culture',
        microNutrient: 'Sulphur 90% WDG @ 3 kg/acre'
    },
    'Mustard': {
        n: 32, p: 16, k: 16,
        basalSplit: '50% Urea + 100% DAP + 100% MOP at sowing',
        topDressing1: '50% Urea at 1st irrigation (30 DAS)',
        bioFertilizer: 'Azotobacter + PSB',
        microNutrient: 'Elemental Sulphur (80% WDG) @ 10 kg/acre (Crucial for oil %)'
    },
    'Potato': {
        n: 60, p: 40, k: 40,
        basalSplit: '50% Urea + 100% DAP + 50% MOP at planting',
        topDressing1: '50% Urea + 50% MOP at earthing up (30-35 DAP)',
        bioFertilizer: 'PSB tuber coating',
        microNutrient: 'Zinc Sulphate @ 10 kg/acre'
    },
    'Tomato': {
        n: 48, p: 36, k: 36,
        basalSplit: '33% Urea + 100% DAP + 33% MOP at transplanting',
        topDressing1: '33% Urea + 33% MOP at 30 DAT',
        topDressing2: '34% Urea + 34% MOP at peak fruiting (55 DAT)',
        bioFertilizer: 'Trichoderma + Pseudomonas root dip',
        microNutrient: 'Calcium Nitrate @ 5g/L + Boron @ 1g/L (prevents blossom end rot)'
    },
    'Onion': {
        n: 40, p: 20, k: 30,
        basalSplit: '50% Urea + 100% DAP + 50% MOP at transplanting',
        topDressing1: '25% Urea at 30 DAT',
        topDressing2: '25% Urea + 50% MOP at 45 DAT (stop N 30 days before harvest)',
        bioFertilizer: 'VAM (Mycorrhiza) + Azotobacter',
        microNutrient: 'Sulphur @ 15 kg/acre (improves pungency & storage life)'
    },
    'Groundnut': {
        n: 10, p: 24, k: 20,
        basalSplit: '100% DAP + 100% MOP + Gypsum 100 kg at sowing',
        topDressing1: 'Gypsum 100 kg/acre at pegging stage (40-45 DAS)',
        bioFertilizer: 'Rhizobium + VAM',
        microNutrient: 'Borax @ 4 kg/acre + Ferrous Sulphate 5 kg/acre'
    }
};

export default function FertilizerCalculatorPage() {
    const [crop, setCrop] = useState('Wheat');
    const [area, setArea] = useState<number | ''>(2.5);
    const [result, setResult] = useState<{
        urea: number;
        dap: number;
        mop: number;
        cropInfo: typeof CROP_FERTILIZER_DATABASE['Wheat'];
    } | null>(null);

    const calculate = (e: React.FormEvent) => {
        e.preventDefault();
        const numArea = Number(area);
        if (!numArea || numArea <= 0) return;

        const cropInfo = CROP_FERTILIZER_DATABASE[crop] || CROP_FERTILIZER_DATABASE['Wheat'];
        
        // Total required NPK for given field area
        const reqN = cropInfo.n * numArea;
        const reqP = cropInfo.p * numArea;
        const reqK = cropInfo.k * numArea;

        // DAP contains 46% P2O5 and 18% N
        const dapNeeded = reqP / 0.46;
        
        // Nitrogen provided by DAP
        const nFromDap = dapNeeded * 0.18;
        
        // Remaining Nitrogen needed from Urea (46% N)
        const remainingN = Math.max(0, reqN - nFromDap);
        const ureaNeeded = remainingN / 0.46;

        // MOP contains 60% K2O
        const mopNeeded = reqK / 0.60;
        
        setResult({
            urea: Math.round(ureaNeeded),
            dap: Math.round(dapNeeded),
            mop: Math.round(mopNeeded),
            cropInfo
        });
    };

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        ICAR Stoichiometric N-P-K Engine
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <FlaskConical className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
                        Scientific Fertilizer & Nutrient Calculator
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-3xl text-sm sm:text-base">
                        Accounts for cross-nutrient contributions (DAP 18% N credit) and outputs precise bag counts, split application timelines, and bio-fertilizer protocols.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-start">
                {/* Input Form (5 cols) */}
                <div className="lg:col-span-5 bg-card p-6 rounded-2xl border border-border shadow-sm space-y-5">
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                        <Scale className="h-5 w-5 text-emerald-600" />
                        Field & Crop Parameters
                    </h3>

                    <form onSubmit={calculate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Select Target Crop</label>
                            <select 
                                value={crop} 
                                onChange={(e) => setCrop(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {Object.keys(CROP_FERTILIZER_DATABASE).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Field Cultivation Area (Acres)</label>
                            <input 
                                type="number" 
                                min="0.1" 
                                step="0.1"
                                value={area}
                                onChange={(e) => setArea(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                className="w-full rounded-xl border border-border bg-background p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Enter area in acres"
                            />
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1">
                            <span className="font-bold text-foreground">Standard ICAR Dose for {crop}:</span>
                            <p className="text-muted-foreground">
                                N: {CROP_FERTILIZER_DATABASE[crop]?.n} kg/ac • P: {CROP_FERTILIZER_DATABASE[crop]?.p} kg/ac • K: {CROP_FERTILIZER_DATABASE[crop]?.k} kg/ac
                            </p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!area || Number(area) <= 0}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all disabled:opacity-50"
                        >
                            <Calculator className="h-5 w-5" /> Calculate Nutrient Split
                        </button>
                    </form>
                </div>

                {/* Output Display (7 cols) */}
                <div className="lg:col-span-7">
                    {result ? (
                        <div className="space-y-6">
                            {/* Bag summary cards */}
                            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-green-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-card p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-5">
                                <h3 className="text-lg font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                                    <Sprout className="h-5 w-5 text-emerald-600" />
                                    Total Fertilizer Requirement ({area} Acres {crop})
                                </h3>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white dark:bg-card p-4 rounded-xl border border-border/80 text-center shadow-sm">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Urea (46% N)</span>
                                        <span className="font-black text-2xl text-blue-600 dark:text-blue-400 mt-1 block">{result.urea} <span className="text-xs font-normal">kg</span></span>
                                        <span className="inline-block mt-1 text-[11px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                            {Math.ceil(result.urea / 45)} Bags (45kg)
                                        </span>
                                    </div>

                                    <div className="bg-white dark:bg-card p-4 rounded-xl border border-border/80 text-center shadow-sm">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">DAP (18:46:0)</span>
                                        <span className="font-black text-2xl text-amber-600 dark:text-amber-400 mt-1 block">{result.dap} <span className="text-xs font-normal">kg</span></span>
                                        <span className="inline-block mt-1 text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                            {Math.ceil(result.dap / 50)} Bags (50kg)
                                        </span>
                                    </div>

                                    <div className="bg-white dark:bg-card p-4 rounded-xl border border-border/80 text-center shadow-sm">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">MOP (60% K)</span>
                                        <span className="font-black text-2xl text-rose-600 dark:text-rose-400 mt-1 block">{result.mop} <span className="text-xs font-normal">kg</span></span>
                                        <span className="inline-block mt-1 text-[11px] font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full">
                                            {Math.ceil(result.mop / 50)} Bags (50kg)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Application Timeline & Split Schedule */}
                            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
                                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-emerald-600" />
                                    Agronomic Split-Dosing Schedule
                                </h4>

                                <div className="space-y-2.5 text-xs">
                                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">Stage 1: Basal Application (At Sowing / Planting)</span>
                                        <p className="text-muted-foreground">{result.cropInfo.basalSplit}</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                                        <span className="font-bold text-blue-700 dark:text-blue-400 block mb-0.5">Stage 2: First Top-Dressing</span>
                                        <p className="text-muted-foreground">{result.cropInfo.topDressing1}</p>
                                    </div>

                                    {result.cropInfo.topDressing2 && (
                                        <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                                            <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">Stage 3: Second Top-Dressing</span>
                                            <p className="text-muted-foreground">{result.cropInfo.topDressing2}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-border/50">
                                    <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                                        <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 mb-1">
                                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                            Bio-Fertilizer Inoculation:
                                        </span>
                                        <p className="text-muted-foreground text-[11px] leading-relaxed">{result.cropInfo.bioFertilizer}</p>
                                    </div>

                                    <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40">
                                        <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 mb-1">
                                            <Sparkles className="h-4 w-4 text-indigo-600" />
                                            Micro-Nutrient Protocol:
                                        </span>
                                        <p className="text-muted-foreground text-[11px] leading-relaxed">{result.cropInfo.microNutrient}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-12 text-muted-foreground h-full min-h-[350px]">
                            <FlaskConical className="w-14 h-14 mb-3 opacity-20 text-emerald-600" />
                            <p className="font-bold text-foreground text-base">Awaiting Field Inputs</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                Enter your crop and acreage on the left to compute the exact NPK bag counts, stage splits, and bio-fertilizer dosage.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
