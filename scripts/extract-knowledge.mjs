import fs from 'fs';

const lines = fs.readFileSync('src/components/voice/VoiceAssistant.tsx', 'utf8').split(/\r?\n/);
const header = `export type SupportedLanguageCode = 'en-IN' | 'hi-IN' | 'bn-IN' | 'kn-IN' | 'ml-IN' | 'ta-IN' | 'te-IN';

interface KnowledgeDoc {
    id: string;
    title: string;
    keywords: string[];
    intents: string[];
    content: Partial<Record<SupportedLanguageCode, string>>;
}

interface ScoredDoc {
    doc: KnowledgeDoc;
    score: number;
    matchedKeywords: string[];
}

`;

const body = lines.slice(218, 789).join('\n');
const patched = body.replace(
    'function buildLocalKnowledgeAnswer',
    'export function buildFarmingKnowledgeAnswer'
);

fs.writeFileSync('src/lib/farmingKnowledgeAnswer.ts', header + patched, 'utf8');
console.log('OK', header.length + patched.length);
