'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, AlertTriangle, CheckCircle2, X, Scan, Volume2, Loader2, Sparkles, Video, VideoOff, RotateCcw, Zap, History, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiagnosisResult {
    disease: string;
    plant: string;
    confidence: string;
    severity: 'Low' | 'Medium' | 'High';
    description: string;
    treatment: string[];
    preventiveMeasures: string[];
}

type SymptomKey =
    | 'powderyWhite'
    | 'circularSpots'
    | 'yellowHalos'
    | 'orangePustules'
    | 'mosaicPattern'
    | 'leafCurling'
    | 'waterSoaked'
    | 'wiltingDrooping'
    | 'darkSunken';

interface ImageSignals {
    brightness: number;
    saturation: number;
    whiteRatio: number;
    yellowRatio: number;
    orangeRatio: number;
    brownRatio: number;
    greenRatio: number;
    darkRatio: number;
    lesionContrast: number;
    edgeDensity: number;
    mottlingIndex: number;
}

interface SignalRule {
    feature: keyof ImageSignals;
    target: number;
    tolerance: number;
    weight: number;
}

interface DiseaseProfile {
    disease: string;
    plant: string;
    severity: 'Low' | 'Medium' | 'High';
    description: string;
    treatment: string[];
    preventiveMeasures: string[];
    cropAffinity: string[];
    signalRules: SignalRule[];
    symptomWeights: Partial<Record<SymptomKey, number>>;
}

const cropOptions = [
    { value: 'unknown', label: 'Not sure / Mixed crop' },
    { value: 'tomato', label: 'Tomato' },
    { value: 'potato', label: 'Potato' },
    { value: 'pepper', label: 'Pepper / Chilli' },
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'cucumber', label: 'Cucumber / Gourds' },
    { value: 'grape', label: 'Grapes' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'soybean', label: 'Soybean' },
    { value: 'onion', label: 'Onion' },
    { value: 'maize', label: 'Maize / Corn' },
    { value: 'other', label: 'Other crop' }
] as const;

const symptomOptions: Array<{ key: SymptomKey; label: string }> = [
    { key: 'powderyWhite', label: 'Powdery white patches' },
    { key: 'circularSpots', label: 'Circular lesions/spots' },
    { key: 'yellowHalos', label: 'Yellow halo around spots' },
    { key: 'orangePustules', label: 'Orange/rust pustules' },
    { key: 'mosaicPattern', label: 'Mottled mosaic pattern' },
    { key: 'leafCurling', label: 'Leaf curling/distortion' },
    { key: 'waterSoaked' as SymptomKey, label: 'Water-soaked lesions' },
    { key: 'wiltingDrooping' as SymptomKey, label: 'Wilting or drooping' },
    { key: 'darkSunken' as SymptomKey, label: 'Dark sunken spots on fruit' },
];

const diseaseProfiles: Record<string, DiseaseProfile> = {
    'early_blight': {
        disease: 'Early Blight (Alternaria solani)',
        plant: 'Tomato / Potato',
        severity: 'High',
        description: 'Fungal infection characterized by "bullseye" pattern spots on older leaves. Can lead to severe defoliation and reduced yield.',
        treatment: [
            'Prune and destroy infected leaves immediately.',
            'Apply Copper-based fungicides or Chlorothalonil.',
            'Improve air circulation by proper spacing.',
            'Avoid overhead watering to reduce leaf wetness.',
            'Rotate crops with non-solanaceous plants next season.'
        ],
        preventiveMeasures: [
            'Use disease-resistant varieties',
            'Maintain proper plant spacing',
            'Apply mulch to prevent soil splash',
            'Practice crop rotation'
        ],
        cropAffinity: ['tomato', 'potato', 'pepper'],
        symptomWeights: {
            circularSpots: 0.32,
            yellowHalos: 0.14,
            leafCurling: 0.08,
            wiltingDrooping: 0.05
        },
        signalRules: [
            { feature: 'brownRatio', target: 0.19, tolerance: 0.15, weight: 2.4 },
            { feature: 'darkRatio', target: 0.24, tolerance: 0.18, weight: 1.9 },
            { feature: 'lesionContrast', target: 0.55, tolerance: 0.28, weight: 2.0 },
            { feature: 'edgeDensity', target: 0.5, tolerance: 0.25, weight: 1.4 },
            { feature: 'whiteRatio', target: 0.05, tolerance: 0.09, weight: 0.9 }
        ]
    },
    'powdery_mildew': {
        disease: 'Powdery Mildew',
        plant: 'Multiple Crops',
        severity: 'Medium',
        description: 'White powdery spots on leaves and stems. Commonly affects cucurbits, grapes, and roses. Thrives in humid conditions.',
        treatment: [
            'Apply sulfur-based fungicides in early morning.',
            'Use neem oil spray (2ml/L water).',
            'Remove heavily infected leaves.',
            'Improve air circulation around plants.'
        ],
        preventiveMeasures: [
            'Avoid overhead irrigation',
            'Ensure proper spacing',
            'Apply preventive fungicides during humid weather',
            'Use resistant varieties when available'
        ],
        cropAffinity: ['cucumber', 'grape', 'tomato', 'pepper'],
        symptomWeights: {
            powderyWhite: 0.4,
            circularSpots: 0.08
        },
        signalRules: [
            { feature: 'whiteRatio', target: 0.33, tolerance: 0.2, weight: 2.8 },
            { feature: 'brightness', target: 0.72, tolerance: 0.2, weight: 1.8 },
            { feature: 'saturation', target: 0.24, tolerance: 0.18, weight: 1.8 },
            { feature: 'lesionContrast', target: 0.35, tolerance: 0.2, weight: 1.1 },
            { feature: 'greenRatio', target: 0.24, tolerance: 0.2, weight: 0.8 }
        ]
    },
    'leaf_spot': {
        disease: 'Bacterial Leaf Spot',
        plant: 'Pepper / Tomato',
        severity: 'Medium',
        description: 'Small, water-soaked spots that turn brown with yellow halos. Spreads rapidly in warm, wet conditions.',
        treatment: [
            'Apply copper hydroxide or copper sulfate.',
            'Remove and destroy infected plant parts.',
            'Avoid working with wet plants.',
            'Ensure proper drainage in the field.'
        ],
        preventiveMeasures: [
            'Use certified disease-free seeds',
            'Practice 2-3 year crop rotation',
            'Avoid overhead irrigation',
            'Sanitize tools regularly'
        ],
        cropAffinity: ['pepper', 'tomato', 'other'],
        symptomWeights: {
            circularSpots: 0.24,
            yellowHalos: 0.3,
            waterSoaked: 0.15
        },
        signalRules: [
            { feature: 'yellowRatio', target: 0.2, tolerance: 0.14, weight: 2.3 },
            { feature: 'brownRatio', target: 0.13, tolerance: 0.11, weight: 1.8 },
            { feature: 'edgeDensity', target: 0.56, tolerance: 0.22, weight: 1.6 },
            { feature: 'lesionContrast', target: 0.5, tolerance: 0.24, weight: 1.5 },
            { feature: 'darkRatio', target: 0.16, tolerance: 0.12, weight: 1.0 }
        ]
    },
    'white_spot': {
        disease: 'White Spot Disease',
        plant: 'Rice / Wheat',
        severity: 'High',
        description: 'Circular to oval white spots with dark brown margins on leaves. Can cause significant yield loss if not treated early.',
        treatment: [
            'Apply Tricyclazole 75% WP (0.6g/L water).',
            'Use Propiconazole 25% EC for severe infections.',
            'Maintain proper nitrogen levels.',
            'Drain excess water from fields.'
        ],
        preventiveMeasures: [
            'Use resistant varieties',
            'Avoid excessive nitrogen fertilization',
            'Maintain proper water management',
            'Remove crop residues after harvest'
        ],
        cropAffinity: ['rice', 'wheat'],
        symptomWeights: {
            circularSpots: 0.3,
            powderyWhite: 0.16,
            yellowHalos: 0.1
        },
        signalRules: [
            { feature: 'whiteRatio', target: 0.3, tolerance: 0.2, weight: 2.5 },
            { feature: 'edgeDensity', target: 0.62, tolerance: 0.24, weight: 2.0 },
            { feature: 'darkRatio', target: 0.18, tolerance: 0.12, weight: 1.2 },
            { feature: 'brightness', target: 0.62, tolerance: 0.22, weight: 1.1 },
            { feature: 'brownRatio', target: 0.11, tolerance: 0.1, weight: 1.0 }
        ]
    },
    'rust': {
        disease: 'Wheat Rust (Puccinia spp.)',
        plant: 'Wheat',
        severity: 'High',
        description: 'Fungal disease causing orange, yellow, or brown pustules on leaves and stems. Can devastate entire crops if left untreated.',
        treatment: [
            'Apply Triazole fungicides immediately upon detection.',
            'Ensure balanced nitrogen application.',
            'Remove and burn infected crop debris.'
        ],
        preventiveMeasures: [
            'Plant rust-resistant wheat varieties',
            'Avoid early sowing in disease-prone areas',
            'Monitor crops closely during humid weather'
        ],
        cropAffinity: ['wheat', 'rice'],
        symptomWeights: {
            orangePustules: 0.42,
            yellowHalos: 0.12,
            circularSpots: 0.08
        },
        signalRules: [
            { feature: 'orangeRatio', target: 0.24, tolerance: 0.15, weight: 2.9 },
            { feature: 'brownRatio', target: 0.16, tolerance: 0.12, weight: 1.6 },
            { feature: 'yellowRatio', target: 0.13, tolerance: 0.1, weight: 1.3 },
            { feature: 'edgeDensity', target: 0.5, tolerance: 0.25, weight: 1.0 },
            { feature: 'whiteRatio', target: 0.06, tolerance: 0.08, weight: 0.8 }
        ]
    },
    'mosaic_virus': {
        disease: 'Cucumber Mosaic Virus',
        plant: 'Multiple Crops',
        severity: 'High',
        description: 'Viral infection causing mottled, yellowing, or distorted leaves. Stunted plant growth and reduced yield.',
        treatment: [
            'No chemical cure exists for viruses.',
            'Immediate removal and destruction of infected plants.',
            'Control aphid populations which spread the virus.'
        ],
        preventiveMeasures: [
            'Use reflective mulches to deter aphids',
            'Eliminate weed hosts near crop fields',
            'Plant virus-free seeds/transplants'
        ],
        cropAffinity: ['cucumber', 'tomato', 'pepper', 'potato', 'other'],
        symptomWeights: {
            mosaicPattern: 0.4,
            leafCurling: 0.2,
            yellowHalos: 0.1
        },
        signalRules: [
            { feature: 'mottlingIndex', target: 0.58, tolerance: 0.22, weight: 2.6 },
            { feature: 'greenRatio', target: 0.38, tolerance: 0.22, weight: 1.7 },
            { feature: 'yellowRatio', target: 0.19, tolerance: 0.14, weight: 1.8 },
            { feature: 'lesionContrast', target: 0.4, tolerance: 0.18, weight: 1.2 },
            { feature: 'whiteRatio', target: 0.08, tolerance: 0.1, weight: 0.7 }
        ]
    },
    'late_blight': {
        disease: 'Late Blight (Phytophthora infestans)',
        plant: 'Tomato / Potato',
        severity: 'High',
        description: 'Devastating fungal-like disease causing large, dark, water-soaked lesions on leaves, stems, and fruits. Can destroy entire crops within days under favorable conditions.',
        treatment: [
            'Apply Metalaxyl + Mancozeb (Ridomil Gold) @ 2.5g/L immediately.',
            'Remove and destroy all infected plant parts.',
            'Improve field drainage and air circulation.',
            'Spray Cymoxanil + Mancozeb as follow-up in 7 days.'
        ],
        preventiveMeasures: [
            'Use certified disease-free seed tubers/transplants',
            'Avoid overhead irrigation in humid weather',
            'Apply preventive Mancozeb before wet spells',
            'Destroy all crop debris after harvest'
        ],
        cropAffinity: ['tomato', 'potato'],
        symptomWeights: {
            circularSpots: 0.2,
            yellowHalos: 0.1,
            leafCurling: 0.15,
            waterSoaked: 0.3,
            wiltingDrooping: 0.1
        },
        signalRules: [
            { feature: 'darkRatio', target: 0.3, tolerance: 0.18, weight: 2.6 },
            { feature: 'brownRatio', target: 0.22, tolerance: 0.16, weight: 2.2 },
            { feature: 'greenRatio', target: 0.2, tolerance: 0.18, weight: 1.4 },
            { feature: 'lesionContrast', target: 0.6, tolerance: 0.25, weight: 1.8 },
            { feature: 'edgeDensity', target: 0.45, tolerance: 0.25, weight: 1.2 }
        ]
    },
    'downy_mildew': {
        disease: 'Downy Mildew',
        plant: 'Cucurbits / Grapes',
        severity: 'High',
        description: 'Yellowing on upper leaf surface with greyish-purple fuzzy growth on undersides. Spreads rapidly in cool, moist conditions.',
        treatment: [
            'Apply Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L.',
            'Remove severely infected leaves.',
            'Reduce overhead irrigation to limit leaf wetness.',
            'Spray Fosetyl-Al for systemic protection.'
        ],
        preventiveMeasures: [
            'Use resistant varieties where available',
            'Ensure adequate plant spacing for air flow',
            'Apply preventive copper sprays before monsoon',
            'Remove and destroy all crop debris'
        ],
        cropAffinity: ['cucumber', 'grape', 'other'],
        symptomWeights: {
            yellowHalos: 0.3,
            mosaicPattern: 0.15,
            leafCurling: 0.1
        },
        signalRules: [
            { feature: 'yellowRatio', target: 0.25, tolerance: 0.18, weight: 2.5 },
            { feature: 'greenRatio', target: 0.28, tolerance: 0.2, weight: 1.6 },
            { feature: 'brownRatio', target: 0.1, tolerance: 0.1, weight: 1.3 },
            { feature: 'brightness', target: 0.55, tolerance: 0.22, weight: 1.2 },
            { feature: 'mottlingIndex', target: 0.4, tolerance: 0.2, weight: 1.4 }
        ]
    },
    'anthracnose': {
        disease: 'Anthracnose (Colletotrichum spp.)',
        plant: 'Multiple Crops',
        severity: 'Medium',
        description: 'Sunken, dark lesions on leaves, stems, flowers, and fruits. Often has salmon-pink spore masses in center of lesions under humid conditions.',
        treatment: [
            'Apply Carbendazim 50% WP @ 1g/L or Thiophanate-methyl.',
            'Remove and destroy infected fruits and leaves.',
            'Avoid harvesting during wet weather.',
            'Apply Copper Oxychloride 50 WP @ 3g/L as follow-up.'
        ],
        preventiveMeasures: [
            'Use disease-free seeds and planting material',
            'Hot water seed treatment (52\u00b0C for 30 minutes)',
            'Avoid excess nitrogen fertilization',
            'Maintain proper plant spacing'
        ],
        cropAffinity: ['pepper', 'tomato', 'cucumber', 'grape', 'other'],
        symptomWeights: {
            circularSpots: 0.28,
            yellowHalos: 0.08,
            leafCurling: 0.06,
            darkSunken: 0.25
        },
        signalRules: [
            { feature: 'darkRatio', target: 0.22, tolerance: 0.15, weight: 2.3 },
            { feature: 'brownRatio', target: 0.18, tolerance: 0.14, weight: 2.1 },
            { feature: 'edgeDensity', target: 0.55, tolerance: 0.22, weight: 1.6 },
            { feature: 'lesionContrast', target: 0.52, tolerance: 0.24, weight: 1.5 },
            { feature: 'orangeRatio', target: 0.08, tolerance: 0.08, weight: 1.0 }
        ]
    },
    'cercospora_leaf_spot': {
        disease: 'Cercospora Leaf Spot',
        plant: 'Multiple Crops',
        severity: 'Medium',
        description: 'Small, circular spots with grey-white centers and dark brown to purple borders. Common in warm, humid environments on many crops.',
        treatment: [
            'Apply Mancozeb 75% WP @ 2.5g/L or Carbendazim 50% WP.',
            'Remove lower infected leaves to reduce spread.',
            'Improve air circulation through proper spacing.',
            'Apply Chlorothalonil for severe infections.'
        ],
        preventiveMeasures: [
            'Avoid overhead irrigation',
            'Practice crop rotation with non-host crops',
            'Remove crop debris from the field',
            'Use balanced fertilization'
        ],
        cropAffinity: ['rice', 'wheat', 'tomato', 'pepper', 'other'],
        symptomWeights: {
            circularSpots: 0.3,
            yellowHalos: 0.15,
            powderyWhite: 0.08
        },
        signalRules: [
            { feature: 'brownRatio', target: 0.15, tolerance: 0.12, weight: 2.2 },
            { feature: 'whiteRatio', target: 0.12, tolerance: 0.1, weight: 1.8 },
            { feature: 'edgeDensity', target: 0.58, tolerance: 0.22, weight: 1.8 },
            { feature: 'lesionContrast', target: 0.48, tolerance: 0.22, weight: 1.5 },
            { feature: 'darkRatio', target: 0.18, tolerance: 0.14, weight: 1.2 }
        ]
    },
    'healthy': {
        disease: 'Healthy Plant \u2014 No Disease Detected',
        plant: 'All Crops',
        severity: 'Low',
        description: 'No significant disease symptoms detected. The plant appears healthy based on image analysis.',
        treatment: [
            'Continue regular crop management practices.',
            'Maintain balanced fertilization and proper irrigation.',
            'Monitor weekly for any emerging symptoms.'
        ],
        preventiveMeasures: [
            'Practice crop rotation every season',
            'Use disease-resistant varieties',
            'Maintain field hygiene and remove crop debris',
            'Apply preventive fungicide during humid weather'
        ],
        cropAffinity: ['tomato', 'potato', 'pepper', 'rice', 'wheat', 'cucumber', 'grape', 'cotton', 'soybean', 'onion', 'maize', 'other', 'unknown'],
        symptomWeights: {},
        signalRules: [
            { feature: 'greenRatio', target: 0.55, tolerance: 0.40, weight: 3.0 },
            { feature: 'brightness', target: 0.5, tolerance: 0.25, weight: 1.5 },
            { feature: 'saturation', target: 0.4, tolerance: 0.25, weight: 1.5 },
            { feature: 'brownRatio', target: 0.04, tolerance: 0.08, weight: 2.0 },
            { feature: 'yellowRatio', target: 0.04, tolerance: 0.08, weight: 1.5 },
            { feature: 'whiteRatio', target: 0.03, tolerance: 0.06, weight: 1.5 },
            { feature: 'orangeRatio', target: 0.02, tolerance: 0.05, weight: 1.5 }
        ]
    }
};

const compressImage = (dataUrl: string, maxDimension = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
            let { width, height } = img;
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(dataUrl);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const hueFromRgb = (r: number, g: number, b: number) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    if (delta === 0) return 0;

    let hue = 0;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;

    return (hue * 60 + 360) % 360;
};

const scoreByTarget = (value: number, target: number, tolerance: number) => {
    const safeTolerance = Math.max(tolerance, 0.0001);
    return clamp(1 - Math.abs(value - target) / safeTolerance);
};

const scoreSignalRules = (rules: SignalRule[], signals: ImageSignals) => {
    let weightedScore = 0;
    let totalWeight = 0;

    for (const rule of rules) {
        const featureScore = scoreByTarget(signals[rule.feature], rule.target, rule.tolerance);
        weightedScore += featureScore * rule.weight;
        totalWeight += rule.weight;
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
};

const scoreSymptomMatch = (profile: DiseaseProfile, selectedSymptoms: SymptomKey[]) => {
    if (selectedSymptoms.length === 0) return 0.5;

    const totalHitWeight = selectedSymptoms.reduce((sum, symptom) => {
        return sum + (profile.symptomWeights[symptom] ?? 0);
    }, 0);

    const maxReasonableWeight = selectedSymptoms.length * 0.4;
    return clamp(totalHitWeight / Math.max(maxReasonableWeight, 0.4));
};

const scoreCropMatch = (profile: DiseaseProfile, selectedCrop: string) => {
    if (!selectedCrop || selectedCrop === 'unknown') return 0.5;
    return profile.cropAffinity.includes(selectedCrop) ? 1 : 0.2;
};

const summarizeSignals = (signals: ImageSignals) => {
    const cues: string[] = [];

    if (signals.whiteRatio > 0.22) cues.push('visible white powder-like patches');
    if (signals.orangeRatio > 0.12) cues.push('orange-brown pustule signatures');
    if (signals.yellowRatio > 0.15) cues.push('yellow halo coloration around lesions');
    if (signals.mottlingIndex > 0.52) cues.push('mosaic-like mottling');
    if (signals.edgeDensity > 0.5 && signals.lesionContrast > 0.45) {
        cues.push('well-defined lesion boundaries');
    }

    if (cues.length === 0) {
        return 'mixed stress signatures without a dominant lesion pattern';
    }

    return cues.slice(0, 2).join(' and ');
};

const adjustSeverity = (
    baseSeverity: DiagnosisResult['severity'],
    signals: ImageSignals,
    confidencePct: number
): DiagnosisResult['severity'] => {
    const baseline = { Low: 1, Medium: 2, High: 3 }[baseSeverity];

    let severityScore = baseline;
    if (signals.lesionContrast > 0.55) severityScore += 0.25;
    if (signals.darkRatio > 0.24) severityScore += 0.2;
    if (signals.orangeRatio + signals.brownRatio > 0.28) severityScore += 0.2;
    if (confidencePct < 68) severityScore -= 0.2;

    if (severityScore >= 2.65) return 'High';
    if (severityScore >= 1.75) return 'Medium';
    return 'Low';
};

const computeImageSignals = async (imageDataUrl: string): Promise<ImageSignals | null> => {
    return new Promise((resolve) => {
        const img = new window.Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Use a larger sample size for better accuracy
            const size = 128;
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
                resolve(null);
                return;
            }

            ctx.drawImage(img, 0, 0, size, size);
            const imageData = ctx.getImageData(0, 0, size, size).data;

            let totalBrightness = 0;
            let totalSaturation = 0;
            let brightnessSqSum = 0;

            let whitePixels = 0;
            let yellowPixels = 0;
            let orangePixels = 0;
            let brownPixels = 0;
            let greenPixels = 0;
            let darkPixels = 0;

            let edgeHits = 0;
            let comparisons = 0;
            let neighborDiffSum = 0;

            // Additional metrics for better analysis
            let redDominantPixels = 0;
            let purplePixels = 0;
            let grayPixels = 0;
            let highSaturationPixels = 0;
            let lowSaturationPixels = 0;

            const pixelCount = size * size;
            const getBrightnessAtIndex = (index: number) => {
                const r = imageData[index];
                const g = imageData[index + 1];
                const b = imageData[index + 2];
                return (r + g + b) / (3 * 255);
            };

            // Multi-scale edge detection for better lesion boundary detection
            const getEdgeStrength = (x: number, y: number, radius: number) => {
                if (x < radius || y < radius || x >= size - radius || y >= size - radius) return 0;

                const centerIdx = (y * size + x) * 4;
                const centerBr = getBrightnessAtIndex(centerIdx);

                let maxDiff = 0;
                const offsets = [[-radius, 0], [radius, 0], [0, -radius], [0, radius]];
                for (const [dx, dy] of offsets) {
                    const neighborIdx = ((y + dy) * size + (x + dx)) * 4;
                    const neighborBr = getBrightnessAtIndex(neighborIdx);
                    maxDiff = Math.max(maxDiff, Math.abs(centerBr - neighborBr));
                }
                return maxDiff;
            };

            let multiScaleEdgeSum = 0;
            let multiScaleCount = 0;

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const pixelIndex = (y * size + x) * 4;
                    const r = imageData[pixelIndex];
                    const g = imageData[pixelIndex + 1];
                    const b = imageData[pixelIndex + 2];

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const delta = max - min;

                    const brightness = (r + g + b) / (3 * 255);
                    const saturation = max === 0 ? 0 : delta / max;
                    const hue = hueFromRgb(r, g, b);

                    totalBrightness += brightness;
                    totalSaturation += saturation;
                    brightnessSqSum += brightness * brightness;

                    // Track saturation distribution
                    if (saturation > 0.6) highSaturationPixels++;
                    if (saturation < 0.15) lowSaturationPixels++;

                    // Improved color detection with better thresholds
                    // White detection: high brightness, low saturation
                    if (brightness > 0.75 && saturation < 0.18) whitePixels++;

                    // Dark detection: low brightness
                    if (brightness < 0.25) darkPixels++;

                    // Gray detection: low saturation, medium brightness
                    if (saturation < 0.12 && brightness > 0.3 && brightness < 0.7) grayPixels++;

                    // Yellow detection: hue 45-70, good saturation
                    if (hue >= 40 && hue <= 75 && saturation > 0.2 && brightness > 0.32) yellowPixels++;

                    // Orange detection: hue 15-42
                    if (hue >= 12 && hue <= 45 && saturation > 0.23 && brightness > 0.28 && brightness < 0.75) orangePixels++;

                    // Brown detection: orange-ish hue with lower brightness
                    if (hue >= 8 && hue <= 45 && saturation > 0.18 && brightness >= 0.12 && brightness <= 0.38) brownPixels++;

                    // Green detection: hue 70-170
                    if (hue >= 65 && hue <= 175 && saturation > 0.15 && brightness > 0.18) greenPixels++;

                    // Red-dominant pixels (possible necrosis)
                    if (r > g * 1.3 && r > b * 1.3 && saturation > 0.25) redDominantPixels++;

                    // Purple detection (possible anthracnose)
                    if (hue >= 250 && hue <= 320 && saturation > 0.15) purplePixels++;

                    const currentBrightness = brightness;

                    // Standard edge detection
                    if (x < size - 1) {
                        const rightBrightness = getBrightnessAtIndex(pixelIndex + 4);
                        const diff = Math.abs(currentBrightness - rightBrightness);
                        neighborDiffSum += diff;
                        if (diff > 0.18) edgeHits++;
                        comparisons++;
                    }

                    if (y < size - 1) {
                        const downBrightness = getBrightnessAtIndex(pixelIndex + size * 4);
                        const diff = Math.abs(currentBrightness - downBrightness);
                        neighborDiffSum += diff;
                        if (diff > 0.18) edgeHits++;
                        comparisons++;
                    }

                    // Multi-scale edge detection
                    if (x >= 2 && y >= 2 && x < size - 2 && y < size - 2) {
                        multiScaleEdgeSum += getEdgeStrength(x, y, 1) + getEdgeStrength(x, y, 2) * 0.5;
                        multiScaleCount++;
                    }
                }
            }

            const avgBrightness = totalBrightness / pixelCount;
            const avgSaturation = totalSaturation / pixelCount;
            const variance = Math.max(brightnessSqSum / pixelCount - avgBrightness * avgBrightness, 0);
            const contrast = Math.sqrt(variance);

            const avgNeighborDiff = comparisons > 0 ? neighborDiffSum / comparisons : 0;
            const edgeDensity = comparisons > 0 ? edgeHits / comparisons : 0;

            // Calculate mottling index using multi-scale detection for better virus detection
            const multiScaleEdgeAvg = multiScaleCount > 0 ? multiScaleEdgeSum / multiScaleCount : 0;
            const mottlingBase = avgNeighborDiff / 0.25;
            const mottlingMultiScale = multiScaleEdgeAvg / 0.3;
            const mottlingIndex = clamp((mottlingBase * 0.6 + mottlingMultiScale * 0.4));

            // Adjust ratios based on actual pixel counts
            const adjustedWhiteRatio = whitePixels / pixelCount;
            const adjustedYellowRatio = yellowPixels / pixelCount;
            const adjustedOrangeRatio = orangePixels / pixelCount;
            const adjustedBrownRatio = brownPixels / pixelCount;
            const adjustedGreenRatio = greenPixels / pixelCount;
            const adjustedDarkRatio = darkPixels / pixelCount;

            // Boost lesion contrast for clearer lesion patterns
            const lesionContrastBase = clamp(contrast / 0.32);
            const saturationVariance = (highSaturationPixels + lowSaturationPixels) / pixelCount;
            const lesionContrastAdjusted = clamp(lesionContrastBase + saturationVariance * 0.2);

            resolve({
                brightness: avgBrightness,
                saturation: avgSaturation,
                whiteRatio: adjustedWhiteRatio,
                yellowRatio: adjustedYellowRatio,
                orangeRatio: adjustedOrangeRatio,
                brownRatio: adjustedBrownRatio,
                greenRatio: adjustedGreenRatio,
                darkRatio: adjustedDarkRatio,
                lesionContrast: lesionContrastAdjusted,
                edgeDensity: clamp(edgeDensity / 0.55),
                mottlingIndex: mottlingIndex
            });
        };

        img.onerror = () => resolve(null);
        img.src = imageDataUrl;
    });
};

const inferDiagnosis = (
    signals: ImageSignals,
    selectedCrop: string,
    selectedSymptoms: SymptomKey[]
): DiagnosisResult => {
    const ranked = Object.entries(diseaseProfiles)
        .filter(([key]) => key !== 'healthy')
        .map(([, profile]) => {
            const signalScore = scoreSignalRules(profile.signalRules, signals);
            const symptomScore = scoreSymptomMatch(profile, selectedSymptoms);
            const cropScore = scoreCropMatch(profile, selectedCrop);

            // Favor user-selected symptoms (override) over sometimes-flaky pixel analysis
            const combinedScore = signalScore * 0.30 + symptomScore * 0.60 + cropScore * 0.10;
            return { profile, signalScore, symptomScore, cropScore, combinedScore };
        })
        .sort((a, b) => b.combinedScore - a.combinedScore);

    let best = ranked[0];
    const second = ranked[1] ?? ranked[0];

    // If no symptoms selected and the top disease score is weak, fall back to healthy
    const originalBestDisease = ranked[0];
    if (best.combinedScore < 0.4 && selectedSymptoms.length === 0) {
        const healthyProfile = diseaseProfiles['healthy'];
        const healthySignalScore = scoreSignalRules(healthyProfile.signalRules, signals);
        const healthyCropScore = scoreCropMatch(healthyProfile, selectedCrop);
        const healthyCombined = healthySignalScore * 0.68 + 0.5 * 0.2 + healthyCropScore * 0.12;
        // Only override if healthy actually scores better or if disease score is very low
        if (healthyCombined >= best.combinedScore || best.combinedScore < 0.2) {
            best = {
                profile: healthyProfile,
                signalScore: healthySignalScore,
                symptomScore: 0.5,
                cropScore: healthyCropScore,
                combinedScore: healthyCombined
            };
        }
    }

    const secondBest = (best.profile === diseaseProfiles['healthy']) ? originalBestDisease : second;
    const confidenceMargin = best.combinedScore - secondBest.combinedScore;
    const qualityPenalty = signals.brightness < 0.16 || signals.brightness > 0.9 ? 0.08 : 0;
    const confidence = clamp(0.5 + best.combinedScore * 0.35 + confidenceMargin * 0.5 - qualityPenalty, 0.5, 0.98);
    const confidencePct = Math.round(confidence * 100);

    const computedSeverity = adjustSeverity(best.profile.severity, signals, confidencePct);
    const signalSummary = summarizeSignals(signals);

    return {
        disease: best.profile.disease,
        plant: best.profile.plant,
        confidence: `${confidencePct}%`,
        severity: computedSeverity,
        description: `${best.profile.description} Image cues indicate ${signalSummary}.`,
        treatment: best.profile.treatment,
        preventiveMeasures: best.profile.preventiveMeasures
    };
};

export default function PlantDoctorPage() {
    const [image, setImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<DiagnosisResult | null>(null);
    const [selectedCrop, setSelectedCrop] = useState<string>('unknown');
    const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomKey[]>([]);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [scanHistory, setScanHistory] = useState<{ image: string; disease: string; date: string; result: DiagnosisResult }[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Cleanup camera and speech on unmount
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
        if (!validTypes.includes(file.type.toLowerCase())) {
            alert('Please upload a valid image file (JPEG, PNG, WEBP, HEIC)');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            alert('Image file is too large. Maximum size is 10MB.');
            return;
        }

        // Validate file size (min 1KB to prevent empty files)
        const minSize = 1024; // 1KB
        if (file.size < minSize) {
            alert('Image file is too small. Please upload a valid image.');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const result = reader.result;
                if (typeof result === 'string' && result.startsWith('data:image/')) {
                    const compressed = await compressImage(result);
                    setImage(compressed);
                    setResult(null);
                    stopCamera();
                } else {
                    alert('Failed to read image file. Please try another image.');
                }
            };
            reader.onerror = () => {
                alert('Error reading image file. Please try again.');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            alert('Failed to process image. Please try another file.');
        }

        // Clear the input so the same file can be uploaded again
        e.target.value = '';
    };

    const startCamera = async () => {
        try {
            setCameraError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraActive(true);
                setImage(null);
                setResult(null);
            }
        } catch (err) {
            console.error('Camera error:', err);
            setCameraError('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    };

    const captureImage = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            let width = video.videoWidth;
            let height = video.videoHeight;
            const maxDimension = 1024;
            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                } else {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, width, height);
                const capturedImage = canvas.toDataURL('image/jpeg', 0.8);
                setImage(capturedImage);
                stopCamera();
            }
        }
    }, []);

    const toggleSymptom = (symptom: SymptomKey) => {
        setSelectedSymptoms((prev) => {
            if (prev.includes(symptom)) {
                return prev.filter((item) => item !== symptom);
            }
            return [...prev, symptom];
        });
    };

    const compressImage = async (dataUrl: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% JPEG quality
                } else {
                    resolve(dataUrl);
                }
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    };

    const handleAnalyze = async () => {
        if (!image) {
            setCameraError('Please upload or capture an image before running diagnosis.');
            return;
        }

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }

        setAnalyzing(true);
        setCameraError(null);

        try {
            // Map selected symptom keys to their human-readable labels
            const symptomLabels = selectedSymptoms
                .map(key => symptomOptions.find(opt => opt.key === key)?.label)
                .filter(Boolean);

            const compressedImage = await compressImage(image);

            // Run local mathematical heuristic analysis first
            const signals = await computeImageSignals(compressedImage);
            let localDiagnosis: DiagnosisResult | null = null;
            if (signals) {
                localDiagnosis = inferDiagnosis(signals, selectedCrop, selectedSymptoms);
            }

            // Check Cache first to save API calls
            const shortImageStr = compressedImage.length + "_" + compressedImage.substring(0, 30) + "_" + compressedImage.substring(compressedImage.length - 30);
            const cacheKey = `agri_pest_cache_${selectedCrop}_${selectedSymptoms.join(',')}_${shortImageStr}`;
            const cachedResult = localStorage.getItem(cacheKey);

            if (cachedResult) {
                try {
                    const parsedResult = JSON.parse(cachedResult);
                    setResult(parsedResult);
                    setAnalyzing(false);
                    return;
                } catch (e) {
                    // ignore invalid cache
                }
            }

            try {
                // Call the AI-powered pest detection API
                const response = await fetch('/api/pest-detection', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image: compressedImage,
                        crop: selectedCrop,
                        symptoms: symptomLabels,
                        localAnalysis: localDiagnosis
                    }),
                });

                const data = await response.json();

                if (response.ok && data.source === 'ai' && data.diagnosis) {
                    // Use AI diagnosis
                    const aiDiagnosis: DiagnosisResult = {
                        disease: data.diagnosis.disease,
                        plant: data.diagnosis.plant,
                        confidence: data.diagnosis.confidence,
                        severity: data.diagnosis.severity,
                        description: data.diagnosis.description,
                        treatment: data.diagnosis.treatment,
                        preventiveMeasures: data.diagnosis.preventiveMeasures,
                    };

                    setAnalyzing(false);
                    setResult(aiDiagnosis);
                    localStorage.setItem(cacheKey, JSON.stringify(aiDiagnosis));
                    setScanHistory((prev) => [
                        {
                            image,
                            disease: aiDiagnosis.disease,
                            result: aiDiagnosis,
                            date: new Date().toLocaleDateString()
                        },
                        ...prev.slice(0, 4)
                    ]);
                    return;
                }
            } catch (error) {
                console.warn('AI pest detection fetch failed:', error);
            }

            // Fallback to local heuristic diagnosis if AI fails
            if (localDiagnosis) {
                console.log('Using local heuristic fallback diagnosis.');
                setAnalyzing(false);
                setResult(localDiagnosis);
                return;
            }

            setAnalyzing(false);
            setCameraError('Failed to analyze image. Please try again later.');
            return;

        } catch (error) {
            console.warn('Analysis failed:', error);
            setAnalyzing(false);
            setCameraError('Failed to analyze image. Please try again later.');
            return;
        }
    };

    const speakDiagnosis = () => {
        if (result && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            const text = `Disease detected: ${result.disease}. Severity: ${result.severity}. ${result.description}. Treatment: ${result.treatment.join('. ')}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-IN';
            utterance.rate = 0.9;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    const shareDiagnosis = async () => {
        if (result && navigator.share) {
            try {
                await navigator.share({
                    title: 'Crop Disease Diagnosis',
                    text: `Disease: ${result.disease}\nSeverity: ${result.severity}\nTreatment: ${result.treatment[0]}`,
                });
            } catch {
                console.log('Share cancelled');
            }
        }
    };

    const resetScan = () => {
        setImage(null);
        setResult(null);
        stopCamera();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-primary" />
                        Plant Doctor
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        AI-powered disease diagnosis & treatment recommendations.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${showHistory ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <History className="h-4 w-4" />
                        History
                    </button>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        v2.3 Context-Aware
                    </div>
                </div>
            </div>

            {/* Scan History Panel */}
            {showHistory && scanHistory.length > 0 && (
                <div className="bg-white dark:bg-card rounded-2xl border border-border p-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-3 text-sm text-muted-foreground uppercase tracking-wider">Recent Scans</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {scanHistory.map((scan, idx) => (
                            <div
                                key={idx}
                                className="shrink-0 w-32 p-2 rounded-xl border border-border hover:border-primary transition-colors cursor-pointer group"
                                onClick={() => {
                                    setImage(scan.image);
                                    setResult(scan.result);
                                    setShowHistory(false);
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={scan.image} alt="Scan" className="w-full h-20 object-cover rounded-lg mb-2" />
                                <p className="text-xs font-medium truncate group-hover:text-primary">{scan.disease.split('(')[0]}</p>
                                <p className="text-xs text-muted-foreground">{scan.date}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* Upload & Camera Area */}
                <div className="space-y-6">
                    <div className="rounded-2xl border-2 border-dashed border-border bg-card/50 hover:bg-card/80 transition-colors relative overflow-hidden min-h-[450px] flex flex-col">

                        {/* Camera View */}
                        {isCameraActive && !image && (
                            <div className="relative grow">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} className="hidden" />

                                {/* Camera Overlay */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Scanning frame */}
                                    <div className="absolute inset-8 border-2 border-white/50 rounded-2xl">
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
                                    </div>

                                    {/* Instruction text */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                                        Position the affected leaf in frame
                                    </div>
                                </div>

                                {/* Camera Controls */}
                                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                                    <button
                                        onClick={stopCamera}
                                        aria-label="Stop camera"
                                        title="Stop camera"
                                        className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        <VideoOff className="h-6 w-6" />
                                    </button>
                                    <button
                                        onClick={captureImage}
                                        aria-label="Capture image"
                                        title="Capture image"
                                        className="p-5 bg-white text-primary rounded-full shadow-xl hover:scale-105 transition-transform ring-4 ring-primary/30"
                                    >
                                        <Camera className="h-8 w-8" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Upload/Initial State */}
                        {!image && !isCameraActive && (
                            <div className="grow flex flex-col items-center justify-center p-8 text-center">
                                {cameraError && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                                        {cameraError}
                                    </div>
                                )}

                                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                    <Camera className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="font-bold text-2xl mb-2 text-foreground">Scan Your Crop</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                                    Take a photo or upload an image of the affected leaf, stem, or fruit.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                                    <button
                                        onClick={startCamera}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                                    >
                                        <Video className="h-5 w-5" />
                                        Live Camera
                                    </button>
                                    <label className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-border text-foreground font-bold rounded-xl hover:bg-muted transition-all cursor-pointer">
                                        <Upload className="h-5 w-5" />
                                        Upload
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="mt-6 flex gap-3 text-xs text-muted-foreground font-medium">
                                    <span className="px-3 py-1 bg-muted rounded border border-border">JPG</span>
                                    <span className="px-3 py-1 bg-muted rounded border border-border">PNG</span>
                                    <span className="px-3 py-1 bg-muted rounded border border-border">HEIC</span>
                                </div>
                            </div>
                        )}

                        {/* Captured/Uploaded Image */}
                        {image && !isCameraActive && (
                            <div className="relative grow flex flex-col">
                                <div className="relative grow rounded-xl overflow-hidden bg-black/5 border border-border m-4">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={image} alt="Uploaded crop" className="w-full h-full object-contain" />

                                    {/* Scanning Animation Overlay */}
                                    <AnimatePresence>
                                        {analyzing && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 bg-primary/10 overflow-hidden rounded-xl"
                                            >
                                                {/* Laser scan line */}
                                                <motion.div
                                                    className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_20px_4px_rgba(34,197,94,0.7)] z-20"
                                                    animate={{ top: ['0%', '100%', '0%'] }}
                                                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                                                />
                                                
                                                {/* Targeting Brackets */}
                                                <motion.div 
                                                    className="absolute inset-[15%] border-2 border-primary/20 rounded-xl"
                                                    animate={{ scale: [1, 1.02, 1], opacity: [0.6, 1, 0.6] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                >
                                                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                                                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                                                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                                                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
                                                    
                                                    {/* Scanning reticle center */}
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-primary/50 flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
                                                    </div>
                                                </motion.div>

                                                {/* Random AI Analysis Nodes */}
                                                {Array.from({ length: 4 }).map((_, i) => (
                                                    <motion.div
                                                        key={`node-${i}`}
                                                        className="absolute w-16 h-16 border border-primary/40 bg-primary/10 rounded flex items-center justify-center z-10"
                                                        initial={{ opacity: 0, scale: 0.5, top: `${20 + i * 15}%`, left: `${10 + (i % 2) * 50}%` }}
                                                        animate={{ 
                                                            opacity: [0, 1, 0], 
                                                            scale: [0.8, 1, 0.8], 
                                                        }}
                                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                                                    >
                                                        <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                                                        <div className="absolute -top-4 text-[8px] font-mono text-primary/80 bg-background/50 px-1 rounded whitespace-nowrap">
                                                            A-{Math.floor(Math.random() * 900) + 100}
                                                        </div>
                                                    </motion.div>
                                                ))}

                                                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
                                                    <motion.div 
                                                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                                        className="bg-black/80 backdrop-blur-md text-white px-8 py-5 rounded-3xl flex flex-col items-center gap-3 shadow-[0_0_40px_rgba(34,197,94,0.2)] border border-primary/20"
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-bold text-lg tracking-wide text-white">Analyzing Crop</span>
                                                            <span className="text-[11px] text-primary/80 font-mono mt-1.5 uppercase tracking-widest animate-pulse">Consulting Agricultural Database...</span>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Reset button */}
                                    <button
                                        onClick={resetScan}
                                        aria-label="Remove selected image"
                                        title="Remove selected image"
                                        className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all z-20"
                                        disabled={analyzing}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {!result && !analyzing && (
                                    <div className="p-4 pt-0">
                                        <button
                                            onClick={handleAnalyze}
                                            className="w-full inline-flex items-center justify-center rounded-xl bg-primary px-6 py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.98]"
                                        >
                                            <Scan className="mr-2 h-5 w-5" />
                                            Diagnose Disease
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/20 space-y-4">
                        <div>
                            <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm">Field Context (Improves Accuracy)</h4>
                            <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-1">
                                Add crop type and visible symptoms to help narrow disease candidates.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="crop-type" className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                                Crop Type
                            </label>
                            <select
                                id="crop-type"
                                value={selectedCrop}
                                onChange={(event) => setSelectedCrop(event.target.value)}
                                className="w-full rounded-lg border border-amber-200 dark:border-amber-800/40 bg-white dark:bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                            >
                                {cropOptions.map((crop) => (
                                    <option key={crop.value} value={crop.value}>
                                        {crop.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">Observed Symptoms</p>
                            <div className="flex flex-wrap gap-2">
                                {symptomOptions.map((symptom) => {
                                    const isActive = selectedSymptoms.includes(symptom.key);
                                    return (
                                        <button
                                            key={symptom.key}
                                            type="button"
                                            onClick={() => toggleSymptom(symptom.key)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                                isActive
                                                    ? 'bg-amber-500 text-white border-amber-500'
                                                    : 'bg-white/80 dark:bg-card border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                                            }`}
                                        >
                                            {symptom.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedSymptoms.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedSymptoms([])}
                                    className="text-xs font-medium text-amber-800 dark:text-amber-300 underline underline-offset-2"
                                >
                                    Clear selected symptoms
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/20">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2">📸 Tips for Better Results</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                            <li>• Ensure good lighting on the affected area</li>
                            <li>• Focus on a single leaf or symptom</li>
                            <li>• Capture both the front and back of leaves</li>
                            <li>• Include some healthy tissue for comparison</li>
                        </ul>
                    </div>
                </div>

                {/* Results Panel */}
                <div>
                    {result ? (
                        <div className={`bg-white dark:bg-card border-2 rounded-2xl overflow-hidden shadow-lg animate-in slide-in-from-right-8 duration-500 ${
                            result.severity === 'High' ? 'border-red-500/50 shadow-[0_4px_20px_rgba(239,68,68,0.1)]' :
                            result.severity === 'Medium' ? 'border-amber-500/50 shadow-[0_4px_20px_rgba(245,158,11,0.1)]' :
                            'border-green-500/50 shadow-[0_4px_20px_rgba(34,197,94,0.1)]'
                        }`}>
                            {/* Header with severity indicator */}
                            <div className={`p-6 border-b ${result.severity === 'High'
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'
                                : result.severity === 'Medium'
                                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20'
                                    : 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20'
                                }`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${result.severity === 'High' ? 'bg-red-100 dark:bg-red-900/30' :
                                            result.severity === 'Medium' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                                'bg-green-100 dark:bg-green-900/30'
                                            }`}>
                                            <AlertTriangle className={`h-6 w-6 ${result.severity === 'High' ? 'text-red-600 dark:text-red-400' :
                                                result.severity === 'Medium' ? 'text-amber-600 dark:text-amber-400' :
                                                    'text-green-600 dark:text-green-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-foreground">{result.disease}</h2>
                                            <p className="text-sm text-muted-foreground font-medium">Affected: {result.plant}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={isSpeaking ? stopSpeaking : speakDiagnosis}
                                            aria-label={isSpeaking ? 'Stop reading diagnosis' : 'Read diagnosis aloud'}
                                            className="p-2 hover:bg-white/50 rounded-full text-foreground/70 hover:text-primary transition-colors"
                                            title="Listen to diagnosis"
                                        >
                                            <Volume2 className={`h-6 w-6 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
                                        </button>
                                        <button
                                            onClick={shareDiagnosis}
                                            aria-label="Share diagnosis"
                                            className="p-2 hover:bg-white/50 rounded-full text-foreground/70 hover:text-primary transition-colors"
                                            title="Share diagnosis"
                                        >
                                            <Share2 className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="px-3 py-1 bg-white/60 dark:bg-black/20 rounded-lg text-sm font-semibold border border-border/50">
                                        <span className="text-muted-foreground">Confidence: </span>
                                        <span className="text-foreground">{result.confidence}</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg text-sm font-bold border ${result.severity === 'High'
                                        ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200/50'
                                        : result.severity === 'Medium'
                                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200/50'
                                            : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200/50'
                                        }`}>
                                        Severity: {result.severity}
                                    </div>
                                </div>
                            </div>

                            {/* Confidence Warning */}
                            {!isNaN(parseInt(result.confidence.replace('%', ''))) && parseInt(result.confidence.replace('%', '')) < 60 && (
                                <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 p-4 px-6 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800 dark:text-red-300 font-medium leading-relaxed">
                                        Low Confidence ({result.confidence}): The AI isn't entirely sure. The image might be blurry or the symptoms are unusual. For a more accurate diagnosis, please upload a clearer, close-up photo of the affected area.
                                    </p>
                                </div>
                            )}

                            <div className="p-6 space-y-6">
                                {/* Diagnosis */}
                                <div>
                                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Diagnosis</h4>
                                    <p className="text-foreground leading-relaxed">
                                        {result.description}
                                    </p>
                                </div>

                                {/* Treatment */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        Recommended Treatment
                                    </h4>
                                    <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50">
                                        {result.treatment.map((step: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                    {i + 1}
                                                </div>
                                                <p className="text-sm text-foreground/90">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Preventive Measures */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Preventive Measures</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {result.preventiveMeasures.map((measure, i) => (
                                            <div key={i} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                                                <span className="text-blue-700 dark:text-blue-300">{measure}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                                        Find Treatment Products
                                    </button>
                                    <button className="flex-1 py-2.5 border border-border text-foreground text-sm font-semibold rounded-lg hover:bg-muted transition-colors">
                                        Consult Expert
                                    </button>
                                </div>

                                {/* Scan Again */}
                                <button
                                    onClick={resetScan}
                                    className="w-full py-2.5 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Scan Another Image
                                </button>
                            </div>
                        </div>
                    ) : analyzing ? (
                        <div className="h-full bg-white dark:bg-card border border-border shadow-sm rounded-2xl overflow-hidden p-6 space-y-6">
                            {/* Skeleton Header */}
                            <div className="flex justify-between items-start animate-pulse">
                                <div className="space-y-3">
                                    <div className="h-8 w-48 bg-muted rounded-lg"></div>
                                    <div className="h-4 w-32 bg-muted/60 rounded-md"></div>
                                </div>
                                <div className="h-10 w-24 bg-muted rounded-full"></div>
                            </div>
                            
                            {/* Skeleton Badges */}
                            <div className="flex gap-3 animate-pulse pt-2">
                                <div className="h-8 w-32 bg-muted rounded-lg"></div>
                                <div className="h-8 w-24 bg-muted rounded-lg"></div>
                            </div>

                            {/* Skeleton Description */}
                            <div className="space-y-3 pt-6 animate-pulse">
                                <div className="h-4 w-24 bg-muted rounded-md mb-4"></div>
                                <div className="h-4 w-full bg-muted/70 rounded-md"></div>
                                <div className="h-4 w-[90%] bg-muted/70 rounded-md"></div>
                                <div className="h-4 w-[75%] bg-muted/70 rounded-md"></div>
                            </div>

                            {/* Skeleton Treatment */}
                            <div className="space-y-4 pt-6 animate-pulse">
                                <div className="h-4 w-40 bg-muted rounded-md mb-4"></div>
                                <div className="bg-muted/20 rounded-xl p-4 space-y-4 border border-border/50">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="h-6 w-6 rounded-full bg-muted shrink-0"></div>
                                            <div className="space-y-2 flex-1 pt-1">
                                                <div className="h-4 w-full bg-muted/60 rounded-md"></div>
                                                <div className="h-4 w-[85%] bg-muted/60 rounded-md"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 border-2 border-dashed border-border/60 rounded-2xl bg-muted/5 min-h-[450px]">
                            <Scan className="h-16 w-16 text-muted-foreground/30" />
                            <h3 className="text-xl font-semibold text-muted-foreground">Waiting for Scan</h3>
                            <p className="text-muted-foreground/70 max-w-xs">
                                Upload an image or use the live camera to scan your crop. The AI will analyze it and provide diagnosis with treatment recommendations.
                            </p>

                            {/* Common diseases */}
                            <div className="mt-6 w-full">
                                <p className="text-xs text-muted-foreground font-medium mb-3">COMMONLY DETECTED DISEASES</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {['Early Blight', 'Powdery Mildew', 'Leaf Spot', 'White Spot', 'Rust', 'Mosaic Virus'].map((disease, i) => (
                                        <span key={i} className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                                            {disease}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CSS for scan animation */}
            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
