'use client';

import { useState } from 'react';
import { Calculator, Sprout, Scale, FlaskConical, AlertCircle } from 'lucide-react';

// Recommended NPK (Nitrogen, Phosphorus, Potassium) in kg per acre (Standard Indian Guidelines)
const cropDoses: Record<string, { n: number; p: number; k: number }> = {
    Wheat: { n: 48, p: 24, k: 16 },
    Rice: { n: 40, p: 24, k: 16 },
    Maize: { n: 48, p: 24, k: 16 },
    Sugarcane: { n: 100, p: 30, k: 30 },
    Cotton: { n: 48, p: 24, k: 24 },
    Potato: { n: 60, p: 40, k: 40 }
};

export default function FertilizerCalculatorPage() {
    const [crop, setCrop] = useState('Wheat');
    const [area, setArea] = useState<number | ''>(1);
    const [result, setResult] = useState<{ urea: number; dap: number; mop: number } | null>(null);

    const calculate = (e: React.FormEvent) => {
        e.preventDefault();
        const numArea = Number(area);
        if (!numArea || numArea <= 0) return;

        const req = cropDoses[crop] || cropDoses['Wheat'];
        
        // Total required NPK for the given area
        const reqN = req.n * numArea;
        const reqP = req.p * numArea;
        const reqK = req.k * numArea;

        // DAP contains 46% P and 18% N
        const dapNeeded = reqP / 0.46;
        
        // Nitrogen provided by DAP
        const nFromDap = dapNeeded * 0.18;
        
        // Remaining Nitrogen needed from Urea (46% N)
        const remainingN = Math.max(0, reqN - nFromDap);
        const ureaNeeded = remainingN / 0.46;

        // MOP contains 60% K
        const mopNeeded = reqK / 0.60;
        
        setResult({
            urea: Math.round(ureaNeeded),
            dap: Math.round(dapNeeded),
            mop: Math.round(mopNeeded)
        });
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full p-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Fertilizer Calculator</h2>
                    <p className="text-muted-foreground mt-1">Scientifically calculate Urea, DAP, and MOP requirements based on crop and field size.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                    <form onSubmit={calculate} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Select Crop</label>
                            <select 
                                value={crop} 
                                onChange={(e) => setCrop(e.target.value)}
                                className="w-full rounded-xl border border-border bg-background p-3 outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {Object.keys(cropDoses).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Field Area (Acres)</label>
                            <input 
                                type="number" 
                                min="0.1" 
                                step="0.1"
                                value={area}
                                onChange={(e) => setArea(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                className="w-full rounded-xl border border-border bg-background p-3 outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Enter area in acres"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!area || Number(area) <= 0}
                            className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            <Calculator className="h-5 w-5" /> Calculate Required Bags
                        </button>
                    </form>
                </div>

                {result ? (
                    <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-900/20 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <FlaskConical className="w-32 h-32" />
                        </div>
                        <h2 className="text-xl font-bold mb-6 text-emerald-800 dark:text-emerald-400 flex items-center gap-2 relative z-10">
                            <Sprout className="h-6 w-6" /> Exact Requirement
                        </h2>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center bg-white/80 dark:bg-card/80 backdrop-blur-sm p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                <span className="font-semibold flex items-center gap-2"><Scale className="h-5 w-5 text-blue-500"/> Urea (46% N)</span>
                                <div className="text-right">
                                    <span className="font-black text-lg text-foreground">{result.urea} kg</span>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">~{Math.ceil(result.urea / 45)} Bags</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-white/80 dark:bg-card/80 backdrop-blur-sm p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                <span className="font-semibold flex items-center gap-2"><Scale className="h-5 w-5 text-zinc-500"/> DAP (18% N, 46% P)</span>
                                <div className="text-right">
                                    <span className="font-black text-lg text-foreground">{result.dap} kg</span>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">~{Math.ceil(result.dap / 50)} Bags</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-white/80 dark:bg-card/80 backdrop-blur-sm p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                                <span className="font-semibold flex items-center gap-2"><Scale className="h-5 w-5 text-red-500"/> MOP (60% K)</span>
                                <div className="text-right">
                                    <span className="font-black text-lg text-foreground">{result.mop} kg</span>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">~{Math.ceil(result.mop / 50)} Bags</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-5 flex items-start gap-1.5 font-medium relative z-10">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            This is calculated scientifically based on standard NPK crop needs, accounting for the Nitrogen provided by DAP. Adjust based on your soil health card.
                        </p>
                    </div>
                ) : (
                    <div className="border border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                        <FlaskConical className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-medium text-foreground">Awaiting Input</p>
                        <p className="text-sm mt-1">Enter your crop and field size to calculate the exact amount of Urea, DAP, and MOP required.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
