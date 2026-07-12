"use client";

import React, { useState } from 'react';
import { useSiteLanguage } from '@/lib/siteLanguage';
import {
  Landmark,
  Calculator,
  TrendingUp,
  CreditCard,
  IndianRupee,
  CheckCircle2,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoanEligibilityPage() {
  const { t } = useSiteLanguage();
  
  // Income Analysis State
  const [annualIncome, setAnnualIncome] = useState<number | ''>(300000);
  const [annualExpenses, setAnnualExpenses] = useState<number | ''>(150000);
  const [existingEMI, setExistingEMI] = useState<number | ''>(0);
  const [cibilScore, setCibilScore] = useState<number | ''>(720);
  
  // EMI Calculator State
  const [loanAmount, setLoanAmount] = useState<number | ''>(100000);
  const [tenureYears, setTenureYears] = useState<number | ''>(5);

  const numIncome = Number(annualIncome) || 0;
  const numExpenses = Number(annualExpenses) || 0;
  const numExistingEMI = Number(existingEMI) || 0;
  const numCibil = Number(cibilScore) || 0;
  const numLoanAmount = Number(loanAmount) || 0;
  const numTenure = Number(tenureYears) || 0;

  // Dynamic Interest Rate based on CIBIL
  let interestRate = 7; // default
  if (numCibil < 600) interestRate = 12;
  else if (numCibil < 700) interestRate = 9;
  else if (numCibil > 750) interestRate = 6.5;

  const annualSurplus = Math.max(0, numIncome - numExpenses);
  const monthlySurplus = annualSurplus / 12;
  const netMonthlySurplus = Math.max(0, monthlySurplus - numExistingEMI);
  
  // EMI Calculation: E = P * r * (1+r)^n / ((1+r)^n - 1)
  const calculateEMI = () => {
    if (numLoanAmount === 0 || numTenure === 0) return 0;
    const P = numLoanAmount;
    const r = (interestRate / 12) / 100;
    const n = numTenure * 12;
    if (r === 0) return P / n;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const emi = calculateEMI();
  const maxAffordableEMI = netMonthlySurplus * 0.5; // 50% of net monthly surplus

  const isEligible = numCibil >= 600;

  return (
    <div className="space-y-6 p-1 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Loan Eligibility Checker</h2>
          <p className="text-muted-foreground">Analyze income, calculate EMI, and discover suitable agricultural loans.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Income Analysis */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2.5 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-bold text-lg">Income Analysis</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Annual Farm Income (₹)</label>
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Annual Farm Expenses (₹)</label>
              <input
                type="number"
                value={annualExpenses}
                onChange={(e) => setAnnualExpenses(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Existing Monthly EMI (₹)</label>
              <input
                type="number"
                value={existingEMI}
                onChange={(e) => setExistingEMI(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">CIBIL Score</label>
              <input
                type="number"
                value={cibilScore}
                onChange={(e) => setCibilScore(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Estimated Surplus</span>
                <span className="text-xl font-bold text-emerald-600">₹{annualSurplus.toLocaleString('en-IN')}/yr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Net Monthly Surplus</span>
                <span className="text-lg font-bold text-emerald-600">₹{netMonthlySurplus.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* EMI Calculator */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2.5 rounded-lg">
              <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-lg">EMI Calculator</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-24 text-right rounded-lg border border-border bg-background px-2 py-1 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <input
                  type="range"
                  min="10000"
                  max="5000000"
                  step="10000"
                  value={numLoanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Interest Rate (p.a)</label>
                  <span className="text-sm font-bold text-primary">{interestRate}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Auto-calculated based on CIBIL score: {numCibil}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Tenure (Years)</label>
                  <input
                    type="number"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-16 text-right rounded-lg border border-border bg-background px-2 py-1 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={numTenure}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6 flex flex-col justify-center">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Estimated Monthly EMI</p>
                  <p className="text-4xl font-black text-blue-700 dark:text-blue-400">₹{emi.toLocaleString('en-IN')}</p>
                </div>
                <div className="pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                  {!isEligible ? (
                    <p className="text-sm font-medium text-red-600 flex items-center justify-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> CIBIL score too low for most standard bank loans. Consider micro-finance.
                    </p>
                  ) : emi <= maxAffordableEMI ? (
                    <p className="text-sm font-medium text-emerald-600 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> This EMI looks affordable based on your net surplus.
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-amber-600 flex items-center justify-center gap-1.5 text-left">
                      <AlertTriangle className="h-4 w-4 shrink-0" /> This EMI exceeds 50% of your net monthly surplus. High risk of default.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Recommendations */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900/40 p-2.5 rounded-lg">
            <Landmark className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-bold text-lg">Recommended Loan Schemes</h3>
        </div>
        
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {isEligible ? (
            <>
              {/* KCC */}
              <div className="p-6 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CreditCard className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-foreground">Kisan Credit Card (KCC)</h4>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                      Short-term credit limits for crop cultivation, post-harvest expenses, and working capital.
                    </p>
                    <ul className="text-sm space-y-1.5 mb-4">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Interest subvention up to 3% for prompt repayment</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Flexible repayment tied to harvest</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Maximum limit: ₹3 Lakhs @ 4% effective interest</li>
                    </ul>
                    <a href="https://www.myscheme.gov.in/schemes/kcc" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                      <FileText className="h-4 w-4" /> View Details & Apply
                    </a>
                  </div>
                </div>
              </div>

              {/* Agri Term Loan (Conditional on Surplus) */}
              {annualSurplus > 100000 ? (
                <div className="p-6 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <IndianRupee className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">Agri Equipment Term Loan</h4>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Long-term credit for purchasing tractors, harvesters, irrigation equipment, and infrastructure.
                      </p>
                      <ul className="text-sm space-y-1.5 mb-4">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Repayment tenure up to 9 years</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Subsidies available under SMAM scheme</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Covers 85% of equipment cost</li>
                      </ul>
                      <a href="https://agrimachinery.nic.in/" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                        <FileText className="h-4 w-4" /> View Details & Apply
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                 <div className="p-6 hover:bg-muted/20 transition-colors flex items-center justify-center text-center">
                    <p className="text-muted-foreground text-sm">Increase your annual surplus above ₹1,00,000 to unlock long-term Agricultural Equipment Loans.</p>
                 </div>
              )}
            </>
          ) : (
            /* Micro-Finance Fallback */
            <div className="p-6 hover:bg-muted/20 transition-colors col-span-2">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Landmark className="h-6 w-6 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-foreground">Micro-Finance Group Loan</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    Small ticket loans through Joint Liability Groups (JLG) that do not strictly require a high CIBIL score.
                  </p>
                  <ul className="text-sm space-y-1.5 mb-4">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600" /> No collateral required</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600" /> Fast disbursement for immediate inputs</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-600" /> Loan sizes typically up to ₹50,000</li>
                  </ul>
                  <a href="https://www.nabard.org/content1.aspx?id=518&catid=8&mid=489" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Find Local Micro-Finance Institutions
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
