import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pdfParse from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Custom TF-IDF Vector Store (Feature 2)
// Dual-write: saves to both Supabase AND local JSON store
// ─────────────────────────────────────────────

const STORE_PATH = path.resolve(process.cwd(), 'data', 'vector_store.json');

function loadLocalStore() {
  try {
    if (fs.existsSync(STORE_PATH)) return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch {}
  return { vocabulary: [], idfScores: {}, documents: [], lastUpdated: new Date().toISOString() };
}

function saveLocalStore(store) {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

const STOPWORDS = new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','it','this','that','not','no','i','you','he','she','we','they']);

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 2 && !STOPWORDS.has(t));
}

function addToLocalStore(id, content, metadata) {
  let store = loadLocalStore();
  if (store.documents.some(d => d.id === id)) return;
  const terms = tokenize(content);
  store.documents.push({ id, content, metadata, vector: [], terms });
  // Rebuild vocabulary + IDF
  const allTerms = store.documents.map(d => d.terms);
  const vocabSet = new Set();
  for (const t of allTerms) t.forEach(term => vocabSet.add(term));
  store.vocabulary = Array.from(vocabSet).sort();
  const N = allTerms.length;
  const df = {};
  for (const docTerms of allTerms) {
    new Set(docTerms).forEach(term => { df[term] = (df[term] || 0) + 1; });
  }
  store.idfScores = {};
  for (const [term, freq] of Object.entries(df)) {
    store.idfScores[term] = Math.log((N + 1) / (freq + 1)) + 1;
  }
  // Rebuild vectors
  store.documents = store.documents.map(doc => {
    const tfMap = {};
    doc.terms.forEach(t => { tfMap[t] = (tfMap[t] || 0) + 1; });
    Object.keys(tfMap).forEach(t => { tfMap[t] /= doc.terms.length; });
    const vector = store.vocabulary.map(v => (tfMap[v] || 0) * (store.idfScores[v] || 0));
    return { ...doc, vector };
  });
  store.lastUpdated = new Date().toISOString();
  saveLocalStore(store);
  console.log(`  💾 Saved to local TF-IDF store (${store.documents.length} docs, ${store.vocabulary.length} vocab terms)`);
}

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing required environment variables in .env.local');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper function to chunk text
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.slice(index, index + chunkSize));
    index += chunkSize - overlap;
  }
  return chunks;
}

async function ingestPdf(filePath) {
  console.log(`Reading PDF: ${filePath}...`);
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  
  // Clean text
  const text = data.text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`Extracted ${text.length} characters.`);

  const chunks = chunkText(text);
  console.log(`Created ${chunks.length} chunks. Generating embeddings...`);

  const fileName = path.basename(filePath);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkId = `${fileName}-chunk-${i}`;
    console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
    
    try {
      // ── 1. Supabase pgvector (cloud, production) ──────────────
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: chunk,
      });

      const embedding = response.embeddings[0].values;

      const { error } = await supabase.from('documents').insert({
        content: chunk,
        metadata: { source: fileName, chunkIndex: i },
        embedding: embedding,
      });

      if (error) {
        console.error(`  ❌ Supabase insert error for chunk ${i + 1}:`, error.message);
      } else {
        console.log(`  ✅ Saved to Supabase pgvector`);
      }

      // ── 2. Local TF-IDF vector store (offline fallback) ───────
      addToLocalStore(chunkId, chunk, { source: fileName, chunkIndex: i });

    } catch (e) {
      console.error(`  ❌ Error processing chunk ${i + 1}:`, e.message);
      // Even if Gemini embedding fails, save to local store
      addToLocalStore(chunkId, chunk, { source: fileName, chunkIndex: i });
    }
  }

  console.log('\n✅ Ingestion complete!');
  console.log('   • Supabase pgvector: cloud-based neural search');
  console.log('   • Local TF-IDF store: offline keyword-based fallback');
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/ingest.mjs <path-to-pdf>');
  process.exit(1);
}

ingestPdf(args[0]).catch(console.error);
