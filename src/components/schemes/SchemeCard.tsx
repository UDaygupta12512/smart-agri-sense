import React from 'react';
import { Calendar, CheckCircle2, ShieldCheck, Sprout, FlaskConical, ExternalLink, Clock } from 'lucide-react';

interface SchemeCardProps {
    title: string;
    category: string;
    officialUrl: string;
    deadline: string;
    benefits: string; // Keeping for interface compatibility but may not display if new fields used
    eligibility: string;
    status: 'active' | 'closed';
    description: string;
    subsidyRate: string;
    maxAmount: string;
    beneficiaries: number;
    totalTarget: number;
}

const SchemeCard: React.FC<SchemeCardProps> = ({
    title,
    category,
    officialUrl,
    deadline,
    eligibility,
    status,
    description,
    subsidyRate,
    maxAmount,
    beneficiaries,
    totalTarget,
}) => {
    const isDeadlinePassed = status === 'closed';
    let isUrgent = false;
    let daysUntil = 9999;
    
    if (!isDeadlinePassed && deadline && deadline.toLowerCase() !== 'ongoing') {
        const timeDiff = new Date(deadline).getTime() - new Date().getTime();
        daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (daysUntil <= 14 && daysUntil >= 0) {
            isUrgent = true;
        }
    }

    const progress = Math.min((beneficiaries / totalTarget) * 100, 100);
    const progressWidthClass = progress >= 95
        ? 'w-full'
        : progress >= 80
            ? 'w-10/12'
            : progress >= 65
                ? 'w-8/12'
                : progress >= 50
                    ? 'w-6/12'
                    : progress >= 35
                        ? 'w-4/12'
                        : 'w-3/12';
    const portalUrl = officialUrl || 'https://agricoop.nic.in/';

    // Icon based on category (Simple logic)
    const Icon = category.toLowerCase().includes('pesticide') ? ShieldCheck :
        category.toLowerCase().includes('fertilizer') ? FlaskConical : Sprout;

    const iconColor = category.toLowerCase().includes('pesticide') ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' :
        category.toLowerCase().includes('fertilizer') ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' : 'text-primary bg-primary/10';

    return (
        <div className="bg-white dark:bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative">
            
            {isUrgent && (
                <div className="absolute -top-3 -right-3 z-10 animate-bounce flex h-6 items-center gap-1.5 rounded-full bg-red-600 px-3 text-[10px] font-bold text-white shadow-lg ring-4 ring-white dark:ring-background uppercase tracking-wider">
                    <Clock className="h-3 w-3 animate-pulse" />
                    Closes in {daysUntil} {daysUntil === 1 ? 'Day' : 'Days'}
                </div>
            )}

            <div className="flex items-start gap-3 mb-4">
                <div className={`p-2 rounded-lg ${iconColor} shrink-0`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
                    <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-muted text-muted-foreground tracking-wide">
                            {category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {status}
                        </span>
                    </div>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{subsidyRate}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">Subsidy Rate</div>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{maxAmount}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase">Max Amount</div>
                </div>
            </div>

            <div className="mb-6 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-foreground/20"></div>
                        Beneficiaries
                    </span>
                    <span className="text-foreground">{beneficiaries.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full bg-linear-to-r from-primary to-green-400 rounded-full ${progressWidthClass}`}></div>
                </div>
            </div>

            <div className={`mt-auto p-3 rounded-lg border ${isDeadlinePassed ? 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20' : isUrgent ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/40' : 'bg-muted/20 border-border'} mb-4`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <Calendar className={`h-4 w-4 ${isDeadlinePassed ? 'text-orange-500' : isUrgent ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
                        <span className={`font-semibold ${isUrgent ? 'text-red-700 dark:text-red-400' : ''}`}>Application Deadline</span>
                    </div>
                    <div className="text-right">
                        {isDeadlinePassed ? (
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 block">Deadline passed</span>
                        ) : null}
                        <span className={`text-xs ${isUrgent ? 'text-red-700 font-bold dark:text-red-400' : 'text-muted-foreground'}`}>{deadline}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span><span className="font-semibold text-foreground/80">Eligibility Criteria:</span> {eligibility}</span>
                </div>
            </div>

            <button
                onClick={() => window.open(portalUrl, '_blank', 'noopener,noreferrer')}
                disabled={isDeadlinePassed}
                className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    isDeadlinePassed
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : isUrgent
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20'
                        : 'bg-primary text-white hover:bg-primary/90'
                }`}
            >
                {isDeadlinePassed ? 'Application Closed' : <><ExternalLink className="h-4 w-4" /> Apply on Official Portal</>}
            </button>
        </div>
    );
};

export default SchemeCard;
