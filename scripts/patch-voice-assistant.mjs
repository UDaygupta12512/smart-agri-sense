import fs from 'fs';

const path = 'src/components/voice/VoiceAssistant.tsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

// Remove lines 219-789 (1-indexed) => index 218-788
const before = lines.slice(0, 218);
const after = lines.slice(789);

const importLine = "import { buildFarmingKnowledgeAnswer, type SupportedLanguageCode } from '@/lib/farmingKnowledgeAnswer';";

// Remove duplicate type and interfaces (lines 7 and 28-40 => index 6, 27-39)
const head = before.slice(0, 6);
const mid = before.slice(40); // skip type SupportedLanguageCode and KnowledgeDoc interfaces

const insertBlock = `
function cleanTextForSpeech(text: string): string {
    return text
        .replace(/[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}]/gu, ' ')
        .replace(/[*#_\\[\\]()]/g, ' ')
        .replace(/\\d+\\.\\s/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim();
}

const getAIResponse = async (query: string, langCode: SupportedLanguageCode, signal?: AbortSignal): Promise<string> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal,
            body: JSON.stringify({ message: query, language: langCode }),
        });

        const data = await response.json().catch(() => ({}));
        const apiText = typeof data?.response === 'string' ? data.response.trim() : '';

        if (apiText) {
            return apiText;
        }

        if (!response.ok) {
            throw new Error(data?.error ?? 'API request failed');
        }

        return buildFarmingKnowledgeAnswer(query, langCode);
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        console.error('Error fetching AI response:', error);
        return buildFarmingKnowledgeAnswer(query, langCode);
    }
};
`;

const newLines = [
  ...head,
  importLine,
  ...mid,
  insertBlock.trim(),
  ...after,
];

// Remove old getAIResponse and duplicate cleanText if still in after section
let out = newLines.join('\n');
// Remove duplicate blocks that might remain from partial overlap
out = out.replace(/function hasStrongKnowledgeMatch[\s\S]*?^const getAIResponse = async[\s\S]*?^};\n\n/m, '');
out = out.replace(/function cleanTextForSpeech[\s\S]*?^}\n\nfunction hasStrongKnowledgeMatch[\s\S]*?^}\n\nfunction cleanTextForSpeech/m, 'function cleanTextForSpeech');

fs.writeFileSync(path, out, 'utf8');
console.log('patched lines', newLines.length);
