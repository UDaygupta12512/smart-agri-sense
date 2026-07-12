'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  Sprout,
  Droplets,
  Sun,
  Wheat,
  Scissors,
  Package,
  Shovel,
  Flower2,
  Leaf,
  CalendarCheck,
  Bug,
  FlaskConical,
  Clock,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { useSiteLanguage } from '@/lib/siteLanguage';

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

interface StageActivity {
  label: string;
  icon: React.ReactNode;
}

interface CropStage {
  id: string;
  name: string;
  duration: string;
  weekRange: string;
  description: string;
  activities: StageActivity[];
  tips: string[];
  icon: React.ReactNode;
  color: string;
}

interface CropData {
  name: string;
  totalDuration: string;
  season: string;
  currentStageIndex: number;
  stages: CropStage[];
}

/* ──────────────────────────────────────────────
   Crop Data
   ────────────────────────────────────────────── */

const ICON_CLASS = 'h-4 w-4';

const cropDatabase: Record<string, CropData> = {
  Rice: {
    name: 'Rice',
    totalDuration: '120-150 days',
    season: 'Kharif (June–November)',
    currentStageIndex: 2,
    stages: [
      {
        id: 'rice-land',
        name: 'Land Preparation',
        duration: '2-3 weeks',
        weekRange: 'Week 1-3',
        description: 'Prepare paddy fields by ploughing and puddling. Level the field to ensure uniform water distribution. Apply basal fertilizer and prepare bunds.',
        activities: [
          { label: 'Ploughing & puddling', icon: <Shovel className={ICON_CLASS} /> },
          { label: 'Field leveling', icon: <TrendingUp className={ICON_CLASS} /> },
          { label: 'Basal fertilizer (DAP)', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Bund preparation', icon: <Shovel className={ICON_CLASS} /> },
        ],
        tips: [
          'Puddling should be done 2-3 times for proper soil consistency',
          'Apply 50 kg/ha DAP as basal dose before transplanting',
          'Ensure field has proper inlet and outlet channels for water management',
        ],
        icon: <Shovel className="h-5 w-5" />,
        color: 'from-amber-500 to-orange-600',
      },
      {
        id: 'rice-sow',
        name: 'Sowing / Transplanting',
        duration: '1-2 weeks',
        weekRange: 'Week 3-5',
        description: 'Transplant 21-25 day old seedlings at proper spacing. Use 2-3 seedlings per hill. Maintain 2-3 cm standing water after transplanting.',
        activities: [
          { label: 'Nursery seedling selection', icon: <Sprout className={ICON_CLASS} /> },
          { label: 'Transplanting at 20×15 cm', icon: <Leaf className={ICON_CLASS} /> },
          { label: 'Initial irrigation', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Transplant in the evening to reduce transplant shock',
          'Use SRI method (System of Rice Intensification) for better yields',
          'Maintain 2-3 cm standing water for first week after transplanting',
        ],
        icon: <Sprout className="h-5 w-5" />,
        color: 'from-green-500 to-emerald-600',
      },
      {
        id: 'rice-veg',
        name: 'Vegetative Growth',
        duration: '4-5 weeks',
        weekRange: 'Week 5-10',
        description: 'Tillers emerge and canopy develops. Apply nitrogen top dressing. Monitor for pests like stem borer and leaf folder. Maintain water level at 5 cm.',
        activities: [
          { label: 'Urea top dressing (1st)', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Weed management', icon: <Leaf className={ICON_CLASS} /> },
          { label: 'Pest monitoring', icon: <Bug className={ICON_CLASS} /> },
          { label: 'Water management (5 cm)', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Apply 1st top dressing of urea (30 kg/ha) at 21 days after transplanting',
          'Use Butachlor or Pretilachlor for weed control within 3 days of transplanting',
          'Install pheromone traps for stem borer monitoring',
        ],
        icon: <Leaf className="h-5 w-5" />,
        color: 'from-emerald-500 to-green-600',
      },
      {
        id: 'rice-flower',
        name: 'Flowering / Reproductive',
        duration: '3-4 weeks',
        weekRange: 'Week 10-14',
        description: 'Panicle initiation and flowering. Critical stage for grain formation. Maintain adequate water and apply final nitrogen dose. Watch for blast disease.',
        activities: [
          { label: 'Urea top dressing (2nd)', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Blast disease monitoring', icon: <Bug className={ICON_CLASS} /> },
          { label: 'Continuous flooding', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'This is the most critical stage — water stress can reduce yield by 50%',
          'Apply Tricyclazole if leaf blast symptoms appear',
          'Do not drain the field during flowering stage',
        ],
        icon: <Flower2 className="h-5 w-5" />,
        color: 'from-pink-500 to-rose-600',
      },
      {
        id: 'rice-mature',
        name: 'Maturity',
        duration: '3-4 weeks',
        weekRange: 'Week 14-18',
        description: 'Grains fill and turn golden. Gradually reduce water. About 80% of grains should turn straw-colored before harvesting.',
        activities: [
          { label: 'Drain water gradually', icon: <Droplets className={ICON_CLASS} /> },
          { label: 'Monitor grain filling', icon: <Wheat className={ICON_CLASS} /> },
          { label: 'Bird scaring', icon: <Sun className={ICON_CLASS} /> },
        ],
        tips: [
          'Stop irrigation 15 days before expected harvest',
          'Grain moisture should be around 20-22% at harvest',
          'Use bird scaring devices to protect ripening grains',
        ],
        icon: <Wheat className="h-5 w-5" />,
        color: 'from-yellow-500 to-amber-600',
      },
      {
        id: 'rice-harvest',
        name: 'Harvesting',
        duration: '1-2 weeks',
        weekRange: 'Week 18-20',
        description: 'Harvest when 80% grains are straw-colored. Use combine harvester or manual harvesting. Thresh within 24 hours of cutting.',
        activities: [
          { label: 'Cutting at proper stage', icon: <Scissors className={ICON_CLASS} /> },
          { label: 'Threshing', icon: <Wheat className={ICON_CLASS} /> },
          { label: 'Drying to 14% moisture', icon: <Sun className={ICON_CLASS} /> },
        ],
        tips: [
          'Harvest in the morning for lower grain shattering losses',
          'Dry paddy in shade for 2-3 days before sun drying',
          'MSP for paddy is announced by Govt. — sell through APMC or direct purchase centers',
        ],
        icon: <Scissors className="h-5 w-5" />,
        color: 'from-orange-500 to-red-600',
      },
      {
        id: 'rice-post',
        name: 'Post-Harvest',
        duration: '1-2 weeks',
        weekRange: 'Week 20-22',
        description: 'Proper storage in clean, dry godowns. Use moisture-proof bags. Manage residues by incorporating straw into soil instead of burning.',
        activities: [
          { label: 'Storage in jute bags', icon: <Package className={ICON_CLASS} /> },
          { label: 'Straw management', icon: <Leaf className={ICON_CLASS} /> },
          { label: 'Market selling', icon: <TrendingUp className={ICON_CLASS} /> },
        ],
        tips: [
          'Store in elevated, well-ventilated godowns at 14% moisture',
          'Do NOT burn stubble — incorporate into soil for next crop',
          'Register with e-NAM for better market prices',
        ],
        icon: <Package className="h-5 w-5" />,
        color: 'from-indigo-500 to-purple-600',
      },
    ],
  },
  Wheat: {
    name: 'Wheat',
    totalDuration: '120-140 days',
    season: 'Rabi (November–April)',
    currentStageIndex: 4,
    stages: [
      {
        id: 'wheat-land',
        name: 'Land Preparation',
        duration: '1-2 weeks',
        weekRange: 'Week 1-2',
        description: 'Plough the field 2-3 times to get fine tilth. Apply FYM at 10 tonnes/ha. Planking to level the field.',
        activities: [
          { label: 'Deep ploughing', icon: <Shovel className={ICON_CLASS} /> },
          { label: 'FYM application', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Field leveling', icon: <TrendingUp className={ICON_CLASS} /> },
        ],
        tips: [
          'One deep ploughing in summer followed by 2-3 harrowing before sowing',
          'Apply well-decomposed FYM at least 15 days before sowing',
          'Laser leveling improves water use efficiency by 30%',
        ],
        icon: <Shovel className="h-5 w-5" />,
        color: 'from-amber-500 to-orange-600',
      },
      {
        id: 'wheat-sow',
        name: 'Sowing',
        duration: '1 week',
        weekRange: 'Week 2-3',
        description: 'Sow treated seeds at 100 kg/ha using seed drill. Maintain row spacing of 20-22.5 cm. Apply basal fertilizer.',
        activities: [
          { label: 'Seed treatment with Vitavax', icon: <Sprout className={ICON_CLASS} /> },
          { label: 'Seed drill sowing', icon: <Leaf className={ICON_CLASS} /> },
          { label: 'Basal NPK application', icon: <FlaskConical className={ICON_CLASS} /> },
        ],
        tips: [
          'Optimum sowing time: Nov 1-25 for North India, Nov 15-Dec 15 for Central India',
          'Treat seeds with Vitavax Power at 2g/kg to prevent smut and bunt diseases',
          'Maintain seed depth of 5 cm for uniform germination',
        ],
        icon: <Sprout className="h-5 w-5" />,
        color: 'from-green-500 to-emerald-600',
      },
      {
        id: 'wheat-veg',
        name: 'Vegetative Growth',
        duration: '5-6 weeks',
        weekRange: 'Week 3-9',
        description: 'Crown root initiation, tillering, and stem elongation phase. Apply first irrigation at CRI stage (21 DAS). Nitrogen top dressing.',
        activities: [
          { label: 'CRI irrigation (21 DAS)', icon: <Droplets className={ICON_CLASS} /> },
          { label: 'Urea top dressing', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Weed control (Sulfosulfuron)', icon: <Leaf className={ICON_CLASS} /> },
          { label: 'Aphid monitoring', icon: <Bug className={ICON_CLASS} /> },
        ],
        tips: [
          'CRI irrigation is the MOST critical — missing it can reduce yield by 25%',
          'Apply 1/3rd nitrogen (urea) as top dressing after first irrigation',
          'Spray Sulfosulfuron 75% WG at 25 g/ha for Phalaris minor weed control',
        ],
        icon: <Leaf className="h-5 w-5" />,
        color: 'from-emerald-500 to-green-600',
      },
      {
        id: 'wheat-flower',
        name: 'Flowering / Reproductive',
        duration: '2-3 weeks',
        weekRange: 'Week 9-12',
        description: 'Booting, heading, and anthesis stages. Maintain adequate moisture. Watch for yellow rust in North India.',
        activities: [
          { label: 'Irrigation at heading', icon: <Droplets className={ICON_CLASS} /> },
          { label: 'Yellow rust monitoring', icon: <Bug className={ICON_CLASS} /> },
          { label: 'Foliar micronutrient spray', icon: <FlaskConical className={ICON_CLASS} /> },
        ],
        tips: [
          'Irrigate at booting and heading stages — do not skip',
          'Spray Propiconazole 25EC at 1ml/L if yellow rust appears',
          'Terminal heat stress is a major risk — plan sowing date to avoid late flowering',
        ],
        icon: <Flower2 className="h-5 w-5" />,
        color: 'from-pink-500 to-rose-600',
      },
      {
        id: 'wheat-mature',
        name: 'Maturity',
        duration: '3-4 weeks',
        weekRange: 'Week 12-16',
        description: 'Grain filling and dough stages. Last irrigation at dough stage. Grains harden and turn golden amber.',
        activities: [
          { label: 'Last irrigation (dough stage)', icon: <Droplets className={ICON_CLASS} /> },
          { label: 'Monitor grain hardness', icon: <Wheat className={ICON_CLASS} /> },
          { label: 'Harvesting preparation', icon: <CalendarCheck className={ICON_CLASS} /> },
        ],
        tips: [
          'Give last irrigation at dough/milking stage for maximum grain weight',
          'Harvest when grain moisture reaches 12-14%',
          'Avoid late harvest — each day of delay can cause 1-2% yield loss',
        ],
        icon: <Wheat className="h-5 w-5" />,
        color: 'from-yellow-500 to-amber-600',
      },
      {
        id: 'wheat-harvest',
        name: 'Harvesting',
        duration: '1-2 weeks',
        weekRange: 'Week 16-18',
        description: 'Harvest with combine harvester. Thresh and clean grain. Sun dry to bring moisture below 12%.',
        activities: [
          { label: 'Combine harvesting', icon: <Scissors className={ICON_CLASS} /> },
          { label: 'Grain cleaning', icon: <Wheat className={ICON_CLASS} /> },
          { label: 'Sun drying', icon: <Sun className={ICON_CLASS} /> },
        ],
        tips: [
          'Use combine harvester for timely harvest and reduced losses',
          'Sell at MSP through government procurement centers',
          'Grade wheat before selling for better price realization',
        ],
        icon: <Scissors className="h-5 w-5" />,
        color: 'from-orange-500 to-red-600',
      },
      {
        id: 'wheat-post',
        name: 'Post-Harvest',
        duration: '1-2 weeks',
        weekRange: 'Week 18-20',
        description: 'Store in clean godowns. Use proper fumigation. Manage residues for next season.',
        activities: [
          { label: 'Storage in moisture-proof bags', icon: <Package className={ICON_CLASS} /> },
          { label: 'Fumigation with ALP', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Straw baling', icon: <Leaf className={ICON_CLASS} /> },
        ],
        tips: [
          'Store at 10-12% moisture in gunny bags on wooden pallets',
          'Fumigate with Aluminium Phosphide tablets for storage pest control',
          'Use straw for animal feed or mulching — avoid burning',
        ],
        icon: <Package className="h-5 w-5" />,
        color: 'from-indigo-500 to-purple-600',
      },
    ],
  },
  Cotton: {
    name: 'Cotton',
    totalDuration: '150-180 days',
    season: 'Kharif (April–December)',
    currentStageIndex: 3,
    stages: [
      {
        id: 'cotton-land',
        name: 'Land Preparation',
        duration: '2-3 weeks',
        weekRange: 'Week 1-3',
        description: 'Deep ploughing in summer. Form ridges and furrows. Apply basal FYM and fertilizer.',
        activities: [
          { label: 'Deep summer ploughing', icon: <Shovel className={ICON_CLASS} /> },
          { label: 'Ridge & furrow formation', icon: <TrendingUp className={ICON_CLASS} /> },
          { label: 'FYM at 10 t/ha', icon: <FlaskConical className={ICON_CLASS} /> },
        ],
        tips: [
          'Deep ploughing in May exposes soil pests to sunlight and heat',
          'Ridges help in better drainage during monsoon season',
          'Apply neem cake at 250 kg/ha along with FYM',
        ],
        icon: <Shovel className="h-5 w-5" />,
        color: 'from-amber-500 to-orange-600',
      },
      {
        id: 'cotton-sow',
        name: 'Sowing',
        duration: '1-2 weeks',
        weekRange: 'Week 3-5',
        description: 'Sow Bt cotton seeds at proper spacing. Maintain plant population of 55,000-60,000/ha. Refuge area planting.',
        activities: [
          { label: 'Bt cotton seed sowing', icon: <Sprout className={ICON_CLASS} /> },
          { label: 'Spacing 90×60 cm', icon: <Leaf className={ICON_CLASS} /> },
          { label: 'Refuge border planting', icon: <Sprout className={ICON_CLASS} /> },
        ],
        tips: [
          'Sow with onset of monsoon (June-July) in rainfed areas',
          'Maintain 20% non-Bt refuge border as per regulations',
          'Use seed treatment with Imidacloprid for sucking pest protection',
        ],
        icon: <Sprout className="h-5 w-5" />,
        color: 'from-green-500 to-emerald-600',
      },
      {
        id: 'cotton-veg',
        name: 'Vegetative Growth',
        duration: '6-8 weeks',
        weekRange: 'Week 5-13',
        description: 'Branch development and canopy expansion. Apply nitrogen in splits. Manage bollworm, jassids, and whitefly.',
        activities: [
          { label: 'Nitrogen top dressing', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Intercultivation', icon: <Shovel className={ICON_CLASS} /> },
          { label: 'Jassid & whitefly monitoring', icon: <Bug className={ICON_CLASS} /> },
          { label: 'Drip irrigation', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Apply 2nd dose of nitrogen at 45 DAS and 3rd at 65 DAS',
          'Install yellow sticky traps for whitefly monitoring (8-10/acre)',
          'Do not use synthetic pyrethroids in first 90 days of crop',
        ],
        icon: <Leaf className="h-5 w-5" />,
        color: 'from-emerald-500 to-green-600',
      },
      {
        id: 'cotton-flower',
        name: 'Flowering / Boll Formation',
        duration: '4-6 weeks',
        weekRange: 'Week 13-19',
        description: 'Square formation, flowering, and boll development. Most critical stage for yield. Manage pink bollworm.',
        activities: [
          { label: 'Pink bollworm traps', icon: <Bug className={ICON_CLASS} /> },
          { label: 'Potassium application', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Irrigation at critical stage', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Install pheromone traps at 5/ha for pink bollworm monitoring',
          'Spray neem-based pesticides (1500 ppm) at 15-day intervals',
          'Apply MOP at 40 kg/ha for better boll development',
        ],
        icon: <Flower2 className="h-5 w-5" />,
        color: 'from-pink-500 to-rose-600',
      },
      {
        id: 'cotton-mature',
        name: 'Maturity / Boll Opening',
        duration: '4-5 weeks',
        weekRange: 'Week 19-24',
        description: 'Bolls open and kapas is ready for picking. Multiple pickings needed. Grade-wise picking for better quality.',
        activities: [
          { label: 'Defoliant spray if needed', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'First picking (quality kapas)', icon: <Wheat className={ICON_CLASS} /> },
          { label: 'Moisture monitoring', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Pick only fully opened, dry bolls — do not mix with unopened bolls',
          'First picking gives best grade cotton — sell separately for premium price',
          'Avoid picking wet kapas — it reduces quality and price',
        ],
        icon: <Wheat className="h-5 w-5" />,
        color: 'from-yellow-500 to-amber-600',
      },
      {
        id: 'cotton-harvest',
        name: 'Harvesting',
        duration: '2-3 weeks',
        weekRange: 'Week 24-27',
        description: 'Final picking of remaining bolls. Uproot plants after last pick. 3-4 pickings total for best quality.',
        activities: [
          { label: 'Multiple pickings', icon: <Scissors className={ICON_CLASS} /> },
          { label: 'Grade-wise segregation', icon: <Package className={ICON_CLASS} /> },
          { label: 'Plant destruction', icon: <Shovel className={ICON_CLASS} /> },
        ],
        tips: [
          'Complete all pickings before December end in Central India',
          'Destroy crop residues by mid-January to break pink bollworm cycle',
          'Use CCI or MSP procurement centers for guaranteed price',
        ],
        icon: <Scissors className="h-5 w-5" />,
        color: 'from-orange-500 to-red-600',
      },
    ],
  },
  Sugarcane: {
    name: 'Sugarcane',
    totalDuration: '10-12 months',
    season: 'Year-round (planted Oct-Mar)',
    currentStageIndex: 3,
    stages: [
      {
        id: 'sugar-land',
        name: 'Land Preparation',
        duration: '2-3 weeks',
        weekRange: 'Week 1-3',
        description: 'Deep ploughing, trench making (90 cm apart). Heavy FYM application for this long-duration crop.',
        activities: [
          { label: 'Deep ploughing & harrowing', icon: <Shovel className={ICON_CLASS} /> },
          { label: 'Trench formation at 90 cm', icon: <TrendingUp className={ICON_CLASS} /> },
          { label: 'FYM at 25 t/ha', icon: <FlaskConical className={ICON_CLASS} /> },
        ],
        tips: [
          'Apply 25 tonnes FYM per hectare for this exhaustive crop',
          'Trench planting gives 20-25% more yield than flat planting',
          'Apply Carbofuran in furrows for shoot borer protection',
        ],
        icon: <Shovel className="h-5 w-5" />,
        color: 'from-amber-500 to-orange-600',
      },
      {
        id: 'sugar-sow',
        name: 'Sett Planting',
        duration: '1-2 weeks',
        weekRange: 'Week 3-5',
        description: 'Plant 3-budded setts end-to-end in trenches. Use healthy, disease-free seed material from registered nurseries.',
        activities: [
          { label: 'Sett treatment in fungicide', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Planting at 75,000 setts/ha', icon: <Sprout className={ICON_CLASS} /> },
          { label: 'Light irrigation', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Treat setts in Carbendazim solution (2g/L) for 15 minutes',
          'Use 8-10 month old cane as seed material for best germination',
          'Spring planting (Feb-Mar) in North India gives best results',
        ],
        icon: <Sprout className="h-5 w-5" />,
        color: 'from-green-500 to-emerald-600',
      },
      {
        id: 'sugar-veg',
        name: 'Vegetative Growth / Tillering',
        duration: '8-10 weeks',
        weekRange: 'Week 5-15',
        description: 'Germination, tillering, and grand growth phase. Earthing up and trash mulching. Heavy nitrogen feeding.',
        activities: [
          { label: 'Earthing up', icon: <Shovel className={ICON_CLASS} /> },
          { label: 'Nitrogen (Urea) application', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Trash mulching', icon: <Leaf className={ICON_CLASS} /> },
          { label: 'Irrigation every 10 days', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Do earthing up at 90 and 120 days to prevent lodging',
          'Apply 150 kg urea/ha in 3 splits at 30, 60, 90 DAS',
          'Trash mulching conserves 30% irrigation water',
        ],
        icon: <Leaf className="h-5 w-5" />,
        color: 'from-emerald-500 to-green-600',
      },
      {
        id: 'sugar-grand',
        name: 'Grand Growth',
        duration: '10-12 weeks',
        weekRange: 'Week 15-27',
        description: 'Maximum cane elongation phase. 70% of total growth happens here. Critical water and nutrient demand.',
        activities: [
          { label: 'Drip/furrow irrigation', icon: <Droplets className={ICON_CLASS} /> },
          { label: 'Propping / tying', icon: <TrendingUp className={ICON_CLASS} /> },
          { label: 'Internode borer monitoring', icon: <Bug className={ICON_CLASS} /> },
        ],
        tips: [
          'Do not allow moisture stress during this phase — yield loss is irreversible',
          'Tie canes in bundles to prevent lodging during monsoon winds',
          'Release Trichogramma for internode borer biological control',
        ],
        icon: <Sun className="h-5 w-5" />,
        color: 'from-cyan-500 to-blue-600',
      },
      {
        id: 'sugar-mature',
        name: 'Maturity / Ripening',
        duration: '6-8 weeks',
        weekRange: 'Week 27-35',
        description: 'Sugar accumulation phase. Withhold nitrogen, reduce irrigation. Apply ripening chemicals if needed.',
        activities: [
          { label: 'Stop nitrogen application', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Reduce irrigation', icon: <Droplets className={ICON_CLASS} /> },
          { label: 'Brix testing', icon: <FlaskConical className={ICON_CLASS} /> },
        ],
        tips: [
          'Withhold irrigation 15-20 days before harvest for higher sugar recovery',
          'Test Brix — harvest when Brix reading is 18-20°',
          'Spraying Ethephon at 200 ppm can enhance ripening and sugar content',
        ],
        icon: <Wheat className="h-5 w-5" />,
        color: 'from-yellow-500 to-amber-600',
      },
      {
        id: 'sugar-harvest',
        name: 'Harvesting',
        duration: '2-4 weeks',
        weekRange: 'Week 35-40+',
        description: 'Cut cane close to ground. Remove trash. Deliver to sugar factory within 24 hours of cutting.',
        activities: [
          { label: 'Base cutting', icon: <Scissors className={ICON_CLASS} /> },
          { label: 'De-trashing', icon: <Leaf className={ICON_CLASS} /> },
          { label: 'Transport to factory', icon: <Package className={ICON_CLASS} /> },
        ],
        tips: [
          'Cut at ground level to maximize sugar yield and ratoon growth',
          'Deliver to sugar mill within 24 hours — delayed cane loses sugar',
          'FRP (Fair & Remunerative Price) is set by Central Govt — check current rates',
        ],
        icon: <Scissors className="h-5 w-5" />,
        color: 'from-orange-500 to-red-600',
      },
    ],
  },
  Tomato: {
    name: 'Tomato',
    totalDuration: '90-120 days',
    season: 'Rabi/Summer (Oct-Mar)',
    currentStageIndex: 3,
    stages: [
      {
        id: 'tomato-land',
        name: 'Land Preparation',
        duration: '1-2 weeks',
        weekRange: 'Week 1-2',
        description: 'Prepare raised beds. Apply FYM and basal NPK. Install drip irrigation system.',
        activities: [
          { label: 'Raised bed preparation', icon: <Shovel className={ICON_CLASS} /> },
          { label: 'FYM at 20 t/ha', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Drip system installation', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Raised beds of 90 cm width improve drainage and reduce wilt diseases',
          'Install drip irrigation for 40% water saving and uniform growth',
          'Apply Trichoderma viride along with FYM for disease suppression',
        ],
        icon: <Shovel className="h-5 w-5" />,
        color: 'from-amber-500 to-orange-600',
      },
      {
        id: 'tomato-sow',
        name: 'Transplanting',
        duration: '1 week',
        weekRange: 'Week 2-3',
        description: 'Transplant 25-30 day old seedlings. Spacing 60×45 cm. Water immediately after transplanting.',
        activities: [
          { label: 'Seedling hardening', icon: <Sprout className={ICON_CLASS} /> },
          { label: 'Transplanting at 60×45 cm', icon: <Leaf className={ICON_CLASS} /> },
          { label: 'Initial irrigation', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Transplant in evening hours to reduce transplanting shock',
          'Use hybrid varieties like Arka Rakshak, Arka Samrat for better yield',
          'Apply starter solution (19:19:19 at 5g/L) after transplanting',
        ],
        icon: <Sprout className="h-5 w-5" />,
        color: 'from-green-500 to-emerald-600',
      },
      {
        id: 'tomato-veg',
        name: 'Vegetative Growth',
        duration: '3-4 weeks',
        weekRange: 'Week 3-7',
        description: 'Vigorous vegetative growth. Staking plants. Apply fertilizers through fertigation. Monitor for leaf miner.',
        activities: [
          { label: 'Staking with bamboo', icon: <TrendingUp className={ICON_CLASS} /> },
          { label: 'Fertigation (19:19:19)', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Leaf miner control', icon: <Bug className={ICON_CLASS} /> },
          { label: 'Mulching', icon: <Leaf className={ICON_CLASS} /> },
        ],
        tips: [
          'Stake plants early to prevent soil contact diseases',
          'Use silver-black mulch film for weed control and better fruit quality',
          'Apply calcium nitrate to prevent blossom end rot',
        ],
        icon: <Leaf className="h-5 w-5" />,
        color: 'from-emerald-500 to-green-600',
      },
      {
        id: 'tomato-flower',
        name: 'Flowering / Fruiting',
        duration: '3-4 weeks',
        weekRange: 'Week 7-11',
        description: 'Flowering begins. Fruit set and development. Monitor for fruit borer and early blight.',
        activities: [
          { label: 'Boron spray for fruit set', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Fruit borer management', icon: <Bug className={ICON_CLASS} /> },
          { label: 'Regular irrigation', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Spray Borax at 2g/L during flowering for better fruit set',
          'Install pheromone traps for tomato fruit borer (Helicoverpa)',
          'Avoid overhead irrigation during flowering — use drip only',
        ],
        icon: <Flower2 className="h-5 w-5" />,
        color: 'from-pink-500 to-rose-600',
      },
      {
        id: 'tomato-mature',
        name: 'Maturity',
        duration: '2-3 weeks',
        weekRange: 'Week 11-14',
        description: 'Fruits ripen and turn red. Multiple harvests at 3-4 day intervals. Grade by size and color.',
        activities: [
          { label: 'Harvesting at breaker stage', icon: <Wheat className={ICON_CLASS} /> },
          { label: 'Grading by color & size', icon: <Package className={ICON_CLASS} /> },
          { label: 'Post-harvest treatment', icon: <FlaskConical className={ICON_CLASS} /> },
        ],
        tips: [
          'Harvest at breaker/turning stage for distant markets',
          'Handle carefully — tomatoes bruise easily and lose market value',
          'Use plastic crates instead of gunny bags for transport',
        ],
        icon: <Wheat className="h-5 w-5" />,
        color: 'from-yellow-500 to-amber-600',
      },
      {
        id: 'tomato-harvest',
        name: 'Harvesting & Marketing',
        duration: '3-4 weeks',
        weekRange: 'Week 14-18',
        description: 'Continue harvesting. Sort, grade, and pack for market. Consider processing options.',
        activities: [
          { label: 'Regular harvesting', icon: <Scissors className={ICON_CLASS} /> },
          { label: 'Sorting & grading', icon: <Package className={ICON_CLASS} /> },
          { label: 'Market or processing', icon: <TrendingUp className={ICON_CLASS} /> },
        ],
        tips: [
          'If prices are low, consider making tomato paste or sun-dried tomatoes',
          'Register with Kisan Rath app for subsidized transport to mandis',
          'Use cold storage or zero-energy cool chambers to extend shelf life',
        ],
        icon: <Scissors className="h-5 w-5" />,
        color: 'from-orange-500 to-red-600',
      },
    ],
  },
  Onion: {
    name: 'Onion',
    totalDuration: '130-150 days',
    season: 'Rabi (Nov-Apr) / Kharif (Jun-Oct)',
    currentStageIndex: 3,
    stages: [
      {
        id: 'onion-land',
        name: 'Land Preparation',
        duration: '2 weeks',
        weekRange: 'Week 1-2',
        description: 'Prepare flat beds or raised beds. Fine tilth is essential. Apply basal dose of FYM and fertilizers.',
        activities: [
          { label: 'Fine tilth preparation', icon: <Shovel className={ICON_CLASS} /> },
          { label: 'Raised bed formation', icon: <TrendingUp className={ICON_CLASS} /> },
          { label: 'FYM at 15-20 t/ha', icon: <FlaskConical className={ICON_CLASS} /> },
        ],
        tips: [
          'Onion needs very fine tilth — harrow 3-4 times before planting',
          'Flat beds are suitable for light soils, raised beds for heavy soils',
          'Apply 50 kg/ha Sulphur as basal for better bulb quality and pungency',
        ],
        icon: <Shovel className="h-5 w-5" />,
        color: 'from-amber-500 to-orange-600',
      },
      {
        id: 'onion-sow',
        name: 'Transplanting',
        duration: '1-2 weeks',
        weekRange: 'Week 2-4',
        description: 'Transplant 6-8 week old seedlings at 15×10 cm spacing. Plant 2-3 cm deep. Irrigate immediately.',
        activities: [
          { label: 'Seedling transplanting', icon: <Sprout className={ICON_CLASS} /> },
          { label: 'Spacing 15×10 cm', icon: <Leaf className={ICON_CLASS} /> },
          { label: 'Light irrigation', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Trim seedling tips by 1/3rd before transplanting for quicker establishment',
          'Rabi onion transplanting: December-January gives best results',
          'Dip seedling roots in Trichoderma solution before planting',
        ],
        icon: <Sprout className="h-5 w-5" />,
        color: 'from-green-500 to-emerald-600',
      },
      {
        id: 'onion-veg',
        name: 'Vegetative Growth',
        duration: '5-6 weeks',
        weekRange: 'Week 4-10',
        description: 'Leaf development and establishment. Apply nitrogen in splits. Manage thrips — the most damaging pest of onion.',
        activities: [
          { label: 'Nitrogen top dressing', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Thrips management', icon: <Bug className={ICON_CLASS} /> },
          { label: 'Irrigation every 7-10 days', icon: <Droplets className={ICON_CLASS} /> },
          { label: 'Weed management', icon: <Leaf className={ICON_CLASS} /> },
        ],
        tips: [
          'Spray Fipronil 5SC at 1ml/L or Carbosulfan for thrips control',
          'Apply 2nd nitrogen dose at 30 DAT and 3rd at 45 DAT',
          'Avoid excess nitrogen after bulb initiation — causes thick necks',
        ],
        icon: <Leaf className="h-5 w-5" />,
        color: 'from-emerald-500 to-green-600',
      },
      {
        id: 'onion-bulb',
        name: 'Bulb Formation',
        duration: '4-5 weeks',
        weekRange: 'Week 10-15',
        description: 'Bulb enlargement is the critical phase. Adequate moisture essential. Stop nitrogen. Watch for purple blotch disease.',
        activities: [
          { label: 'Potassium application', icon: <FlaskConical className={ICON_CLASS} /> },
          { label: 'Purple blotch monitoring', icon: <Bug className={ICON_CLASS} /> },
          { label: 'Regular irrigation', icon: <Droplets className={ICON_CLASS} /> },
        ],
        tips: [
          'Apply SOP (Sulphate of Potash) at 50 kg/ha during bulb formation',
          'Spray Mancozeb 75WP at 2.5g/L for purple blotch and Stemphylium blight',
          'Maintain uniform soil moisture — irregular watering causes split bulbs',
        ],
        icon: <Flower2 className="h-5 w-5" />,
        color: 'from-pink-500 to-rose-600',
      },
      {
        id: 'onion-mature',
        name: 'Maturity',
        duration: '2-3 weeks',
        weekRange: 'Week 15-18',
        description: 'Neck fall indicates maturity (50-75% tops fallen). Stop irrigation 10-15 days before harvest.',
        activities: [
          { label: 'Stop irrigation', icon: <Droplets className={ICON_CLASS} /> },
          { label: 'Neck fall monitoring', icon: <Wheat className={ICON_CLASS} /> },
          { label: 'Curing preparation', icon: <Sun className={ICON_CLASS} /> },
        ],
        tips: [
          'Harvest when 50-75% plants show neck fall naturally',
          'Do not wait for 100% neck fall — it delays harvest and reduces storage life',
          'Stop watering 10-15 days before harvest for better curing and storage',
        ],
        icon: <Wheat className="h-5 w-5" />,
        color: 'from-yellow-500 to-amber-600',
      },
      {
        id: 'onion-harvest',
        name: 'Harvesting & Curing',
        duration: '2-3 weeks',
        weekRange: 'Week 18-21',
        description: 'Uproot bulbs carefully. Cure in shade for 7-10 days. Grade and sort for storage or immediate sale.',
        activities: [
          { label: 'Manual uprooting', icon: <Scissors className={ICON_CLASS} /> },
          { label: 'Field curing (3-4 days)', icon: <Sun className={ICON_CLASS} /> },
          { label: 'Shade curing (7-10 days)', icon: <Package className={ICON_CLASS} /> },
        ],
        tips: [
          'Cure onions properly — poor curing is the #1 cause of storage losses in India',
          'Store in well-ventilated structures (onion storage structures with bottom ventilation)',
          'NHRDF provides storage advisories — follow for reducing post-harvest losses',
        ],
        icon: <Scissors className="h-5 w-5" />,
        color: 'from-orange-500 to-red-600',
      },
    ],
  },
};

const CROPS = Object.keys(cropDatabase);

/* ──────────────────────────────────────────────
   This Week's Task Logic
   ────────────────────────────────────────────── */

function getThisWeekTask(crop: CropData): { title: string; tasks: string[]; stageName: string } {
  const stage = crop.stages[crop.currentStageIndex];
  if (!stage) {
    return { title: 'Season Review', tasks: ['Review overall crop performance and plan for next season.'], stageName: 'Completed' };
  }

  const tasks = stage.activities.map(a => a.label);
  if (stage.tips.length > 0) {
    tasks.push(stage.tips[0]);
  }

  return {
    title: `Focus: ${stage.name}`,
    tasks,
    stageName: stage.name,
  };
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

export default function CropLifecyclePage() {
  const { t } = useSiteLanguage();
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cropData = cropDatabase[selectedCrop];
  const weekTask = useMemo(() => getThisWeekTask(cropData), [cropData]);

  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    setActiveStage(null);
    setIsDropdownOpen(false);
  };

  const handleStageClick = (stageId: string) => {
    setActiveStage(activeStage === stageId ? null : stageId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 via-emerald-50/40 to-amber-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-sm hover:shadow-md transition-all hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-green-800 dark:from-green-400 dark:via-emerald-300 dark:to-green-500 bg-clip-text text-transparent">
                {t('cropLifecycle')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Interactive growth stage timeline for your crops
              </p>
            </div>
          </div>

          {/* Crop Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/20 shadow-lg hover:shadow-xl transition-all min-w-[200px]"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <Sprout className="h-4 w-4" />
              </div>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedCrop}</span>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ml-auto ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white/90 dark:bg-gray-800/95 backdrop-blur-xl border border-white/50 dark:border-gray-700 shadow-2xl z-50 overflow-hidden"
                >
                  {CROPS.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleCropChange(crop)}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-all hover:bg-green-50 dark:hover:bg-green-900/20 ${
                        crop === selectedCrop
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sprout className={`h-4 w-4 ${crop === selectedCrop ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                        {crop}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Crop Info Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 p-6 sm:p-8 text-white shadow-2xl shadow-green-600/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTMwIDB2Nmg2di02aC02em0wIDMwdjZoNnYtNmgtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">{cropData.name}</h2>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {cropData.totalDuration}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  {cropData.season}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider opacity-80">Stages</p>
                <p className="text-3xl font-bold">{cropData.stages.length}</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative z-10 mt-6">
            <div className="flex items-center justify-between text-xs mb-2 opacity-80">
              <span>Progress</span>
              <span>{Math.round(((cropData.currentStageIndex + 1) / cropData.stages.length) * 100)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((cropData.currentStageIndex + 1) / cropData.stages.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-400"
              />
            </div>
          </div>
        </motion.div>

        {/* ── This Week's Task ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-3xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 p-6 sm:p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/30">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">This Week&apos;s Tasks</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Current stage: <span className="font-semibold text-green-600 dark:text-green-400">{weekTask.stageName}</span></p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weekTask.tasks.map((task, i) => (
              <motion.div
                key={task}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-green-50/80 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-100/60 dark:border-green-800/30"
              >
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{task}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Timeline ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" />
            Growth Stage Timeline
          </h3>

          {/* Horizontal Timeline - Desktop */}
          <div className="hidden md:block">
            {/* Timeline line */}
            <div className="relative mx-8 mb-8">
              <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-green-200 via-emerald-300 to-green-200 dark:from-green-800 dark:via-emerald-700 dark:to-green-800 rounded-full" />

              <div className="relative flex justify-between">
                {cropData.stages.map((stage, index) => {
                  const isCurrent = index === cropData.currentStageIndex;
                  const isCompleted = index < cropData.currentStageIndex;
                  const isActive = activeStage === stage.id;

                  return (
                    <div key={stage.id} className="flex flex-col items-center" style={{ width: `${100 / cropData.stages.length}%` }}>
                      {/* Node */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStageClick(stage.id)}
                        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                          isCurrent
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-300 dark:border-green-600 text-white shadow-lg shadow-green-500/40'
                            : isCompleted
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-200 dark:border-green-700 text-white shadow-md'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 shadow-sm'
                        } ${isActive ? 'ring-4 ring-green-300/50 dark:ring-green-600/40' : ''}`}
                      >
                        {/* Pulsing glow for current stage */}
                        {isCurrent && (
                          <>
                            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
                            <span className="absolute -inset-1 rounded-full bg-green-400/20 animate-pulse" />
                          </>
                        )}
                        <span className="relative z-10">{stage.icon}</span>
                      </motion.button>

                      {/* Label */}
                      <p className={`mt-3 text-xs font-semibold text-center leading-tight px-1 ${
                        isCurrent ? 'text-green-700 dark:text-green-400' : isCompleted ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {stage.name}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{stage.weekRange}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Vertical Timeline - Mobile */}
          <div className="md:hidden space-y-0">
            {cropData.stages.map((stage, index) => {
              const isCurrent = index === cropData.currentStageIndex;
              const isCompleted = index < cropData.currentStageIndex;
              const isActive = activeStage === stage.id;
              const isLast = index === cropData.stages.length - 1;

              return (
                <div key={stage.id} className="flex gap-4">
                  {/* Vertical line + node */}
                  <div className="flex flex-col items-center">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStageClick(stage.id)}
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-[3px] transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-300 dark:border-green-600 text-white shadow-lg shadow-green-500/40'
                          : isCompleted
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-200 dark:border-green-700 text-white shadow-sm'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 shadow-sm'
                      } ${isActive ? 'ring-4 ring-green-300/50' : ''}`}
                    >
                      {isCurrent && (
                        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
                      )}
                      <span className="relative z-10 [&>svg]:h-4 [&>svg]:w-4">{stage.icon}</span>
                    </motion.button>
                    {!isLast && (
                      <div className={`w-0.5 flex-1 min-h-[24px] ${isCompleted ? 'bg-green-400 dark:bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-6 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleStageClick(stage.id)}
                      className="text-left w-full"
                    >
                      <p className={`font-semibold text-sm ${isCurrent ? 'text-green-700 dark:text-green-400' : isCompleted ? 'text-green-600 dark:text-green-500' : 'text-gray-600 dark:text-gray-400'}`}>
                        {stage.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{stage.weekRange} · {stage.duration}</p>
                    </button>

                    {/* Expanded content - Mobile */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 p-4 shadow-lg space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">{stage.description}</p>

                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Key Activities</p>
                              <div className="space-y-2">
                                {stage.activities.map((activity) => (
                                  <div key={activity.label} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-green-600 dark:text-green-400">{activity.icon}</span>
                                    {activity.label}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                Indian Farming Tips
                              </p>
                              <div className="space-y-2">
                                {stage.tips.map((tip) => (
                                  <div key={tip} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400 bg-amber-50/60 dark:bg-amber-900/10 p-2.5 rounded-lg border border-amber-100/50 dark:border-amber-800/30">
                                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                    {tip}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Stage Detail - Desktop */}
          <AnimatePresence>
            {activeStage && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 20, height: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="hidden md:block overflow-hidden"
              >
                {cropData.stages
                  .filter((s) => s.id === activeStage)
                  .map((stage) => {
                    const isCurrent = cropData.stages.indexOf(stage) === cropData.currentStageIndex;

                    return (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border p-6 sm:p-8 shadow-xl ${
                          isCurrent
                            ? 'border-green-200 dark:border-green-800 ring-2 ring-green-200/50 dark:ring-green-800/30'
                            : 'border-white/40 dark:border-white/10'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row gap-8">
                          {/* Left: Info */}
                          <div className="flex-1 space-y-5">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-2xl bg-gradient-to-br ${stage.color} text-white shadow-lg`}>
                                {stage.icon}
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100">{stage.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">{stage.weekRange}</span>
                                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">{stage.duration}</span>
                                  {isCurrent && (
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                      Current Stage
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{stage.description}</p>

                            {/* Activities */}
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Key Activities</p>
                              <div className="grid grid-cols-2 gap-2.5">
                                {stage.activities.map((activity, i) => (
                                  <motion.div
                                    key={activity.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 border border-gray-100 dark:border-gray-700/50"
                                  >
                                    <span className="text-green-600 dark:text-green-400">{activity.icon}</span>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{activity.label}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right: Tips */}
                          <div className="lg:w-96 space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                              <Lightbulb className="h-4 w-4 text-amber-500" />
                              Indian Farming Tips
                            </p>
                            {stage.tips.map((tip, i) => (
                              <motion.div
                                key={tip}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/50 dark:from-amber-900/15 dark:to-yellow-900/10 border border-amber-100/50 dark:border-amber-800/30"
                              >
                                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-700 dark:text-gray-300">{tip}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Legend ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center gap-6 px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-white/30 dark:border-white/10"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 ring-2 ring-green-300 shadow-sm" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 ring-2 ring-green-300 shadow-sm">
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40" />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Current Stage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Upcoming</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-400 dark:text-gray-500">Click any stage for details</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
