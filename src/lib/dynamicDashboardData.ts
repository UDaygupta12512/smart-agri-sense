import {
  DEFAULT_LOCATION,
  buildYieldWeatherContext,
  clamp,
  searchLocations,
  type GeoLocation,
} from '@/lib/agriWeather';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface MarketCommodity {
  id: string;
  crop: string;
  market: string;
  category: 'grain' | 'fiber' | 'pulse' | 'oilseed';
  price: number;
  lastWeek: number;
  change: number;
  date: string;
  msp: number;
}

export interface MarketBasketItem {
  name: string;
  current: number;
  lastWeek: number;
  unit: string;
}

export interface MarketShareItem {
  name: string;
  share: number;
  category: string;
}

export interface MarketTrendPoint {
  label: string;
  price: number;
}

export interface MarketSnapshot {
  updatedAt: string;
  location: string;
  weatherSignal: string;
  commodities: MarketCommodity[];
  vegetables: MarketBasketItem[];
  fruits: MarketBasketItem[];
  marketShare: MarketShareItem[];
  trendSeries: MarketTrendPoint[];
}

export interface LabRecord {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  timings: string;
  tests: string[];
  rating: number;
}

export interface MspRecord {
  cropName: string;
  location: string;
  season: string;
  centralMsp: string;
  stateMsp: string;
  trend: TrendDirection;
  updatedDate: string;
}

export interface SchemeRecord {
  id: string;
  title: string;
  category: string;
  officialUrl: string;
  description: string;
  subsidyRate: string;
  maxAmount: string;
  status: 'active' | 'closed';
  deadline: string;
  eligibility: string;
  beneficiaries: number;
  totalTarget: number;
  benefits: string;
}

export interface CalendarStage {
  id: string;
  stage: string;
  startDate: string;
  endDate: string;
  recommendation: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface CalendarSnapshot {
  crop: string;
  location: string;
  sowingDate: string;
  progressPercent: number;
  seasonStatus: 'completed' | 'active' | 'upcoming';
  weatherNote: string;
  actionPlan: string[];
  stages: CalendarStage[];
}

export interface TraceabilityEvent {
  date: string;
  event: string;
  details: string;
}

export interface TraceabilityRecord {
  id: string;
  crop: string;
  origin: string;
  farmerId: string;
  status: string;
  certifications: string[];
  ledgerHash: string;
  timeline: TraceabilityEvent[];
}

export interface RevenuePoint {
  label: string;
  revenue: number;
}

export interface YieldPoint {
  year: string;
  wheat: number;
  rice: number;
  cotton: number;
}

export interface FertilizerUsagePoint {
  name: string;
  used: number;
  recommended: number;
  unit: string;
}

export interface SoilMetric {
  parameter: string;
  value: number;
  status: 'Low' | 'Medium' | 'High' | 'Normal';
  color: 'red' | 'amber' | 'green';
}

export interface AnalyticsSnapshot {
  location: string;
  generatedAt: string;
  cropHealthScore: number;
  cropHealthTrend: number;
  cropDetails: Array<{ name: string; health: number; area: string }>;
  revenueSeries: RevenuePoint[];
  yieldSeries: YieldPoint[];
  fertilizerUsage: FertilizerUsagePoint[];
  soilMetrics: SoilMetric[];
  pestEfficiency: number;
  pestIncidents: number;
  nextSprayInDays: number;
}

const BASE_COMMODITIES = [
  { crop: 'Wheat (Lokwan)', market: 'APMC Central', category: 'grain' as const, basePrice: 2450, msp: 2425 },
  { crop: 'Rice (Common)', market: 'Regional Mandi', category: 'grain' as const, basePrice: 2580, msp: 2400 },
  { crop: 'Cotton', market: 'Cotton Exchange', category: 'fiber' as const, basePrice: 7350, msp: 7377 },
  { crop: 'Soybean (Yellow)', market: 'Oilseed Yard', category: 'oilseed' as const, basePrice: 5100, msp: 5100 },
  { crop: 'Gram (Chana)', market: 'Pulse Mandi', category: 'pulse' as const, basePrice: 5650, msp: 5650 },
  { crop: 'Tur (Arhar)', market: 'Pulse Mandi', category: 'pulse' as const, basePrice: 8100, msp: 7950 },
  { crop: 'Maize', market: 'Feed Grain Hub', category: 'grain' as const, basePrice: 2320, msp: 2325 },
  { crop: 'Mustard', market: 'Oilseed Yard', category: 'oilseed' as const, basePrice: 6050, msp: 5950 },
];

// Extended crop database for dynamic lookup
const EXTENDED_CROP_DATABASE: Record<string, { basePrice: number; msp: number; category: 'grain' | 'pulse' | 'oilseed' | 'fiber' | 'vegetable' | 'fruit' | 'spice'; market: string }> = {
  // Grains
  'wheat': { basePrice: 2450, msp: 2425, category: 'grain', market: 'APMC Central' },
  'rice': { basePrice: 2580, msp: 2400, category: 'grain', market: 'Regional Mandi' },
  'paddy': { basePrice: 2580, msp: 2400, category: 'grain', market: 'Regional Mandi' },
  'maize': { basePrice: 2320, msp: 2325, category: 'grain', market: 'Feed Grain Hub' },
  'bajra': { basePrice: 2825, msp: 2825, category: 'grain', market: 'Grain Mandi' },
  'jowar': { basePrice: 3571, msp: 3571, category: 'grain', market: 'Grain Mandi' },
  'sorghum': { basePrice: 3571, msp: 3571, category: 'grain', market: 'Grain Mandi' },
  'barley': { basePrice: 1980, msp: 1980, category: 'grain', market: 'Grain Mandi' },
  'ragi': { basePrice: 4150, msp: 4150, category: 'grain', market: 'Millet Hub' },
  'millet': { basePrice: 2800, msp: 2800, category: 'grain', market: 'Millet Hub' },
  // Pulses
  'gram': { basePrice: 5650, msp: 5650, category: 'pulse', market: 'Pulse Mandi' },
  'chana': { basePrice: 5650, msp: 5650, category: 'pulse', market: 'Pulse Mandi' },
  'chickpea': { basePrice: 5650, msp: 5650, category: 'pulse', market: 'Pulse Mandi' },
  'tur': { basePrice: 8100, msp: 7950, category: 'pulse', market: 'Pulse Mandi' },
  'arhar': { basePrice: 8100, msp: 7950, category: 'pulse', market: 'Pulse Mandi' },
  'pigeon pea': { basePrice: 8100, msp: 7950, category: 'pulse', market: 'Pulse Mandi' },
  'moong': { basePrice: 8950, msp: 8950, category: 'pulse', market: 'Pulse Mandi' },
  'mung': { basePrice: 8950, msp: 8950, category: 'pulse', market: 'Pulse Mandi' },
  'urad': { basePrice: 7600, msp: 7600, category: 'pulse', market: 'Pulse Mandi' },
  'black gram': { basePrice: 7600, msp: 7600, category: 'pulse', market: 'Pulse Mandi' },
  'masoor': { basePrice: 6600, msp: 6600, category: 'pulse', market: 'Pulse Mandi' },
  'lentil': { basePrice: 6600, msp: 6600, category: 'pulse', market: 'Pulse Mandi' },
  // Oilseeds
  'soybean': { basePrice: 5100, msp: 5100, category: 'oilseed', market: 'Oilseed Yard' },
  'mustard': { basePrice: 6050, msp: 5950, category: 'oilseed', market: 'Oilseed Yard' },
  'groundnut': { basePrice: 6983, msp: 6983, category: 'oilseed', market: 'Oilseed Yard' },
  'peanut': { basePrice: 6983, msp: 6983, category: 'oilseed', market: 'Oilseed Yard' },
  'sunflower': { basePrice: 7480, msp: 7480, category: 'oilseed', market: 'Oilseed Yard' },
  'sesame': { basePrice: 8500, msp: 8500, category: 'oilseed', market: 'Oilseed Yard' },
  'til': { basePrice: 8500, msp: 8500, category: 'oilseed', market: 'Oilseed Yard' },
  'castor': { basePrice: 6200, msp: 6200, category: 'oilseed', market: 'Oilseed Yard' },
  'safflower': { basePrice: 6000, msp: 6000, category: 'oilseed', market: 'Oilseed Yard' },
  'niger': { basePrice: 7500, msp: 7500, category: 'oilseed', market: 'Oilseed Yard' },
  // Fiber
  'cotton': { basePrice: 7350, msp: 7377, category: 'fiber', market: 'Cotton Exchange' },
  'jute': { basePrice: 5050, msp: 5050, category: 'fiber', market: 'Jute Market' },
  // Vegetables
  'tomato': { basePrice: 26, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'onion': { basePrice: 21, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'potato': { basePrice: 19, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'cabbage': { basePrice: 18, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'cauliflower': { basePrice: 35, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'brinjal': { basePrice: 32, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'eggplant': { basePrice: 32, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'carrot': { basePrice: 28, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'beans': { basePrice: 45, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'peas': { basePrice: 55, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'chilli': { basePrice: 64, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'capsicum': { basePrice: 55, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'cucumber': { basePrice: 22, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'bitter gourd': { basePrice: 38, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'bottle gourd': { basePrice: 20, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'pumpkin': { basePrice: 18, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'spinach': { basePrice: 25, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'methi': { basePrice: 30, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'coriander': { basePrice: 35, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'garlic': { basePrice: 120, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'ginger': { basePrice: 150, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'lady finger': { basePrice: 35, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'okra': { basePrice: 35, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'radish': { basePrice: 18, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  'beetroot': { basePrice: 25, msp: 0, category: 'vegetable', market: 'Vegetable Mandi' },
  // Fruits
  'apple': { basePrice: 170, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'banana': { basePrice: 48, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'orange': { basePrice: 62, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'mango': { basePrice: 260, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'grapes': { basePrice: 92, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'papaya': { basePrice: 44, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'guava': { basePrice: 45, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'pomegranate': { basePrice: 180, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'watermelon': { basePrice: 18, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'muskmelon': { basePrice: 28, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'pineapple': { basePrice: 45, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'litchi': { basePrice: 120, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'coconut': { basePrice: 25, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'sapota': { basePrice: 55, msp: 0, category: 'fruit', market: 'Fruit Market' },
  'chikoo': { basePrice: 55, msp: 0, category: 'fruit', market: 'Fruit Market' },
  // Spices
  'turmeric': { basePrice: 12500, msp: 0, category: 'spice', market: 'Spice Market' },
  'cumin': { basePrice: 32000, msp: 0, category: 'spice', market: 'Spice Market' },
  'coriander seed': { basePrice: 8500, msp: 0, category: 'spice', market: 'Spice Market' },
  'fennel': { basePrice: 14000, msp: 0, category: 'spice', market: 'Spice Market' },
  'fenugreek': { basePrice: 9500, msp: 0, category: 'spice', market: 'Spice Market' },
  'cardamom': { basePrice: 180000, msp: 0, category: 'spice', market: 'Spice Market' },
  'black pepper': { basePrice: 55000, msp: 0, category: 'spice', market: 'Spice Market' },
  'clove': { basePrice: 95000, msp: 0, category: 'spice', market: 'Spice Market' },
  // Cash crops
  'sugarcane': { basePrice: 355, msp: 355, category: 'grain', market: 'Sugar Mill' },
  'tobacco': { basePrice: 18000, msp: 0, category: 'fiber', market: 'Tobacco Board' },
  'tea': { basePrice: 22000, msp: 0, category: 'grain', market: 'Tea Auction' },
  'coffee': { basePrice: 45000, msp: 0, category: 'grain', market: 'Coffee Board' },
  'rubber': { basePrice: 16500, msp: 0, category: 'fiber', market: 'Rubber Market' },
};

// Function to lookup crop data dynamically
function lookupCropData(cropName: string): { basePrice: number; msp: number; category: 'grain' | 'pulse' | 'oilseed' | 'fiber' | 'vegetable' | 'fruit' | 'spice'; market: string } | null {
  const normalized = cropName.toLowerCase().trim().replace(/[^a-z\s]/g, '').trim();

  // Direct lookup
  if (EXTENDED_CROP_DATABASE[normalized]) {
    return EXTENDED_CROP_DATABASE[normalized];
  }

  // Partial match
  for (const [key, value] of Object.entries(EXTENDED_CROP_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
}

const BASE_VEGETABLES = [
  { name: 'Tomato', basePrice: 26, unit: 'kg' },
  { name: 'Onion (Red)', basePrice: 21, unit: 'kg' },
  { name: 'Potato', basePrice: 19, unit: 'kg' },
  { name: 'Cauliflower', basePrice: 35, unit: 'kg' },
  { name: 'Brinjal', basePrice: 32, unit: 'kg' },
  { name: 'Green Chilli', basePrice: 64, unit: 'kg' },
];

const BASE_FRUITS = [
  { name: 'Apple', basePrice: 170, unit: 'kg' },
  { name: 'Banana', basePrice: 48, unit: 'dozen' },
  { name: 'Orange', basePrice: 62, unit: 'kg' },
  { name: 'Grapes', basePrice: 92, unit: 'kg' },
  { name: 'Papaya', basePrice: 44, unit: 'kg' },
  { name: 'Mango', basePrice: 260, unit: 'kg' },
];

const MSP_REFERENCE = [
  { cropName: 'Wheat', baseMsp: 2425, seasonType: 'Rabi', location: 'Punjab/Haryana' },
  { cropName: 'Rice (Common)', baseMsp: 2400, seasonType: 'Kharif', location: 'Punjab/Chhattisgarh' },
  { cropName: 'Rice (Grade A)', baseMsp: 2420, seasonType: 'Kharif', location: 'Punjab/West Bengal' },
  { cropName: 'Cotton (Long Staple)', baseMsp: 7777, seasonType: 'Kharif', location: 'Gujarat/Maharashtra' },
  { cropName: 'Cotton (Medium Staple)', baseMsp: 7377, seasonType: 'Kharif', location: 'Maharashtra/Telangana' },
  { cropName: 'Maize', baseMsp: 2325, seasonType: 'Kharif', location: 'Karnataka/Bihar' },
  { cropName: 'Barley', baseMsp: 1980, seasonType: 'Rabi', location: 'Rajasthan/UP' },
  { cropName: 'Gram (Chana)', baseMsp: 5650, seasonType: 'Rabi', location: 'Madhya Pradesh/Rajasthan' },
  { cropName: 'Tur (Arhar)', baseMsp: 7950, seasonType: 'Kharif', location: 'Maharashtra/Karnataka' },
  { cropName: 'Moong', baseMsp: 8950, seasonType: 'Kharif', location: 'Rajasthan/Maharashtra' },
  { cropName: 'Urad', baseMsp: 7600, seasonType: 'Kharif', location: 'Andhra Pradesh/Telangana' },
  { cropName: 'Groundnut', baseMsp: 6983, seasonType: 'Kharif', location: 'Gujarat/Andhra Pradesh' },
  { cropName: 'Soybean (Yellow)', baseMsp: 5100, seasonType: 'Kharif', location: 'Madhya Pradesh/Maharashtra' },
  { cropName: 'Mustard/Rapeseed', baseMsp: 5950, seasonType: 'Rabi', location: 'Rajasthan/Haryana' },
  { cropName: 'Sunflower Seed', baseMsp: 7480, seasonType: 'Kharif', location: 'Karnataka/Telangana' },
  { cropName: 'Jowar (Hybrid)', baseMsp: 3571, seasonType: 'Kharif', location: 'Maharashtra/Karnataka' },
  { cropName: 'Bajra', baseMsp: 2825, seasonType: 'Kharif', location: 'Rajasthan/Gujarat' },
];

const BASE_SCHEMES: Array<Omit<SchemeRecord, 'beneficiaries' | 'status'>> = [
  {
    id: 'pm-kisan',
    title: 'PM-KISAN Samman Nidhi',
    category: 'Income Support',
    officialUrl: 'https://pmkisan.gov.in/',
    description: 'Direct annual support delivered to eligible farming families through DBT.',
    subsidyRate: '100%',
    maxAmount: '6000/yr',
    deadline: '2030-03-31',
    eligibility: 'All Landholding farmer families with valid Aadhaar-linked bank account. Applicable for small, marginal, and large farmers, women farmers, and SC/ST.',
    totalTarget: 120000000,
    benefits: 'Direct transfer in three installments',
  },
  {
    id: 'pmfby',
    title: 'Pradhan Mantri Fasal Bima Yojana',
    category: 'Insurance',
    officialUrl: 'https://pmfby.gov.in/',
    description: 'Crop insurance against weather shocks, pests, and disease losses.',
    subsidyRate: 'High',
    maxAmount: 'Area based',
    deadline: '2028-07-31',
    eligibility: 'All Farmers growing notified crops in notified districts. Applicable for small, marginal, and large farmers, women farmers, and SC/ST.',
    totalTarget: 50000000,
    benefits: 'Premium support and claim settlement',
  },
  {
    id: 'pmksy',
    title: 'Pradhan Mantri Krishi Sinchayee Yojana',
    category: 'Irrigation',
    officialUrl: 'https://pmksy.gov.in/',
    description: 'Micro-irrigation support to improve water-use efficiency.',
    subsidyRate: '45-55%',
    maxAmount: '100000',
    deadline: '2027-03-31',
    eligibility: 'All farmers, with priority for small and marginal holdings. Includes women farmers and SC/ST.',
    totalTarget: 15000000,
    benefits: 'Subsidy on drip and sprinkler systems',
  },
  {
    id: 'smam',
    title: 'Sub-Mission on Agricultural Mechanization',
    category: 'Equipment',
    officialUrl: 'https://agrimachinery.nic.in/',
    description: 'Financial support for modern farm machinery and implements.',
    subsidyRate: '40-50%',
    maxAmount: '150000',
    deadline: '2028-12-31',
    eligibility: 'All Individual farmers, FPOs, SHGs, and cooperatives. Suitable for large farmers, small farmers, women farmers, and SC/ST.',
    totalTarget: 1200000,
    benefits: 'Subsidy for tractors, power tillers, and implements',
  },
  {
    id: 'aif',
    title: 'Agriculture Infrastructure Fund',
    category: 'Infrastructure',
    officialUrl: 'https://agriinfra.dac.gov.in/',
    description: 'Credit-linked funding for post-harvest infrastructure and value chain assets.',
    subsidyRate: '3% Interest',
    maxAmount: '20000000',
    deadline: '2032-03-31',
    eligibility: 'All Farmers, startups, agri-entrepreneurs, and FPOs. Applicable for small, marginal, and large farmers, women farmers, and SC/ST.',
    totalTarget: 75000,
    benefits: 'Interest subvention and credit guarantee support',
  },
  {
    id: 'pkvy',
    title: 'Paramparagat Krishi Vikas Yojana',
    category: 'Organic Farming',
    officialUrl: 'https://pgsindia-ncof.gov.in/',
    description: 'Cluster-based support for certified organic farming transition.',
    subsidyRate: '50000/ha',
    maxAmount: '50000/ha',
    deadline: '2027-12-31',
    eligibility: 'All farmers adopting chemical-free natural farming. Includes small, marginal, large farmers, women farmers, and SC/ST.',
    totalTarget: 5000000,
    benefits: 'Capacity building, organic certification, and marketing support',
  },
  {
    id: 'fert-subsidy',
    title: 'Urea and Nutrient Based Subsidy (NBS)',
    category: 'Latest Subsidies',
    officialUrl: 'https://fert.nic.in/',
    description: 'Subsidized availability of Urea and P&K fertilizers to farmers at statutory controlled prices.',
    subsidyRate: 'High',
    maxAmount: 'Direct to manufacturer',
    deadline: 'ongoing',
    eligibility: 'All registered farmers purchasing fertilizers through PoS devices. Covers small, marginal, large farmers, women farmers, and SC/ST.',
    totalTarget: 140000000,
    benefits: 'Discounted fertilizer prices at retail points',
  },
  {
    id: 'kcc-loan',
    title: 'Kisan Credit Card (KCC) Loan Scheme',
    category: 'Loan Schemes',
    officialUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    description: 'Short-term credit limits for crop cultivation, animal husbandry, and fisheries at concessional rates.',
    subsidyRate: '3% Interest Subvention',
    maxAmount: '300000',
    deadline: 'ongoing',
    eligibility: 'All Farmers, tenant farmers, and sharecroppers. Applicable for small and marginal, large farmers, women farmers, and SC/ST.',
    totalTarget: 70000000,
    benefits: 'Low-interest short-term credit for agricultural needs',
  },
  {
    id: 'pmfby-plus',
    title: 'PMFBY - Expanded Insurance Coverage',
    category: 'Insurance Programs',
    officialUrl: 'https://pmfby.gov.in/',
    description: 'Expanded crop insurance coverage including localized calamities and post-harvest losses.',
    subsidyRate: 'Up to 90% Premium',
    maxAmount: 'Sum Insured',
    deadline: '2027-12-31',
    eligibility: 'All farmers growing notified crops in notified areas. Covers small, marginal, large farmers, women farmers, and SC/ST.',
    totalTarget: 60000000,
    benefits: 'Comprehensive risk coverage against natural perils',
  },
  {
    id: 'kcc',
    title: 'Kisan Credit Card',
    category: 'Credit',
    officialUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    description: 'Revolving short-term credit for crop and allied agricultural needs.',
    subsidyRate: '3% Subvention',
    maxAmount: '300000',
    deadline: '2030-03-31',
    eligibility: 'All Farmers, tenant farmers, and sharecroppers. Applicable for small, marginal, large farmers, women farmers, and SC/ST.',
    totalTarget: 90000000,
    benefits: 'Lower effective interest for timely repayment',
  },
  {
    id: 'nmeo-op',
    title: 'National Mission on Edible Oils - Oil Palm',
    category: 'Seeds & Planting',
    officialUrl: 'https://nmeo.dac.gov.in/',
    description: 'Support for oil palm area expansion and planting material.',
    subsidyRate: 'Assistance',
    maxAmount: '29000/ha',
    deadline: `${new Date().getFullYear() + 1}-12-31`,
    eligibility: 'All Farmers cultivating oil palm in designated districts. Includes small, marginal, large farmers, women farmers, and SC/ST.',
    totalTarget: 120000,
    benefits: 'Planting and maintenance support',
  },
];

const CALENDAR_TEMPLATES: Record<
  string,
  Array<{ stage: string; durationDays: number; recommendation: string }>
> = {
  Wheat: [
    { stage: 'Soil Preparation', durationDays: 14, recommendation: 'Deep plough and level field before sowing.' },
    { stage: 'Sowing', durationDays: 20, recommendation: 'Use certified seed and maintain spacing.' },
    { stage: 'CRI Irrigation', durationDays: 18, recommendation: 'Apply first irrigation at crown root initiation.' },
    { stage: 'Top Dressing', durationDays: 28, recommendation: 'Split nitrogen dose to reduce nutrient loss.' },
    { stage: 'Flowering', durationDays: 25, recommendation: 'Avoid moisture stress during heading and flowering.' },
    { stage: 'Harvesting', durationDays: 16, recommendation: 'Harvest when grain moisture falls below 20 percent.' },
  ],
  'Rice (Paddy)': [
    { stage: 'Nursery', durationDays: 20, recommendation: 'Raise healthy seedlings and manage standing water.' },
    { stage: 'Transplanting', durationDays: 18, recommendation: 'Transplant 20-25 day old seedlings at proper spacing.' },
    { stage: 'Tillering', durationDays: 30, recommendation: 'Maintain shallow water and apply top dressing.' },
    { stage: 'Panicle Initiation', durationDays: 24, recommendation: 'Ensure uninterrupted moisture during panicle stage.' },
    { stage: 'Grain Filling', durationDays: 22, recommendation: 'Protect crop from stem borer and blast pressure.' },
    { stage: 'Harvesting', durationDays: 14, recommendation: 'Drain water before harvest and avoid delayed cutting.' },
  ],
  Rice: [
    { stage: 'Nursery', durationDays: 20, recommendation: 'Raise healthy seedlings and manage standing water.' },
    { stage: 'Transplanting', durationDays: 18, recommendation: 'Transplant 20-25 day old seedlings at proper spacing.' },
    { stage: 'Tillering', durationDays: 30, recommendation: 'Maintain shallow water and apply top dressing.' },
    { stage: 'Panicle Initiation', durationDays: 24, recommendation: 'Ensure uninterrupted moisture during panicle stage.' },
    { stage: 'Grain Filling', durationDays: 22, recommendation: 'Protect crop from stem borer and blast pressure.' },
    { stage: 'Harvesting', durationDays: 14, recommendation: 'Drain water before harvest and avoid delayed cutting.' },
  ],
  Cotton: [
    { stage: 'Sowing', durationDays: 16, recommendation: 'Adopt seed treatment and maintain recommended spacing.' },
    { stage: 'Vegetative', durationDays: 30, recommendation: 'Control weeds and monitor early sucking pests.' },
    { stage: 'Square and Flowering', durationDays: 35, recommendation: 'Irrigate at critical flowering stage.' },
    { stage: 'Boll Development', durationDays: 28, recommendation: 'Use ETL-based pest control for bollworm.' },
    { stage: 'Picking', durationDays: 24, recommendation: 'Pick open bolls in multiple rounds for quality lint.' },
  ],
  Maize: [
    { stage: 'Sowing', durationDays: 14, recommendation: 'Sow on ridges and ensure seed placement uniformity.' },
    { stage: 'Knee High', durationDays: 22, recommendation: 'Apply top-dress nitrogen at knee-high stage.' },
    { stage: 'Tasseling', durationDays: 24, recommendation: 'Avoid moisture stress during tassel and silk stage.' },
    { stage: 'Grain Development', durationDays: 25, recommendation: 'Monitor fall armyworm and foliar disease pressure.' },
    { stage: 'Harvesting', durationDays: 14, recommendation: 'Harvest when husk turns dry and cobs harden.' },
  ],
  Soybean: [
    { stage: 'Sowing', durationDays: 13, recommendation: 'Treat seed with Rhizobium and fungicide before sowing.' },
    { stage: 'Vegetative', durationDays: 23, recommendation: 'Maintain weed-free field in first 45 days.' },
    { stage: 'Flowering', durationDays: 22, recommendation: 'Protect crop from moisture stress during flowering.' },
    { stage: 'Pod Development', durationDays: 21, recommendation: 'Scout for girdle beetle and stem fly regularly.' },
    { stage: 'Harvesting', durationDays: 15, recommendation: 'Harvest when pods turn brown and leaves shed.' },
  ],
  Sugarcane: [
    { stage: 'Land Preparation', durationDays: 14, recommendation: 'Deep plough and prepare ridges for planting.' },
    { stage: 'Planting', durationDays: 21, recommendation: 'Plant healthy setts with 2-3 buds each.' },
    { stage: 'Germination', durationDays: 35, recommendation: 'Maintain soil moisture for uniform sprouting.' },
    { stage: 'Tillering', durationDays: 60, recommendation: 'Apply nitrogen and earthing up during tillering.' },
    { stage: 'Grand Growth', durationDays: 120, recommendation: 'Ensure regular irrigation and pest monitoring.' },
    { stage: 'Maturity', durationDays: 90, recommendation: 'Stop irrigation 3 weeks before harvest.' },
    { stage: 'Harvesting', durationDays: 20, recommendation: 'Harvest when brix reading reaches 18-20.' },
  ],
  Potato: [
    { stage: 'Land Preparation', durationDays: 10, recommendation: 'Prepare well-drained beds with good tilth.' },
    { stage: 'Planting', durationDays: 15, recommendation: 'Plant sprouted tubers at recommended spacing.' },
    { stage: 'Emergence', durationDays: 20, recommendation: 'Monitor for early blight and maintain moisture.' },
    { stage: 'Vegetative Growth', durationDays: 25, recommendation: 'Apply second earthing up and fertilizer.' },
    { stage: 'Tuber Bulking', durationDays: 30, recommendation: 'Ensure consistent irrigation for tuber development.' },
    { stage: 'Harvesting', durationDays: 14, recommendation: 'Stop irrigation 2 weeks before harvest, cure tubers.' },
  ],
  Tomato: [
    { stage: 'Nursery', durationDays: 25, recommendation: 'Raise seedlings in protected nursery beds.' },
    { stage: 'Transplanting', durationDays: 14, recommendation: 'Transplant healthy seedlings with proper spacing.' },
    { stage: 'Vegetative Growth', durationDays: 30, recommendation: 'Stake plants and manage early pests.' },
    { stage: 'Flowering', durationDays: 20, recommendation: 'Ensure pollination and apply balanced fertilizer.' },
    { stage: 'Fruit Development', durationDays: 35, recommendation: 'Monitor for fruit borers and diseases.' },
    { stage: 'Harvesting', durationDays: 40, recommendation: 'Harvest ripe fruits in multiple pickings.' },
  ],
  Onion: [
    { stage: 'Nursery', durationDays: 45, recommendation: 'Raise seedlings in well-prepared nursery beds.' },
    { stage: 'Transplanting', durationDays: 14, recommendation: 'Transplant 6-week old seedlings at 15cm spacing.' },
    { stage: 'Establishment', durationDays: 21, recommendation: 'Maintain soil moisture and control weeds.' },
    { stage: 'Bulb Formation', durationDays: 35, recommendation: 'Apply potash and reduce nitrogen during bulbing.' },
    { stage: 'Maturity', durationDays: 25, recommendation: 'Stop irrigation when tops start falling.' },
    { stage: 'Harvesting & Curing', durationDays: 14, recommendation: 'Harvest and cure bulbs for 10-15 days.' },
  ],
  Groundnut: [
    { stage: 'Land Preparation', durationDays: 10, recommendation: 'Prepare well-drained sandy loam soil.' },
    { stage: 'Sowing', durationDays: 14, recommendation: 'Sow treated seeds at proper depth and spacing.' },
    { stage: 'Vegetative', durationDays: 30, recommendation: 'Control weeds and apply gypsum at flowering.' },
    { stage: 'Pegging', durationDays: 25, recommendation: 'Maintain soil moisture for peg penetration.' },
    { stage: 'Pod Development', durationDays: 30, recommendation: 'Monitor for leaf spot and rust diseases.' },
    { stage: 'Harvesting', durationDays: 14, recommendation: 'Harvest when leaves turn yellow and pods mature.' },
  ],
  Mustard: [
    { stage: 'Land Preparation', durationDays: 10, recommendation: 'Prepare fine seedbed with good moisture.' },
    { stage: 'Sowing', durationDays: 12, recommendation: 'Sow seeds in rows at recommended spacing.' },
    { stage: 'Vegetative Growth', durationDays: 35, recommendation: 'Apply first irrigation and nitrogen.' },
    { stage: 'Flowering', durationDays: 25, recommendation: 'Monitor for aphids during flowering.' },
    { stage: 'Siliqua Development', durationDays: 30, recommendation: 'Avoid moisture stress during seed filling.' },
    { stage: 'Harvesting', durationDays: 14, recommendation: 'Harvest when 75% siliqua turn golden yellow.' },
  ],
  Gram: [
    { stage: 'Land Preparation', durationDays: 10, recommendation: 'Prepare field with good soil moisture.' },
    { stage: 'Sowing', durationDays: 14, recommendation: 'Sow treated seeds at proper depth.' },
    { stage: 'Vegetative', durationDays: 30, recommendation: 'Apply pre-emergence herbicide and monitor pests.' },
    { stage: 'Flowering', durationDays: 25, recommendation: 'Light irrigation if soil moisture is low.' },
    { stage: 'Pod Development', durationDays: 25, recommendation: 'Monitor for pod borer and apply control.' },
    { stage: 'Harvesting', durationDays: 14, recommendation: 'Harvest when leaves dry and pods turn brown.' },
  ],
  Chana: [
    { stage: 'Land Preparation', durationDays: 10, recommendation: 'Prepare field with good soil moisture.' },
    { stage: 'Sowing', durationDays: 14, recommendation: 'Sow treated seeds at proper depth.' },
    { stage: 'Vegetative', durationDays: 30, recommendation: 'Apply pre-emergence herbicide and monitor pests.' },
    { stage: 'Flowering', durationDays: 25, recommendation: 'Light irrigation if soil moisture is low.' },
    { stage: 'Pod Development', durationDays: 25, recommendation: 'Monitor for pod borer and apply control.' },
    { stage: 'Harvesting', durationDays: 14, recommendation: 'Harvest when leaves dry and pods turn brown.' },
  ],
  Bajra: [
    { stage: 'Land Preparation', durationDays: 10, recommendation: 'Prepare field with one deep ploughing.' },
    { stage: 'Sowing', durationDays: 14, recommendation: 'Sow seeds after onset of monsoon rains.' },
    { stage: 'Vegetative Growth', durationDays: 25, recommendation: 'Apply nitrogen and control weeds.' },
    { stage: 'Ear Head Emergence', durationDays: 20, recommendation: 'Monitor for shoot fly and ear head worms.' },
    { stage: 'Grain Filling', durationDays: 20, recommendation: 'Protect from bird damage during grain filling.' },
    { stage: 'Harvesting', durationDays: 12, recommendation: 'Harvest when grains are hard and plant dries.' },
  ],
  Jowar: [
    { stage: 'Land Preparation', durationDays: 10, recommendation: 'Prepare field with good tilth.' },
    { stage: 'Sowing', durationDays: 14, recommendation: 'Sow seeds with proper depth and spacing.' },
    { stage: 'Vegetative Growth', durationDays: 30, recommendation: 'Control weeds and apply fertilizer.' },
    { stage: 'Ear Head Emergence', durationDays: 20, recommendation: 'Monitor for shoot fly and stem borer.' },
    { stage: 'Grain Development', durationDays: 25, recommendation: 'Protect from grain mold if rains occur.' },
    { stage: 'Harvesting', durationDays: 14, recommendation: 'Harvest when grains are fully mature.' },
  ],
};

// Generate dynamic calendar template for any crop
function generateDynamicCalendarTemplate(cropName: string): Array<{ stage: string; durationDays: number; recommendation: string }> {
  const crop = cropName.charAt(0).toUpperCase() + cropName.slice(1).toLowerCase();
  const cropData = lookupCropData(cropName);
  const category = cropData?.category || 'grain';

  // Generate appropriate stages based on crop category
  if (category === 'vegetable') {
    return [
      { stage: 'Nursery/Seed Preparation', durationDays: 20, recommendation: `Prepare ${crop} seedlings in nursery or treated seeds.` },
      { stage: 'Transplanting/Sowing', durationDays: 14, recommendation: `Transplant or direct sow ${crop} at recommended spacing.` },
      { stage: 'Vegetative Growth', durationDays: 25, recommendation: `Apply fertilizer and maintain soil moisture for ${crop}.` },
      { stage: 'Flowering/Fruiting', durationDays: 30, recommendation: `Monitor for pests and ensure proper nutrition for ${crop}.` },
      { stage: 'Harvesting', durationDays: 30, recommendation: `Harvest ${crop} at optimum maturity in multiple pickings.` },
    ];
  } else if (category === 'fruit') {
    return [
      { stage: 'Planting/Establishment', durationDays: 30, recommendation: `Plant ${crop} with proper pit preparation and spacing.` },
      { stage: 'Vegetative Growth', durationDays: 90, recommendation: `Apply manure, maintain irrigation, and train plants for ${crop}.` },
      { stage: 'Flowering', durationDays: 30, recommendation: `Ensure pollination and monitor for pests on ${crop}.` },
      { stage: 'Fruit Development', durationDays: 60, recommendation: `Apply balanced fertilizer and protect ${crop} from pests.` },
      { stage: 'Harvesting', durationDays: 45, recommendation: `Harvest ${crop} at proper maturity for best quality.` },
    ];
  } else if (category === 'pulse') {
    return [
      { stage: 'Land Preparation', durationDays: 10, recommendation: `Prepare field with good tilth for ${crop}.` },
      { stage: 'Sowing', durationDays: 14, recommendation: `Treat seeds with Rhizobium and sow ${crop} at proper depth.` },
      { stage: 'Vegetative Growth', durationDays: 30, recommendation: `Control weeds and apply phosphorus for ${crop}.` },
      { stage: 'Flowering', durationDays: 25, recommendation: `Light irrigation if needed, monitor pests on ${crop}.` },
      { stage: 'Pod Development', durationDays: 25, recommendation: `Monitor for pod borers and diseases in ${crop}.` },
      { stage: 'Harvesting', durationDays: 14, recommendation: `Harvest ${crop} when pods are mature and plants dry.` },
    ];
  } else if (category === 'oilseed') {
    return [
      { stage: 'Field Preparation', durationDays: 10, recommendation: `Prepare well-drained field for ${crop}.` },
      { stage: 'Sowing', durationDays: 14, recommendation: `Sow treated ${crop} seeds at recommended spacing.` },
      { stage: 'Vegetative Stage', durationDays: 30, recommendation: `Apply fertilizer and control weeds in ${crop}.` },
      { stage: 'Flowering', durationDays: 25, recommendation: `Ensure good moisture and monitor for pests.` },
      { stage: 'Seed Development', durationDays: 30, recommendation: `Avoid stress during seed filling stage of ${crop}.` },
      { stage: 'Harvesting', durationDays: 14, recommendation: `Harvest ${crop} when seeds are physiologically mature.` },
    ];
  } else if (category === 'spice') {
    return [
      { stage: 'Land Preparation', durationDays: 14, recommendation: `Prepare beds with good drainage for ${crop}.` },
      { stage: 'Planting', durationDays: 21, recommendation: `Plant ${crop} rhizomes/seeds at proper depth.` },
      { stage: 'Establishment', durationDays: 30, recommendation: `Maintain shade and moisture for ${crop}.` },
      { stage: 'Growth Period', durationDays: 90, recommendation: `Apply organic manure and monitor for diseases.` },
      { stage: 'Maturity', durationDays: 30, recommendation: `Reduce irrigation as ${crop} approaches maturity.` },
      { stage: 'Harvesting', durationDays: 21, recommendation: `Harvest ${crop} at optimal maturity and cure properly.` },
    ];
  } else {
    // Default grain template
    return [
      { stage: 'Soil Preparation', durationDays: 14, recommendation: `Prepare field with good tilth for ${crop}.` },
      { stage: 'Sowing', durationDays: 16, recommendation: `Use quality seeds and maintain proper spacing for ${crop}.` },
      { stage: 'Vegetative Growth', durationDays: 30, recommendation: `Apply nitrogen and control weeds in ${crop} field.` },
      { stage: 'Reproductive Stage', durationDays: 25, recommendation: `Ensure proper irrigation during critical growth of ${crop}.` },
      { stage: 'Grain Development', durationDays: 25, recommendation: `Monitor for pests and diseases in ${crop}.` },
      { stage: 'Harvesting', durationDays: 14, recommendation: `Harvest ${crop} at proper moisture content.` },
    ];
  }
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function seededUnit(seed: number): number {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

function seededRange(seed: number, min: number, max: number): number {
  return min + seededUnit(seed) * (max - min);
}

function dayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getFullYear(), 0, 0));
  const current = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const diff = current.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInputLocal(input: string): Date | null {
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, monthIndex, day, 12, 0, 0, 0);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (parsed.getFullYear() !== year || parsed.getMonth() !== monthIndex || parsed.getDate() !== day) {
    return null;
  }

  return parsed;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-IN');
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function resolveLocationLabel(location: GeoLocation): string {
  const state = location.state ? `, ${location.state}` : '';
  const country = location.country ? `, ${location.country}` : '';
  return `${location.name}${state}${country}`;
}

async function resolveLocation(locationQuery: string): Promise<GeoLocation> {
  if (!locationQuery.trim()) {
    return DEFAULT_LOCATION;
  }

  try {
    const results = await searchLocations(locationQuery, 1);
    return results[0] ?? DEFAULT_LOCATION;
  } catch {
    return DEFAULT_LOCATION;
  }
}

function buildPhoneFromSeed(seed: number): string {
  const first = 70000 + (seed % 9000);
  const second = 10000 + ((seed >> 3) % 9000);
  return `+91 ${first.toString().padStart(5, '0')} ${second.toString().padStart(5, '0')}`;
}

function pick<T>(items: T[], seed: number): T {
  const index = Math.floor(seededRange(seed, 0, items.length));
  return items[Math.min(index, items.length - 1)];
}

function roundCurrency(value: number): number {
  return Math.max(1, Math.round(value));
}

export async function generateMarketSnapshot(locationQuery: string, cropQuery = ''): Promise<MarketSnapshot> {
  // Resolve location gracefully, but avoid generating synthetic market movement.
  const location = await resolveLocation(locationQuery || '');
  const today = new Date();
  let weatherSignal = 'Live weather unavailable. Showing reference mandi prices and MSP values.';

  try {
    const weather = await buildYieldWeatherContext(location.name);
    weatherSignal =
      `Weather snapshot: ${Math.round(weather.avgTemp)}°C, ` +
      `rain probability ${Math.round(weather.avgRainProbability)}%, ` +
      `humidity ${Math.round(weather.avgHumidity)}%. ` +
      `Market prices below are reference values (not live mandi feed). Updated ${today.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      })}.`;
  } catch {
    // Keep fallback message when weather lookup fails.
  }

  const searchedCrop = cropQuery.trim().toLowerCase();
  let commoditiesToShow = BASE_COMMODITIES;

  if (searchedCrop) {
    const cropData = lookupCropData(searchedCrop);
    if (!cropData) {
      throw new Error(`No verified reference data found for crop "${cropQuery.trim()}".`);
    }

    const customCommodity = {
      crop: searchedCrop.charAt(0).toUpperCase() + searchedCrop.slice(1),
      market: cropData.market,
      category: cropData.category as 'grain' | 'fiber' | 'pulse' | 'oilseed',
      basePrice: cropData.basePrice,
      msp: cropData.msp,
    };

    const existingIndex = BASE_COMMODITIES.findIndex(
      c => c.crop.toLowerCase().includes(searchedCrop) || searchedCrop.includes(c.crop.toLowerCase())
    );
    if (existingIndex === -1) {
      commoditiesToShow = [customCommodity, ...BASE_COMMODITIES.slice(0, 7)];
    }
  }

  const commodities = commoditiesToShow.map((item, idx) => {
    // Use static prices instead of randomized mock generation
    const price = roundCurrency(item.basePrice);
    const lastWeek = roundCurrency(item.basePrice * 0.98); // Static 2% week-over-week difference
    const change = 2.0; // Fixed +2.0%

    return {
      id: `${idx + 1}`,
      crop: item.crop,
      market: `${location.name} ${item.market}`,
      category: item.category,
      price,
      lastWeek,
      change,
      date: formatDateISO(today),
      msp: item.msp,
    } satisfies MarketCommodity;
  });

  const baskets = (baseItems: typeof BASE_VEGETABLES): MarketBasketItem[] => {
    return baseItems.map((item) => {
      const current = roundCurrency(item.basePrice);
      const lastWeek = roundCurrency(item.basePrice * 0.95); // 5% diff
      return {
        name: item.name,
        current,
        lastWeek,
        unit: item.unit,
      };
    });
  };

  const vegetables = baskets(BASE_VEGETABLES);
  const fruits = baskets(BASE_FRUITS);

  const shareAccumulator = new Map<string, number>();
  for (const row of commodities) {
    const prev = shareAccumulator.get(row.category) ?? 0;
    shareAccumulator.set(row.category, prev + row.price);
  }
  const totalVolume = Array.from(shareAccumulator.values()).reduce((sum, value) => sum + value, 0);
  const categoryLabel: Record<string, string> = {
    grain: 'Grains',
    pulse: 'Pulses',
    fiber: 'Fiber Crops',
    oilseed: 'Oilseeds',
  };

  const marketShare = Array.from(shareAccumulator.entries()).map(([category, value]) => ({
    name: categoryLabel[category] ?? category,
    category,
    share: Number(((value / Math.max(totalVolume, 1)) * 100).toFixed(1)),
  }));

  const reference = commodities.find((item) => item.crop.toLowerCase().includes('rice')) ?? commodities[0];
  const trendSeries: MarketTrendPoint[] = Array.from({ length: 12 }, (_, idx) => {
    const back = 11 - idx;
    const price = roundCurrency(reference.price);
    const pointDate = addDays(today, -back * 7);

    return {
      label: pointDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      price,
    };
  });

  return {
    updatedAt: today.toISOString(),
    location: resolveLocationLabel(location),
    weatherSignal,
    commodities,
    vegetables,
    fruits,
    marketShare,
    trendSeries,
  };
}

export async function generateLabs(locationQuery: string): Promise<{ location: string; labs: LabRecord[] }> {
  const location = await resolveLocation(locationQuery || '');
  const locationLabel = resolveLocationLabel(location);

  return {
    location: locationLabel,
    labs: [
      {
        id: 'lab-1',
        name: 'National Soil Testing Center',
        address: `Central Agriculture Complex, ${location.name}`,
        distance: '4.2 km',
        phone: '+91 80000 12345',
        timings: '09:00 AM - 05:00 PM',
        tests: ['Soil Health Card', 'NPK Analysis', 'Micronutrients'],
        rating: 4.8,
      },
      {
        id: 'lab-2',
        name: 'KVK District Laboratory',
        address: `Krishi Vigyan Kendra, ${location.state || location.name}`,
        distance: '12.5 km',
        phone: '+91 80000 54321',
        timings: '10:00 AM - 04:00 PM',
        tests: ['Water Quality', 'Pesticide Residue', 'Soil Pathology'],
        rating: 4.5,
      },
      {
        id: 'lab-3',
        name: 'Agri-Clinic & Agri-Business Center',
        address: `Market Yard Road, ${location.name}`,
        distance: '2.1 km',
        phone: '+91 80000 98765',
        timings: '08:30 AM - 06:00 PM',
        tests: ['Seed Germination', 'Moisture Test'],
        rating: 4.2,
      }
    ],
  };
}

export function getLabsData() {
  return [
    { testName: 'Standard Soil Test', status: 'Completed', date: '2026-05-10', ph: 6.8, n: 'Medium', p: 'High' },
    { testName: 'Water Quality Analysis', status: 'In Progress', date: '2026-06-01', ph: 7.1, n: '-', p: '-' },
    { testName: 'Comprehensive NPK', status: 'Completed', date: '2026-02-15', ph: 6.5, n: 'Low', p: 'Medium' }
  ];
}

function parseMarketingYear(marketingYear: string): number {
  const year = Number.parseInt(marketingYear.slice(0, 4), 10);
  if (Number.isFinite(year) && year >= 2015 && year <= 2050) {
    return year;
  }
  return 2025;
}

function formatRupeesPerQuintal(value: number): string {
  return `${Math.round(value)}/q`;
}

export function generateMspTable(marketingYear: string, region: string): MspRecord[] {
  const targetYear = parseMarketingYear(marketingYear || '');
  const seasonLabel = `${targetYear}-${String(targetYear + 1).slice(2)}`;
  const locationLabel = region === 'All Regions' || !region ? '' : region;
  const now = new Date();

  return MSP_REFERENCE.map((item, idx) => {
    const central = item.baseMsp;
    const state = item.baseMsp;
    const trend: TrendDirection = 'stable';

    return {
      cropName: item.cropName,
      location: locationLabel || item.location,
      season: `${item.seasonType} ${seasonLabel}`,
      centralMsp: formatRupeesPerQuintal(central),
      stateMsp: formatRupeesPerQuintal(state),
      trend,
      updatedDate: formatDateDisplay(addDays(now, -(idx % 6))),
    };
  });
}

function formatDeadline(deadlineIso: string): string {
  if (deadlineIso === 'ongoing') {
    return 'Ongoing';
  }
  const date = new Date(deadlineIso);
  if (Number.isNaN(date.getTime())) {
    return 'Ongoing';
  }
  return date.toLocaleDateString('en-IN');
}

export function generateSchemes(region: string): { region: string; schemes: SchemeRecord[] } {
  const now = new Date();

  const schemes = BASE_SCHEMES.map((scheme) => {
    // Use a fixed realistic percentage instead of random generation
    const beneficiaries = Math.floor(scheme.totalTarget * 0.45);
    const deadlineDate = new Date(scheme.deadline);
    const isClosed = !Number.isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < now.getTime();

    return {
      ...scheme,
      status: isClosed ? 'closed' : 'active',
      deadline: formatDeadline(scheme.deadline),
      beneficiaries,
      totalTarget: scheme.totalTarget,
      eligibility:
        region && region !== 'India'
          ? `${scheme.eligibility} Priority processing in ${region}.`
          : scheme.eligibility,
      maxAmount:
        scheme.maxAmount.includes('/') || scheme.maxAmount.includes('%')
          ? scheme.maxAmount
          : `${scheme.maxAmount}`,
      subsidyRate: scheme.subsidyRate,
    } satisfies SchemeRecord;
  });

  return {
    region: region || 'India',
    schemes,
  };
}

const CROP_DEFAULT_SOWING_WINDOW: Record<string, { monthIndex: number; day: number }> = {
  Wheat: { monthIndex: 10, day: 1 },
  'Rice (Paddy)': { monthIndex: 5, day: 20 },
  Rice: { monthIndex: 5, day: 20 },
  Cotton: { monthIndex: 5, day: 10 },
  Maize: { monthIndex: 5, day: 15 },
  Soybean: { monthIndex: 5, day: 25 },
};

function defaultSowingDate(crop: string, templates: Array<{ durationDays: number }>): Date {
  const now = new Date();
  const year = now.getFullYear();
  const totalCycleDays = templates.reduce((sum, stage) => sum + stage.durationDays, 0);

  const windowKey = Object.keys(CROP_DEFAULT_SOWING_WINDOW).find(
    (key) => key.toLowerCase() === crop.toLowerCase() || key.toLowerCase().includes(crop.toLowerCase())
  );

  if (!windowKey) {
    return addDays(now, -5);
  }

  const window = CROP_DEFAULT_SOWING_WINDOW[windowKey];
  const thisYearSowing = new Date(year, window.monthIndex, window.day, 12, 0, 0, 0);
  const prevYearSowing = new Date(year - 1, window.monthIndex, window.day, 12, 0, 0, 0);

  const thisYearEnd = addDays(thisYearSowing, totalCycleDays);
  const prevYearEnd = addDays(prevYearSowing, totalCycleDays);

  // Prefer whichever cycle contains the current date for accurate active/completed stages.
  if (now >= thisYearSowing && now <= thisYearEnd) {
    return thisYearSowing;
  }
  if (now >= prevYearSowing && now <= prevYearEnd) {
    return prevYearSowing;
  }

  // If both cycles are outside current date, choose the closer cycle anchor.
  const diffThisYear = Math.abs(thisYearSowing.getTime() - now.getTime());
  const diffPrevYear = Math.abs(prevYearSowing.getTime() - now.getTime());
  return diffPrevYear < diffThisYear ? prevYearSowing : thisYearSowing;
}

// Helper to shift date based on location seed
function applyLocationShift(date: Date, locationName: string): Date {
  const seed = hashString(locationName);
  // Shift by -15 to +15 days depending on location to simulate climate differences
  const shiftDays = Math.floor(seededRange(seed, -15, 15));
  return addDays(date, shiftDays);
}

export async function generateCalendar(
  crop: string,
  sowingDateInput: string,
  locationQuery: string
): Promise<CalendarSnapshot> {
  // Accept any crop, try to find matching template or generate dynamic one
  const normalizedCrop = crop.trim();
  const cropKey = Object.keys(CALENDAR_TEMPLATES).find(
    (k) => k.toLowerCase() === normalizedCrop.toLowerCase() ||
           k.toLowerCase().includes(normalizedCrop.toLowerCase()) ||
           normalizedCrop.toLowerCase().includes(k.toLowerCase())
  );

  // Use predefined template if found, otherwise generate dynamic template
  const templates = cropKey
    ? CALENDAR_TEMPLATES[cropKey]
    : generateDynamicCalendarTemplate(normalizedCrop);

  const displayCropName = cropKey || (normalizedCrop.charAt(0).toUpperCase() + normalizedCrop.slice(1).toLowerCase());

  const parsedDate = parseDateInputLocal(sowingDateInput);
  const location = await resolveLocation(locationQuery || '');
  
  // Apply location shift if date was not explicitly provided by user
  let sowingDate = parsedDate;
  if (!sowingDate) {
    const defaultDate = defaultSowingDate(displayCropName, templates);
    sowingDate = applyLocationShift(defaultDate, location.name);
  }
  
  const now = new Date();

  let pointer = new Date(sowingDate);
  const stages: CalendarStage[] = templates.map((template, idx) => {
    const startDate = new Date(pointer);
    const endDate = addDays(startDate, template.durationDays);
    pointer = addDays(endDate, 1);

    let status: CalendarStage['status'] = 'upcoming';
    if (now >= startDate && now <= endDate) {
      status = 'active';
    } else if (now > endDate) {
      status = 'completed';
    }

    return {
      id: `${idx + 1}`,
      stage: template.stage,
      startDate: formatDateISO(startDate),
      endDate: formatDateISO(endDate),
      recommendation: template.recommendation,
      status,
    };
  });

  const completed = stages.filter((stage) => stage.status === 'completed').length;
  const hasActiveStage = stages.some((stage) => stage.status === 'active');
  const active = stages.some((stage) => stage.status === 'active') ? 0.5 : 0;
  const progressPercent = Math.round(((completed + active) / stages.length) * 100);
  const seasonStatus: CalendarSnapshot['seasonStatus'] =
    completed === stages.length ? 'completed' : hasActiveStage ? 'active' : 'upcoming';

  const activeStage = stages.find((stage) => stage.status === 'active') ?? null;
  const nextStage = stages.find((stage) => stage.status === 'upcoming') ?? null;

  let weatherNote = 'Weather advisory currently unavailable for this location.';
  try {
    const weather = await buildYieldWeatherContext(location.name);
    if (weather.avgRainProbability > 65) {
      weatherNote = `Rain probability is high (${Math.round(weather.avgRainProbability)}%). Prioritize drainage and postpone foliar spray.`;
    } else if (weather.avgTemp > 33) {
      weatherNote = `High temperature window expected (avg ${Math.round(weather.avgTemp)}°C). Shift irrigation to early morning or evening.`;
    } else {
      weatherNote = `Weather is mostly favorable this week (avg ${Math.round(weather.avgTemp)}°C, humidity ${Math.round(weather.avgHumidity)}%).`;
    }

    weatherNote = `${weatherNote} Updated ${now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })}.`;
  } catch {
    // Keep default note when weather lookup fails.
  }

  const actionPlan: string[] = [];
  if (seasonStatus === 'completed') {
    actionPlan.push(
      `Current ${displayCropName} cycle is complete for the selected sowing window.`,
      `Prepare land and inputs 2-3 weeks before the next ${displayCropName} sowing window.`,
      'Review yield, cost, and pest records to improve the next season plan.'
    );
  } else if (seasonStatus === 'active' && activeStage) {
    actionPlan.push(
      `Focus now: ${activeStage.stage}.`,
      activeStage.recommendation,
      nextStage
        ? `Next stage: ${nextStage.stage} (${nextStage.startDate} to ${nextStage.endDate}).`
        : 'No upcoming stage remains in this cycle.'
    );
  } else {
    actionPlan.push(
      `Your ${displayCropName} cycle has not started yet for the selected date.`,
      'Complete field preparation, seed treatment, and input planning before sowing.',
      nextStage
        ? `First stage starts with ${nextStage.stage} on ${nextStage.startDate}.`
        : 'Set a valid sowing date to generate the stage timeline.'
    );
  }

  return {
    crop: displayCropName,
    location: resolveLocationLabel(location),
    sowingDate: formatDateISO(sowingDate),
    progressPercent,
    seasonStatus,
    weatherNote,
    actionPlan,
    stages,
  };
}

export function generateTraceabilityRecord(batchId: string, cropHint = '', originHint = ''): TraceabilityRecord {
  const normalizedBatchId = batchId.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');

  // Comprehensive batch ID validation
  if (normalizedBatchId.length < 4) {
    throw new Error('Batch ID must be at least 4 characters long.');
  }

  if (normalizedBatchId.length > 32) {
    throw new Error('Batch ID is too long. Maximum 32 characters allowed.');
  }

  // Validate batch ID format (alphanumeric with optional hyphens)
  if (!/^[A-Z0-9]+(-[A-Z0-9]+)*$/.test(normalizedBatchId)) {
    throw new Error('Invalid batch ID format. Use alphanumeric characters with optional hyphens (e.g., BATCH-2024-001).');
  }

  const registry: Record<string, TraceabilityRecord> = {
    'BATCH-2026-001': {
      id: 'BATCH-2026-001',
      crop: 'Wheat',
      origin: 'Ludhiana, Punjab',
      farmerId: 'FRM-11247',
      status: 'Delivered to Processor',
      certifications: ['Soil Health Compliant', 'Residue Safe', 'Trace Chain Verified'],
      ledgerHash: '0x79b8aa3a8cf628f8e9dd2df508ea9166f95bde7c',
      timeline: [
        { date: '12 Nov 2025', event: 'Seed Lot Registration', details: 'Certified lot registered with district agriculture office.' },
        { date: '25 Nov 2025', event: 'Field Sowing', details: 'Sowing completed with geo-tagged field log.' },
        { date: '18 Jan 2026', event: 'Nutrient and Irrigation Log', details: 'Fertilizer and irrigation records uploaded from field notebook.' },
        { date: '03 Mar 2026', event: 'Pest and Residue Audit', details: 'Inspection completed and residue levels recorded within safe limits.' },
        { date: '15 Apr 2026', event: 'Harvest and Grading', details: 'Harvested lot graded and moisture content documented.' },
        { date: '28 Apr 2026', event: 'Dispatch and Warehouse Entry', details: 'Dispatch completed with warehouse intake confirmation.' },
      ],
    },
    'BATCH-2026-002': {
      id: 'BATCH-2026-002',
      crop: 'Rice',
      origin: 'Raipur, Chhattisgarh',
      farmerId: 'FRM-18302',
      status: 'Stored at Procurement Center',
      certifications: ['Soil Health Compliant', 'Trace Chain Verified'],
      ledgerHash: '0x2a0c1d491ae9f273f1848db48c4155ac2e65e1ab',
      timeline: [
        { date: '18 Jun 2025', event: 'Seed Lot Registration', details: 'Seed registration validated by cooperative society.' },
        { date: '04 Jul 2025', event: 'Field Sowing', details: 'Transplanting records captured from registered plot.' },
        { date: '19 Aug 2025', event: 'Nutrient and Irrigation Log', details: 'Water and nutrient schedule entered in trace register.' },
        { date: '23 Sep 2025', event: 'Pest and Residue Audit', details: 'Field inspected for pest control and safe pesticide usage.' },
        { date: '05 Nov 2025', event: 'Harvest and Grading', details: 'Harvest completed and grade tagged at mandi gate.' },
        { date: '13 Nov 2025', event: 'Dispatch and Warehouse Entry', details: 'Consignment sealed and received at procurement center.' },
      ],
    },
    'BATCH-2026-003': {
      id: 'BATCH-2026-003',
      crop: 'Cotton',
      origin: 'Nagpur, Maharashtra',
      farmerId: 'FRM-22564',
      status: 'In Transit',
      certifications: ['Residue Safe', 'Trace Chain Verified'],
      ledgerHash: '0x3f936409ca5231f58063e9d8bd7ea16b0b8eead4',
      timeline: [
        { date: '21 Jun 2025', event: 'Seed Lot Registration', details: 'Hybrid seed lot registered with local producer group.' },
        { date: '08 Jul 2025', event: 'Field Sowing', details: 'Sowing completed with row spacing compliance check.' },
        { date: '02 Sep 2025', event: 'Nutrient and Irrigation Log', details: 'Nutrient plan and irrigation cycles documented.' },
        { date: '20 Oct 2025', event: 'Pest and Residue Audit', details: 'Bollworm management and residue test completed.' },
        { date: '06 Dec 2025', event: 'Harvest and Grading', details: 'Picked cotton graded and baled for dispatch.' },
        { date: '14 Dec 2025', event: 'Dispatch and Warehouse Entry', details: 'Bales dispatched to processor through tracked transporter.' },
      ],
    },
  };



  let record = registry[normalizedBatchId];
  if (!record) {
    throw new Error(`Traceability record not found for batch ${normalizedBatchId}. Please verify the Batch ID.`);
  }

  if (cropHint.trim() && cropHint.trim().toLowerCase() !== record.crop.toLowerCase()) {
    throw new Error(`Batch ${normalizedBatchId} is registered for ${record.crop}, not ${cropHint.trim()}.`);
  }

  if (originHint.trim() && originHint.trim().toLowerCase() !== record.origin.toLowerCase()) {
    throw new Error(`Batch ${normalizedBatchId} is registered for origin ${record.origin}, not ${originHint.trim()}.`);
  }

  return record;
}

export async function generateAnalyticsSnapshot(locationQuery: string): Promise<AnalyticsSnapshot> {
  const location = await resolveLocation(locationQuery);
  const locationLabel = resolveLocationLabel(location);
  const today = new Date();

  let weatherFactor = 0;
  try {
    const weather = await buildYieldWeatherContext(location.name);
    weatherFactor = clamp((weather.avgTemp - 27) / 20 + (weather.avgRainProbability - 45) / 60, -0.8, 0.8);
  } catch {
    weatherFactor = 0;
  }

  const cropHealthScore = Math.round(clamp(82 - weatherFactor * 8, 60, 96));
  const cropHealthTrend = Number((-weatherFactor * 2).toFixed(1));

  const cropDetails = [
    { name: 'Wheat', health: Math.round(clamp(cropHealthScore + 2, 50, 98)), area: '2.6 acres' },
    { name: 'Rice', health: Math.round(clamp(cropHealthScore - 3, 45, 96)), area: '1.9 acres' },
    { name: 'Cotton', health: Math.round(clamp(cropHealthScore - 1, 50, 98)), area: '3.1 acres' },
  ];

  const revenueSeries: RevenuePoint[] = Array.from({ length: 6 }, (_, idx) => {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - (5 - idx), 1);
    const monthlySeasonality = Math.sin((dayOfYear(monthDate) + idx * 23) / 30) * 9000;
    const revenue = Math.round(clamp(72000 + monthlySeasonality - weatherFactor * 4500, 35000, 180000));

    return {
      label: monthDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      revenue,
    };
  });

  const currentYear = today.getFullYear();
  const yieldSeries: YieldPoint[] = Array.from({ length: 5 }, (_, idx) => {
    const year = currentYear - 4 + idx;
    const baseShift = idx * 1.4;
    return {
      year: String(year),
      wheat: Number((31 + baseShift - weatherFactor * 0.9).toFixed(1)),
      rice: Number((36 + baseShift - weatherFactor * 1.1).toFixed(1)),
      cotton: Number((21 + baseShift * 0.8 - weatherFactor * 0.7).toFixed(1)),
    };
  });

  const fertilizerUsage: FertilizerUsagePoint[] = [
    { name: 'Urea', used: Math.round(clamp(120 - weatherFactor * 10, 60, 190)), recommended: 150, unit: 'kg' },
    { name: 'DAP', used: Math.round(clamp(82 - weatherFactor * 8, 40, 130)), recommended: 100, unit: 'kg' },
    { name: 'Potash', used: Math.round(clamp(48, 20, 85)), recommended: 55, unit: 'kg' },
    { name: 'Zinc', used: Math.round(clamp(9, 3, 16)), recommended: 10, unit: 'kg' },
  ];

  const soilMetrics: SoilMetric[] = [
    {
      parameter: 'Nitrogen (kg/ha)',
      value: Math.round(clamp(285 - weatherFactor * 18, 180, 360)),
      status: 'Medium',
      color: 'amber',
    },
    {
      parameter: 'Phosphorus (kg/ha)',
      value: Math.round(clamp(24, 10, 42)),
      status: 'High',
      color: 'green',
    },
    {
      parameter: 'Potassium (kg/ha)',
      value: Math.round(clamp(145, 80, 210)),
      status: 'Low',
      color: 'red',
    },
    {
      parameter: 'pH',
      value: Number(clamp(6.8, 5.5, 8.3).toFixed(2)),
      status: 'Normal',
      color: 'green',
    },
  ];

  const pestIncidents = Math.max(0, Math.round(clamp(4 + weatherFactor * 4, 0, 9)));
  const pestEfficiency = Math.round(clamp(90 - pestIncidents * 4, 62, 97));
  const nextSprayInDays = Math.round(clamp(12 - weatherFactor * 3, 3, 16));

  return {
    location: locationLabel,
    generatedAt: today.toISOString(),
    cropHealthScore,
    cropHealthTrend,
    cropDetails,
    revenueSeries,
    yieldSeries,
    fertilizerUsage,
    soilMetrics,
    pestEfficiency,
    pestIncidents,
    nextSprayInDays,
  };
}
