import fs from 'fs';

const path = 'src/components/voice/VoiceAssistant.tsx';
const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);

const head = [...lines.slice(0, 6), ...lines.slice(7, 27)];
const middle = lines.slice(40, 218);
const tail = lines.slice(812);

const block = `
import { buildFarmingKnowledgeAnswer, type SupportedLanguageCode as FarmingLangCode } from '@/lib/farmingKnowledgeAnswer';

type SupportedLanguageCode = FarmingLangCode;

function cleanTextForSpeech(text: string): string {
    return text
        .replace(/[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{27BF}]/gu, ' ')
        .replace(/[*#_\\[\\]()]/g, ' ')
        .replace(/\\d+\\.\\s/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim();
}

async function getAIResponse(query: string, langCode: SupportedLanguageCode, signal?: AbortSignal): Promise<string> {
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
            throw new Error(typeof data?.error === 'string' ? data.error : 'API request failed');
        }

        return buildFarmingKnowledgeAnswer(query, langCode);
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        console.error('Error fetching AI response:', error);
        return buildFarmingKnowledgeAnswer(query, langCode);
    }
}
`;

const out = [...head, block.trim(), ...middle, ...tail].join('\n');
fs.writeFileSync(path, out, 'utf8');
console.log('Slimmed VoiceAssistant:', out.split('\n').length, 'lines');
