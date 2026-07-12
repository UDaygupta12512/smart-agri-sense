/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const pagePath = path.join('c:', 'Users', 'udaya', 'OneDrive', 'Desktop', 'Farmers Advisory System', 'smart-agri-sense', 'src', 'app', 'dashboard', 'advisory', 'page.tsx');
const dataPath = path.join('c:', 'Users', 'udaya', 'OneDrive', 'Desktop', 'Farmers Advisory System', 'smart-agri-sense', 'src', 'lib', 'advisoryData.ts');

const pageContent = fs.readFileSync(pagePath, 'utf8');
const lines = pageContent.split('\n');

const extractStart = 5; // line 6 (0-indexed 5)
const extractEnd = 620; // line 620 (0-indexed 619)

const extractedLines = lines.slice(extractStart, extractEnd);
const dataContent = `export ` + extractedLines.join('\n').replace(/^(type|interface|const|function) /gm, 'export $1 ');

fs.writeFileSync(dataPath, dataContent, 'utf8');

const newPageLines = [
    ...lines.slice(0, extractStart),
    `import {`,
    `    AdvisoryLanguageCode, AdviceRecord, AdviceResult,`,
    `    CROP_PROFILES, SOIL_TIPS, ADVISORY_LANGUAGES, UI_COPY,`,
    `    normalizeLanguagePreference, isAdvisoryLanguageCode,`,
    `    generateNativeLanguageAdvice, generateAdvice`,
    `} from '@/lib/advisoryData';`,
    ...lines.slice(extractEnd)
];

fs.writeFileSync(pagePath, newPageLines.join('\n'), 'utf8');
console.log('Done!');
