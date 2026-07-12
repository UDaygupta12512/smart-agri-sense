import React from 'react';
import { MapPin, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MSPCardProps {
    cropName: string;
    location: string;
    season: string;
    centralMsp: string;
    stateMsp: string;
    trend: 'up' | 'down' | 'stable';
    updatedDate: string;
}

const MSPCard: React.FC<MSPCardProps> = ({
    cropName,
    location,
    season,
    centralMsp,
    stateMsp,
    trend,
    updatedDate,
}) => {
    return (
        <div className="bg-white dark:bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{cropName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{location} • {season}</span>
                    </div>
                </div>
                <div>
                    {trend === 'up' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-1 text-xs font-bold text-green-700 dark:text-green-400">
                            <TrendingUp className="h-3 w-3" />
                            up
                        </span>
                    )}
                    {trend === 'down' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 px-2.5 py-1 text-xs font-bold text-red-700 dark:text-red-400">
                            <TrendingDown className="h-3 w-3" />
                            down
                        </span>
                    )}
                    {trend === 'stable' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-1 text-xs font-bold text-yellow-700 dark:text-yellow-500">
                            <Minus className="h-3 w-3" />
                            stable
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-green-800 dark:text-green-300">₹ Central MSP</span>
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">{centralMsp}</span>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">₹ State MSP</span>
                    <span className="text-lg font-bold text-orange-700 dark:text-orange-400">{stateMsp}</span>
                </div>
            </div>

            <div className="flex justify-between items-center border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">Updated: {updatedDate}</span>
            </div>

            <button
                onClick={() => window.open('https://enam.gov.in/web/', '_blank')}
                className="w-full mt-4 py-2 border border-border rounded-lg text-sm font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
                View on e-NAM Portal
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </button>
        </div>
    );
};

export default MSPCard;
