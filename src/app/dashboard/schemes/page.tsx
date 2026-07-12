'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calculator, Filter, Loader2, RefreshCw, Search } from 'lucide-react';
import SchemeCard from '@/components/schemes/SchemeCard';
import LoanCalculator from '@/components/schemes/LoanCalculator';
import type { SchemeRecord } from '@/lib/dynamicDashboardData';

/* ───────── Confetti CSS (injected via <style> tag) ───────── */
const CONFETTI_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

function generateConfettiCSS(): string {
  let css = `
    @keyframes confetti-fall {
      0%   { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
    }
    @keyframes confetti-sway {
      0%, 100% { transform: translateX(0); }
      25%      { transform: translateX(15px); }
      75%      { transform: translateX(-15px); }
    }
    .confetti-piece {
      position: fixed;
      top: -10px;
      z-index: 9999;
      pointer-events: none;
      animation: confetti-fall 3s ease-in forwards, confetti-sway 1.5s ease-in-out infinite;
    }
  `;
  return css;
}

/* ───────── Progress Tracker Steps ───────── */
const APPLICATION_STEPS = [
  { label: 'Check Eligibility', key: 'eligibility' },
  { label: 'Prepare Documents', key: 'documents' },
  { label: 'Submit Application', key: 'submit' },
  { label: 'Track Status', key: 'track' },
] as const;

function StepProgressTracker({ currentStep }: { currentStep: number }) {
  return (
    <div className="mt-4 mb-2 px-1">
      <div className="flex items-center justify-between">
        {APPLICATION_STEPS.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isFuture = idx > currentStep;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1 min-w-[56px]">
                <div
                  className={`
                    flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300
                    ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                    ${isCurrent ? 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 animate-pulse shadow-md shadow-green-500/30' : ''}
                    ${isFuture ? 'border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[10px] font-semibold text-center leading-tight whitespace-nowrap
                    ${isCompleted ? 'text-green-600 dark:text-green-400' : ''}
                    ${isCurrent ? 'text-green-600 dark:text-green-400' : ''}
                    ${isFuture ? 'text-gray-400 dark:text-gray-500' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>
              {/* Connecting line */}
              {idx < APPLICATION_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 mt-[-14px] rounded-full transition-all duration-300
                    ${idx < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── Types ───────── */
interface SchemesResponse {
  region: string;
  schemes: SchemeRecord[];
}

export default function SchemesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [landSizeFilter, setLandSizeFilter] = useState('All Sizes');
  const [demographicFilter, setDemographicFilter] = useState('All Demographics');
  const [region, setRegion] = useState('India');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schemes, setSchemes] = useState<SchemeRecord[]>([]);

  /* ── Confetti state ── */
  const [confettiActive, setConfettiActive] = useState(false);

  /* ── Expanded scheme for progress tracker ── */
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  const triggerConfetti = useCallback(() => {
    setConfettiActive(true);
    const timer = setTimeout(() => setConfettiActive(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSchemeClick = useCallback(
    (schemeTitle: string) => {
      setExpandedSchemeId((prev) => (prev === schemeTitle ? null : schemeTitle));
      triggerConfetti();
    },
    [triggerConfetti],
  );

  const loadSchemes = async (targetRegion: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/dashboard/schemes?region=${encodeURIComponent(targetRegion)}`);
      if (!response.ok) {
        throw new Error('Unable to load schemes data right now.');
      }

      const payload = (await response.json()) as SchemesResponse;
      setSchemes(payload.schemes);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load schemes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes('India');
  }, []);

  const categories = useMemo(() => {
    return ['All Categories', ...Array.from(new Set(schemes.map((scheme) => scheme.category))).sort()];
  }, [schemes]);

  const filteredSchemes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = schemes.filter((scheme) => {
      const matchesSearch =
        !query ||
        scheme.title.toLowerCase().includes(query) ||
        scheme.description.toLowerCase().includes(query) ||
        scheme.eligibility.toLowerCase().includes(query);

      const matchesCategory = categoryFilter === 'All Categories' || scheme.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'All Status' || scheme.status.toLowerCase() === statusFilter.toLowerCase();

      const el = scheme.eligibility.toLowerCase() + ' ' + scheme.description.toLowerCase();
      const matchesLand =
        landSizeFilter === 'All Sizes' ||
        (landSizeFilter === '< 2 Hectares' && (el.includes('small') || el.includes('marginal') || el.includes('2 ha') || el.includes('2 hectare') || el.includes('all'))) ||
        (landSizeFilter === '> 2 Hectares' && (!el.includes('marginal') || el.includes('large') || el.includes('all')));

      const matchesDemo =
        demographicFilter === 'All Demographics' ||
        (demographicFilter === 'Women Farmers' && (el.includes('women') || el.includes('female') || el.includes('all'))) ||
        (demographicFilter === 'SC/ST' && (el.includes('sc') || el.includes('st') || el.includes('scheduled') || el.includes('all'))) ||
        (demographicFilter === 'General' && el.includes('all'));

      return matchesSearch && matchesCategory && matchesStatus && matchesLand && matchesDemo;
    });

    // Urgency Engine: Sort expiring schemes to the top
    return filtered.sort((a, b) => {
      const getDaysUntil = (dateStr: string) => {
        if (!dateStr || dateStr.toLowerCase() === 'ongoing') return 9999;
        const timeDiff = new Date(dateStr).getTime() - new Date().getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return isNaN(days) || days < 0 ? 9999 : days;
      };

      const daysA = getDaysUntil(a.deadline);
      const daysB = getDaysUntil(b.deadline);

      if (daysA <= 14 && daysB > 14) return -1;
      if (daysB <= 14 && daysA > 14) return 1;
      if (daysA <= 14 && daysB <= 14) return daysA - daysB;
      return 0;
    });
  }, [schemes, searchTerm, categoryFilter, statusFilter, landSizeFilter, demographicFilter]);

  const totalBeneficiaries = useMemo(() => {
    return schemes.reduce((sum, scheme) => sum + scheme.beneficiaries, 0);
  }, [schemes]);

  /* ── Generate confetti pieces ── */
  const confettiPieces = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      width: `${6 + Math.random() * 6}px`,
      height: `${6 + Math.random() * 10}px`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: `${Math.random() * 1.5}s`,
      duration: `${2 + Math.random() * 2}s`,
      shape: i % 3 === 0 ? '50%' : i % 3 === 1 ? '0%' : '2px',
    }));
  }, []);

  return (
    <div className="min-h-screen space-y-8 bg-muted/5 p-6">
      {/* ── Confetti CSS injection ── */}
      <style dangerouslySetInnerHTML={{ __html: generateConfettiCSS() }} />

      {/* ── Confetti Pieces ── */}
      {confettiActive && (
        <div aria-hidden="true">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="confetti-piece"
              style={{
                left: piece.left,
                width: piece.width,
                height: piece.height,
                backgroundColor: piece.color,
                borderRadius: piece.shape,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-500">Government Schemes</h1>
          <p className="mt-1 text-muted-foreground">Region-aware subsidy insights with live beneficiary progression.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            title="Choose region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="h-11 rounded-xl border border-border bg-white px-4 text-sm font-medium shadow-sm outline-none dark:bg-card"
          >
            <option>India</option>
            <option>Maharashtra</option>
            <option>Madhya Pradesh</option>
            <option>Punjab</option>
            <option>Rajasthan</option>
            <option>Karnataka</option>
            <option>Uttar Pradesh</option>
          </select>

          <button
            type="button"
            onClick={() => loadSchemes(region)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setIsCalculatorOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted dark:bg-card"
          >
            <Calculator className="h-4 w-4" />
            Calculator
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm dark:bg-card">
          <div className="text-3xl font-bold text-foreground">{schemes.length}</div>
          <div className="text-sm font-medium text-muted-foreground">Active Scheme Models</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm dark:bg-card">
          <div className="text-3xl font-bold text-foreground">{totalBeneficiaries.toLocaleString('en-IN')}</div>
          <div className="text-sm font-medium text-muted-foreground">Estimated Beneficiaries</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm dark:bg-card">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {schemes.filter((scheme) => scheme.status === 'active').length}
          </div>
          <div className="text-sm font-medium text-muted-foreground">Open Schemes</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm dark:bg-card">
          <div className="text-3xl font-bold text-orange-500">{region}</div>
          <div className="text-sm font-medium text-muted-foreground">Region Profile</div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by scheme title, description, or eligibility"
            className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm shadow-sm outline-none ring-primary/20 transition focus:ring-2 dark:bg-card"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative w-full sm:w-48">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              title="Filter by Land Size"
              className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm font-medium shadow-sm outline-none dark:bg-card"
              value={landSizeFilter}
              onChange={(event) => setLandSizeFilter(event.target.value)}
            >
              <option value="All Sizes">Land: All Sizes</option>
              <option value="< 2 Hectares">Land: &lt; 2 Hectares</option>
              <option value="> 2 Hectares">Land: &gt; 2 Hectares</option>
            </select>
          </div>

          <div className="w-full sm:w-48">
            <select
              title="Filter by Demographic"
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm font-medium shadow-sm outline-none dark:bg-card"
              value={demographicFilter}
              onChange={(event) => setDemographicFilter(event.target.value)}
            >
              <option value="All Demographics">Any Demographic</option>
              <option value="Women Farmers">Women Farmers</option>
              <option value="SC/ST">SC/ST Category</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="w-full sm:w-40">
            <select
              title="Filter schemes by category"
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm font-medium shadow-sm outline-none dark:bg-card"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-36">
            <select
              title="Filter schemes by status"
              className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm font-medium shadow-sm outline-none dark:bg-card"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {loading && schemes.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-white dark:bg-card">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading subsidy programs...
          </div>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-white dark:bg-card">
          <p className="text-sm text-muted-foreground">No schemes found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSchemes.map((scheme) => (
            <div key={scheme.title}>
              {/* Clickable wrapper to trigger confetti + expand progress tracker */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSchemeClick(scheme.title)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSchemeClick(scheme.title);
                }}
                className="cursor-pointer"
              >
                <SchemeCard
                  title={scheme.title}
                  category={scheme.category}
                  officialUrl={scheme.officialUrl}
                  deadline={scheme.deadline}
                  benefits={scheme.benefits}
                  eligibility={scheme.eligibility}
                  status={scheme.status as 'active' | 'closed'}
                  description={scheme.description}
                  subsidyRate={scheme.subsidyRate}
                  maxAmount={scheme.maxAmount}
                  beneficiaries={scheme.beneficiaries}
                  totalTarget={scheme.totalTarget}
                />
              </div>

              {/* ── Application Progress Tracker (shown when expanded) ── */}
              {expandedSchemeId === scheme.title && (
                <div className="mt-2 rounded-xl border border-green-200 bg-white p-4 shadow-sm dark:border-green-900/30 dark:bg-card animate-in slide-in-from-top-2 duration-300">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Application Progress
                  </h4>
                  <StepProgressTracker currentStep={scheme.status === 'active' ? 2 : 4} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <LoanCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </div>
  );
}
