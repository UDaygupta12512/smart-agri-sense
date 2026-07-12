'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, X, Percent, Calendar } from 'lucide-react';
import Link from 'next/link';

interface LoanCalculatorProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ isOpen, onClose }) => {
    const [amount, setAmount] = useState<number>(50000);
    const [rate, setRate] = useState<number>(7); // KCC usually around 7%
    const [tenure, setTenure] = useState<number>(12); // months
    const [emi, setEmi] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);

    // Handle Escape key to close modal
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    useEffect(() => {
        const fetchCalculation = async () => {
            try {
                const res = await fetch('/api/yojana', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount, rate, tenure }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setEmi(data.emi);
                    setTotalInterest(data.totalInterest);
                }
            } catch (err) {
                console.error('Failed to fetch calculation', err);
            }
        };

        const debounceId = setTimeout(() => {
            fetchCalculation();
        }, 300);

        return () => clearTimeout(debounceId);
    }, [amount, rate, tenure]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="loan-calculator-title"
        >
            <div className="bg-white dark:bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200 relative">
                <button
                    onClick={onClose}
                    aria-label="Close calculator"
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 p-5 border-b border-border bg-muted/30">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <h3 id="loan-calculator-title" className="font-bold text-lg text-foreground">EMI Calculator</h3>
                </div>

                <div className="p-6 space-y-6">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Loan Amount
                            <span className="text-foreground font-bold">₹{amount.toLocaleString()}</span>
                        </label>
                        <input
                            type="range"
                            min="10000"
                            max="500000"
                            step="5000"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>₹10k</span>
                            <span>₹5L</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {/* Rate Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Interest Rate (%)</label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    step="0.1"
                                    value={rate}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setRate(Number.isNaN(val) ? 0 : Math.max(0, Math.min(30, val)));
                                    }}
                                    onBlur={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (Number.isNaN(val) || val < 0) {
                                            setRate(0);
                                        }
                                    }}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        {/* Tenure Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Tenure (Months)</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={tenure}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setTenure(Number.isNaN(val) ? 1 : Math.max(1, Math.min(60, val)));
                                    }}
                                    onBlur={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (Number.isNaN(val) || val < 1) {
                                            setTenure(1);
                                        }
                                    }}
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Monthly EMI</span>
                            <span className="text-2xl font-bold text-primary">₹{emi.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-px bg-primary/10"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Interest</span>
                            <span className="text-sm font-semibold text-foreground">₹{totalInterest.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Payment</span>
                            <span className="text-sm font-semibold text-foreground">₹{(amount + totalInterest).toLocaleString()}</span>
                        </div>
                    </div>

                    <Link href="/dashboard/loan" className="block w-full">
                        <button className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]">
                            Check Eligibility
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoanCalculator;
