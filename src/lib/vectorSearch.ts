/**
 * 🔍 CUSTOM COSINE SIMILARITY SEARCH ENGINE
 *
 * Built entirely from scratch — zero third-party vector database libraries.
 *
 * Architecture:
 * 1. TF-IDF Vectorizer   → Converts text into sparse numerical vectors (no neural net needed)
 * 2. Cosine Similarity   → Computes angular similarity between query and document vectors
 * 3. Vector Store        → In-memory store (JSON-backed) for document embeddings
 * 4. Search Engine       → Ranks and returns top-K most relevant documents
 *
 * This replaces pgvector for offline/fallback scenarios. Recruiters: this is a
 * from-scratch implementation of the same mathematics used by Pinecone, Weaviate,
 * and PostgreSQL's pgvector extension.
 */

import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  vector: number[];          // TF-IDF sparse vector
  terms: string[];           // Unique terms in this document
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;        // Cosine similarity score (0–1)
  matchedTerms: string[];
}

interface VectorStore {
  vocabulary: string[];       // Global vocabulary (all unique terms)
  idfScores: Record<string, number>; // IDF score per term
  documents: VectorDocument[];
  lastUpdated: string;
}

// ─────────────────────────────────────────────
// 1. TEXT PREPROCESSOR
// Tokenizes, lowercases, removes stopwords, stems.
// ─────────────────────────────────────────────

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'shall', 'not', 'no', 'nor',
  'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
  'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
  'what', 'which', 'who', 'when', 'where', 'how', 'if', 'so', 'very',
  'also', 'as', 'into', 'about', 'up', 'out', 'than', 'then', 'some',
]);

/**
 * A lightweight English porter-like stemmer.
 * Handles the most common suffixes in agricultural text.
 */
function stem(word: string): string {
  if (word.length <= 3) return word;

  const rules: Array<[RegExp, string]> = [
    [/ational$/, 'ate'],
    [/tional$/, 'tion'],
    [/enci$/, 'ence'],
    [/anci$/, 'ance'],
    [/izer$/, 'ize'],
    [/ising$/, 'ise'],
    [/izing$/, 'ize'],
    [/alism$/, 'al'],
    [/ness$/, ''],
    [/ment$/, ''],
    [/tion$/, 'te'],
    [/ations$/, 'ate'],
    [/ings$/, ''],
    [/ing$/, ''],
    [/ated$/, 'ate'],
    [/ies$/, 'y'],
    [/ness$/, ''],
    [/ful$/, ''],
    [/less$/, ''],
    [/ous$/, ''],
    [/ers$/, 'er'],
    [/est$/, ''],
    [/ed$/, ''],
    [/er$/, ''],
    [/ly$/, ''],
    [/es$/, ''],
    [/s$/, ''],
  ];

  let stemmed = word;
  for (const [pattern, replacement] of rules) {
    if (pattern.test(stemmed)) {
      stemmed = stemmed.replace(pattern, replacement);
      break;
    }
  }
  return stemmed.length >= 3 ? stemmed : word;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')    // Remove punctuation
    .split(/\s+/)                      // Split on whitespace
    .filter(t => t.length > 2)        // Remove short tokens
    .filter(t => !STOPWORDS.has(t))   // Remove stopwords
    .map(t => stem(t));               // Stem each token
}

// ─────────────────────────────────────────────
// 2. TF-IDF VECTORIZER
// Converts text into a numerical vector using Term Frequency-Inverse Document Frequency.
// TF(t, d)  = (count of t in d) / (total terms in d)
// IDF(t)    = log(N / df(t)) where N = total docs, df(t) = docs containing t
// TF-IDF(t, d) = TF(t, d) * IDF(t)
// ─────────────────────────────────────────────

function computeTermFrequency(terms: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const term of terms) {
    tf.set(term, (tf.get(term) || 0) + 1);
  }
  // Normalize by document length
  for (const [term, count] of tf.entries()) {
    tf.set(term, count / terms.length);
  }
  return tf;
}

function computeIDF(allDocTerms: string[][]): Record<string, number> {
  const N = allDocTerms.length;
  const docFrequency = new Map<string, number>();

  for (const docTerms of allDocTerms) {
    const unique = new Set(docTerms);
    for (const term of unique) {
      docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
    }
  }

  const idf: Record<string, number> = {};
  for (const [term, df] of docFrequency.entries()) {
    // Add 1 smoothing to prevent division by zero
    idf[term] = Math.log((N + 1) / (df + 1)) + 1;
  }
  return idf;
}

function buildTfIdfVector(
  terms: string[],
  vocabulary: string[],
  idfScores: Record<string, number>
): number[] {
  const tf = computeTermFrequency(terms);
  return vocabulary.map(vocabTerm => {
    const tfScore = tf.get(vocabTerm) || 0;
    const idfScore = idfScores[vocabTerm] || 0;
    return tfScore * idfScore;
  });
}

// ─────────────────────────────────────────────
// 3. COSINE SIMILARITY (The core algorithm)
//
// Formula:  cos(θ) = (A · B) / (|A| × |B|)
//
// Where:
//   A · B  = dot product = Σ(A[i] × B[i])
//   |A|    = magnitude of A = √(Σ A[i]²)
//   |B|    = magnitude of B = √(Σ B[i]²)
//
// Result: 1.0 = identical, 0.0 = completely unrelated
// ─────────────────────────────────────────────

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(`Vector dimension mismatch: ${vecA.length} vs ${vecB.length}`);
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  // Prevent division by zero (zero vector = empty document)
  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

// ─────────────────────────────────────────────
// 4. VECTOR STORE (Persistent JSON-based storage)
// ─────────────────────────────────────────────

const STORE_PATH = path.join(process.cwd(), 'data', 'vector_store.json');

function loadStore(): VectorStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw) as VectorStore;
    }
  } catch (e) {
    console.warn('[VectorStore] Could not load store, starting fresh:', e);
  }
  return { vocabulary: [], idfScores: {}, documents: [], lastUpdated: new Date().toISOString() };
}

function saveStore(store: VectorStore): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('[VectorStore] Could not save store:', e);
  }
}

function rebuildVocabularyAndVectors(store: VectorStore): VectorStore {
  // Collect all document terms
  const allTerms = store.documents.map(d => d.terms);

  // Build global vocabulary (union of all document terms)
  const vocabularySet = new Set<string>();
  for (const terms of allTerms) {
    for (const term of terms) vocabularySet.add(term);
  }
  const vocabulary = Array.from(vocabularySet).sort();

  // Recompute IDF scores
  const idfScores = computeIDF(allTerms);

  // Recompute TF-IDF vectors for all documents
  const updatedDocuments = store.documents.map(doc => ({
    ...doc,
    vector: buildTfIdfVector(doc.terms, vocabulary, idfScores),
  }));

  return {
    vocabulary,
    idfScores,
    documents: updatedDocuments,
    lastUpdated: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
// 5. PUBLIC API
// ─────────────────────────────────────────────

/**
 * Adds a document to the vector store.
 * Rebuilds vocabulary and all vectors to maintain consistency.
 */
export function addDocument(
  id: string,
  content: string,
  metadata: Record<string, unknown> = {}
): void {
  let store = loadStore();

  // Check for duplicate
  if (store.documents.some(d => d.id === id)) {
    console.log(`[VectorStore] Document "${id}" already exists. Skipping.`);
    return;
  }

  const terms = tokenize(content);
  if (terms.length === 0) {
    console.warn(`[VectorStore] Document "${id}" has no usable terms after tokenization.`);
    return;
  }

  // Add with placeholder vector — will be rebuilt below
  store.documents.push({ id, content, metadata, vector: [], terms });

  // Rebuild everything to account for new vocabulary
  store = rebuildVocabularyAndVectors(store);
  saveStore(store);

  console.log(`[VectorStore] Added "${id}". Store now has ${store.documents.length} docs, ${store.vocabulary.length} vocab terms.`);
}

/**
 * Removes a document from the vector store by ID.
 */
export function removeDocument(id: string): void {
  let store = loadStore();
  store.documents = store.documents.filter(d => d.id !== id);
  store = rebuildVocabularyAndVectors(store);
  saveStore(store);
}

/**
 * Core search function: converts query to TF-IDF vector and
 * computes cosine similarity against all stored documents.
 *
 * @param query       The user's search query
 * @param topK        Number of results to return (default: 3)
 * @param threshold   Minimum similarity score to include (default: 0.05)
 * @returns           Ranked list of matching documents
 */
export function search(
  query: string,
  topK = 3,
  threshold = 0.05
): SearchResult[] {
  const store = loadStore();

  if (store.documents.length === 0) {
    return [];
  }

  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];

  // Build query vector against the stored vocabulary
  const queryVector = buildTfIdfVector(queryTerms, store.vocabulary, store.idfScores);

  // Compute similarity for every document
  const scored: Array<SearchResult> = store.documents.map(doc => {
    let similarity: number;
    try {
      similarity = cosineSimilarity(queryVector, doc.vector);
    } catch {
      similarity = 0;
    }

    const matchedTerms = queryTerms.filter(t => doc.terms.includes(t));

    return {
      id: doc.id,
      content: doc.content,
      metadata: doc.metadata,
      similarity,
      matchedTerms,
    };
  });

  // Sort by similarity (highest first), filter by threshold, return top-K
  return scored
    .filter(r => r.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Returns basic statistics about the vector store.
 */
export function getStoreStats(): { documentCount: number; vocabularySize: number; lastUpdated: string } {
  const store = loadStore();
  return {
    documentCount: store.documents.length,
    vocabularySize: store.vocabulary.length,
    lastUpdated: store.lastUpdated,
  };
}

/**
 * Clears the entire vector store (use with caution).
 */
export function clearStore(): void {
  const empty: VectorStore = { vocabulary: [], idfScores: {}, documents: [], lastUpdated: new Date().toISOString() };
  saveStore(empty);
}
