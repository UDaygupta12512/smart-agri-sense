"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";

const tabs = [
  {
    id: "recommender",
    label: "Scheme Recommender",
    helper: "Match schemes to a household profile.",
  },
  {
    id: "region",
    label: "Regional Recommendations",
    helper: "Highlight schemes by season and region.",
  },
  {
    id: "loan",
    label: "Loan Viability",
    helper: "Estimate loan readiness for farmers.",
  },
  {
    id: "admin",
    label: "Admin Targets",
    helper: "Plan targets at each hierarchy level.",
  },
  {
    id: "visuals",
    label: "Impact Visuals",
    helper: "Preview trends and projections.",
  },
];

type SchemeRequirement = {
  name: string;
  maxIncome?: number;
  minAge?: number;
  maxAge?: number;
  maxLand?: number; // in Hectares
  gender?: "Female" | "Male" | "Any";
  category?: string[]; // e.g. ["SC", "ST"]
  benefitText: string;
  applyLink: string;
};

const realSchemeCatalog: SchemeRequirement[] = [
  {
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    benefitText: "₹6,000 / year in 3 equal installments",
    applyLink: "https://pmkisan.gov.in/",
    // No strict age/income for baseline, but often meant for landowners
  },
  {
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    benefitText: "Crop insurance at 2% (Kharif) / 1.5% (Rabi) premium",
    applyLink: "https://pmfby.gov.in/",
  },
  {
    name: "KCC (Kisan Credit Card)",
    benefitText: "Subsidized loan up to ₹3 Lakh at 4% interest",
    applyLink: "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card",
  },
  {
    name: "PM-SYM (Pradhan Mantri Shram Yogi Maan-dhan)",
    minAge: 18,
    maxAge: 40,
    maxIncome: 180000,
    benefitText: "₹3,000 / month pension after age 60",
    applyLink: "https://maandhan.in/",
  },
  {
    name: "Mahila Kisan Sashaktikaran Pariyojana (MKSP)",
    gender: "Female",
    benefitText: "Support for women-led agriculture initiatives and SHGs",
    applyLink: "https://aajeevika.gov.in/mksp",
  },
  {
    name: "PM-KUSUM (Solar Pumps)",
    maxLand: 5,
    benefitText: "Up to 60% subsidy on standalone solar agriculture pumps",
    applyLink: "https://pmkusum.mnre.gov.in/",
  }
];

const regionPresets: Record<
  string,
  { schemes: string[]; focus: string; alert: string }
> = {
  north: {
    schemes: ["PMKSY (Irrigation)", "Kisan Credit Card", "PMFBY (Insurance)"],
    focus: "Water security and credit readiness",
    alert: "Dry spell probability above seasonal average.",
  },
  south: {
    schemes: ["Seed Transition Incentive", "NRLM", "MKSP (Women Empowerment)"],
    focus: "Diversification and income smoothing",
    alert: "Monsoon onset tracking on schedule.",
  },
  east: {
    schemes: ["Soil Health Card Scheme", "PMFBY (Insurance)", "RKVY"],
    focus: "Soil health and youth engagement",
    alert: "Flood-prone blocks flagged for outreach.",
  },
  west: {
    schemes: ["e-NAM", "Kisan Credit Card", "PM-KUSUM"],
    focus: "Market access and working capital",
    alert: "Price volatility alerts active.",
  },
  central: {
    schemes: ["Soil Health Card Scheme", "MKSP", "PMFBY (Insurance)"],
    focus: "Livelihood inclusion and resilience",
    alert: "Heat stress advisory active.",
  },
  northeast: {
    schemes: ["MIDH (Horticulture)", "NRLM", "Kisan Credit Card"],
    focus: "Horticulture and youth training",
    alert: "Terrain-sensitive logistics support recommended.",
  },
};

const impactSeries = {
  baseline: [48, 55, 60, 63, 66],
  accelerated: [52, 60, 67, 72, 78],
};

const monthLabels = ["2026", "2027", "2028", "2029", "2030"];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function YojanaInteractive() {
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  const [profile, setProfile] = useState({
    state: "Maharashtra",
    age: 32,
    gender: "Male",
    category: "General",
    landSize: 1.5,
    income: 120000,
  });

  const [region, setRegion] = useState("north");
  const [season, setSeason] = useState("Kharif");
  const [priority, setPriority] = useState("Credit");

  const [loanInputs, setLoanInputs] = useState({
    income: 140000,
    land: 3,
    rainfall: "Medium",
  });

  const [adminTarget, setAdminTarget] = useState({
    level: "District",
    scheme: "PM-KISAN",
    target: 800,
  });

  const [impactMode, setImpactMode] = useState<"baseline" | "accelerated">(
    "baseline"
  );

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (tabs.some((tab) => tab.id === hash)) {
        setActiveTab(hash);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const regionData = regionPresets[region] ?? regionPresets.north;
  const impactValues = useMemo(() => impactSeries[impactMode], [impactMode]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  const recommendations = useMemo(() => {
    const safeAge = clamp(Number(profile.age) || 0, 18, 100);
    const safeIncome = Math.max(Number(profile.income) || 0, 0);
    const safeLand = Math.max(Number(profile.landSize) || 0, 0);

    return realSchemeCatalog.filter((scheme) => {
      if (scheme.minAge !== undefined && safeAge < scheme.minAge) return false;
      if (scheme.maxAge !== undefined && safeAge > scheme.maxAge) return false;
      if (scheme.maxIncome !== undefined && safeIncome > scheme.maxIncome) return false;
      if (scheme.maxLand !== undefined && safeLand > scheme.maxLand) return false;
      if (scheme.gender !== undefined && scheme.gender !== "Any" && scheme.gender !== profile.gender) return false;
      if (scheme.category !== undefined && !scheme.category.includes(profile.category)) return false;
      return true;
    });
  }, [profile]);

  const loanScore = useMemo(() => {
    const safeIncome = Math.max(Number(loanInputs.income) || 0, 0);
    const safeLand = Math.max(Number(loanInputs.land) || 0, 0);

    const incomeScore = clamp((safeIncome / 250000) * 40, 0, 40);
    const landScore = clamp((safeLand / 8) * 40, 0, 40);
    const rainfallScore =
      loanInputs.rainfall === "High"
        ? 18
        : loanInputs.rainfall === "Medium"
        ? 12
        : 6;
    const score = clamp(incomeScore + landScore + rainfallScore, 10, 98);
    return Math.round(score);
  }, [loanInputs]);

  const targetStatus = useMemo(() => {
    const safeTarget = Math.max(Number(adminTarget.target) || 0, 0);
    const normalized = clamp((safeTarget / 1200) * 100, 35, 92);
    return Math.round(normalized);
  }, [adminTarget]);

  return (
    <section className="rounded-[2.5rem] border border-border/60 bg-card/80 p-6 shadow-sm md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
            Working Modules
          </p>
          <h3 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
            Explore the live intelligence engine
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the tabs to simulate decisions and validate recommendations.
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Engine Active
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-[2rem] border border-border/60 bg-background/80 p-6">
        {activeTab === "recommender" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                Personalized Scheme Recommender
              </h4>
              <p className="text-sm text-muted-foreground">
                Provide your farmer profile below to discover real government schemes you are eligible for right now.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm font-medium text-foreground">
                State
                <select
                  title="State"
                  value={profile.state}
                  onChange={(event) =>
                    setProfile({ ...profile, state: event.target.value })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {["Maharashtra", "Punjab", "Uttar Pradesh", "Rajasthan", "Madhya Pradesh"].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-foreground">
                Age
                <input
                  title="Age"
                  type="number"
                  value={profile.age}
                  min={18}
                  max={90}
                  onChange={(event) =>
                    setProfile({ ...profile, age: Number(event.target.value) })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-foreground">
                Gender
                <select
                  title="Gender"
                  value={profile.gender}
                  onChange={(event) =>
                    setProfile({ ...profile, gender: event.target.value })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-foreground">
                Category
                <select
                  title="Category"
                  value={profile.category}
                  onChange={(event) =>
                    setProfile({ ...profile, category: event.target.value })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-foreground">
                Land Size (Hectares)
                <input
                  title="Land Size"
                  type="number"
                  value={profile.landSize}
                  min={0}
                  step={0.5}
                  onChange={(event) =>
                    setProfile({ ...profile, landSize: Number(event.target.value) })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-foreground">
                Annual Income (INR)
                <input
                  title="Annual income (INR)"
                  type="number"
                  value={profile.income}
                  min={10000}
                  step={1000}
                  onChange={(event) =>
                    setProfile({ ...profile, income: Number(event.target.value) })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 mb-2 mt-4">
              <CheckCircle2 className="h-4 w-4" /> Validated Scheme Matches ({recommendations.length})
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.length > 0 ? (
                recommendations.map((scheme) => (
                  <div
                    key={scheme.name}
                    className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card/80 p-5 transition hover:shadow-md"
                  >
                    <div>
                      <h5 className="font-bold text-foreground text-base leading-tight">{scheme.name}</h5>
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                        {scheme.benefitText}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <a
                        href={scheme.applyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                      >
                        Apply Now
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-xl border-2 border-dashed border-border py-8 text-center text-muted-foreground">
                  No matching schemes found for this exact profile.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "region" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                Region-Specific Recommendations
              </h4>
              <p className="text-sm text-muted-foreground">
                Align schemes to geography, seasonality, and policy focus.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm font-medium text-foreground">
                Region
                <select
                  title="Region"
                  value={region}
                  onChange={(event) => setRegion(event.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="north">North</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="west">West</option>
                  <option value="central">Central</option>
                  <option value="northeast">North East</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-foreground">
                Season
                <select
                  title="Season"
                  value={season}
                  onChange={(event) => setSeason(event.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {["Kharif", "Rabi", "Zaid"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-foreground">
                Priority focus
                <select
                  title="Priority focus"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {["Credit", "Insurance", "Subsidy", "Inclusion"].map(
                    (option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-5 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                {season} focus for {priority} in {region.toUpperCase()} region
              </p>
              <p className="mt-2">Primary focus: {regionData.focus}</p>
              <p className="mt-2">Alert: {regionData.alert}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {regionData.schemes.map((scheme) => (
                  <div
                    key={scheme}
                    className="rounded-xl border border-border/60 bg-background/80 px-4 py-2 text-xs text-foreground font-semibold"
                  >
                    {scheme}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "loan" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                Loan Viability Prediction
              </h4>
              <p className="text-sm text-muted-foreground">
                Estimate eligibility based on income, land, and rainfall.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm font-medium text-foreground">
                Annual income (INR)
                <input
                  title="Annual income (INR)"
                  type="number"
                  value={loanInputs.income}
                  min={20000}
                  step={1000}
                  onChange={(event) =>
                    setLoanInputs({
                      ...loanInputs,
                      income: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-foreground">
                Land size (acres)
                <input
                  title="Land size (acres)"
                  type="number"
                  value={loanInputs.land}
                  min={0.5}
                  step={0.5}
                  onChange={(event) =>
                    setLoanInputs({
                      ...loanInputs,
                      land: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-foreground">
                Rainfall outlook
                <select
                  title="Rainfall outlook"
                  value={loanInputs.rainfall}
                  onChange={(event) =>
                    setLoanInputs({
                      ...loanInputs,
                      rainfall: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {["Low", "Medium", "High"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 mb-2 mt-2">
              <CheckCircle2 className="h-4 w-4" /> Live Results Enabled
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-5 text-sm">
              <p className="font-semibold text-foreground">
                Readiness score: {loanScore}%
              </p>
              <p className="mt-2 text-muted-foreground">
                {loanScore === 0
                  ? "Click predict eligibility to calculate readiness."
                  : loanScore >= 70
                  ? "Eligible for standard agricultural credit products like KCC."
                  : loanScore >= 50
                  ? "Needs co-applicant or collateral enhancement for major loans."
                  : "Requires assistance or staged support before eligibility."}
              </p>
            </div>
          </div>
        )}

        {activeTab === "admin" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                Hierarchical Administrative Dashboards
              </h4>
              <p className="text-sm text-muted-foreground">
                Set scheme targets and monitor progress for each level.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm font-medium text-foreground">
                Level
                <select
                  title="Level"
                  value={adminTarget.level}
                  onChange={(event) =>
                    setAdminTarget({
                      ...adminTarget,
                      level: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {["National", "State", "District"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-foreground">
                Scheme
                <select
                  title="Scheme"
                  value={adminTarget.scheme}
                  onChange={(event) =>
                    setAdminTarget({
                      ...adminTarget,
                      scheme: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {realSchemeCatalog.map((scheme) => (
                    <option key={scheme.name} value={scheme.name}>
                      {scheme.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-foreground">
                Target households
                <input
                  title="Target households"
                  type="number"
                  value={adminTarget.target}
                  min={100}
                  step={50}
                  onChange={(event) =>
                    setAdminTarget({
                      ...adminTarget,
                      target: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-border/60 bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </label>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 mb-2 mt-2">
              <CheckCircle2 className="h-4 w-4" /> Live Results Enabled
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-5 text-sm">
              <p className="font-semibold text-foreground">
                {adminTarget.level} progress on {adminTarget.scheme}
              </p>
              <p className="mt-2 text-muted-foreground">
                Target: {adminTarget.target} households
              </p>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${targetStatus}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {targetStatus}% achieved across tracked offices.
              </p>
            </div>
          </div>
        )}

        {activeTab === "visuals" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                Interactive Visualizations
              </h4>
              <p className="text-sm text-muted-foreground">
                Project scheme success rates over the next five years.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {([
                { id: "baseline", label: "Baseline" },
                { id: "accelerated", label: "Accelerated" },
              ] as const).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setImpactMode(option.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    impactMode === option.id
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-600"
                      : "border-border/60 bg-background text-muted-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-5">
              {impactValues.map((value, index) => (
                <div
                  key={monthLabels[index]}
                  className="rounded-2xl border border-border/60 bg-card/80 p-4 text-center"
                >
                  <div className="mx-auto mb-3 flex h-28 w-8 items-end rounded-full bg-muted">
                    <div
                      className="mx-auto w-8 rounded-full bg-emerald-500"
                      style={{ height: `${value}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {monthLabels[index]}
                  </p>
                  <p className="text-xs text-muted-foreground">{value}%</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-5 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                Insight summary
              </p>
              <p className="mt-2">
                {impactMode === "baseline"
                  ? "Steady adoption with incremental outreach gains."
                  : "Accelerated adoption with coordinated multi-level campaigns."}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Prediction window updated.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
