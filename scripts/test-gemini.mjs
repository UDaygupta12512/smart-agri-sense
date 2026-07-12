import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const keyMatch = env.match(/GEMINI_API_KEY=(.+)/);
const apiKey = keyMatch?.[1]?.trim();

if (!apiKey) {
    console.log('NO_KEY');
    process.exit(1);
}

const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
const question = 'My tomato leaves are yellow with brown spots in Karnataka during monsoon. What should I do?';

for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: question }] }],
        }),
    });
    const text = await res.text();
    console.log(model, res.status, text.slice(0, 200));
}
