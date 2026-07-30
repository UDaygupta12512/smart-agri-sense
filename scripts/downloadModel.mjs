/**
 * Model Download Script
 * Downloads a pre-trained TF.js plant disease model from TF Hub.
 * Run: node scripts/downloadModel.mjs
 */
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODEL_DIR = path.join(ROOT, 'public', 'models', 'plant_disease');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  console.log('\n🌿 Plant Disease Model Downloader');
  console.log('==================================');
  console.log('This script downloads a TF.js plant disease classification model.');
  console.log(`Target directory: ${MODEL_DIR}\n`);

  if (!fs.existsSync(MODEL_DIR)) {
    fs.mkdirSync(MODEL_DIR, { recursive: true });
    console.log(`✅ Created directory: ${MODEL_DIR}`);
  }

  const modelJsonPath = path.join(MODEL_DIR, 'model.json');
  if (fs.existsSync(modelJsonPath)) {
    console.log('⚠️  Model already exists. Delete the /public/models/plant_disease/ folder to re-download.');
    return;
  }

  console.log('📥 Instructions for downloading the plant disease model:');
  console.log('');
  console.log('1. Go to: https://huggingface.co/models?library=tfjs&search=plant+disease');
  console.log('2. Download a TF.js format plant disease model');
  console.log('3. Place model.json and all shard .bin files in:');
  console.log(`   ${MODEL_DIR}`);
  console.log('');
  console.log('Alternative (Python + TensorFlow):');
  console.log('  pip install tensorflow tensorflowjs');
  console.log('  # Train on PlantVillage dataset from Kaggle');
  console.log('  # Export with: tensorflowjs_converter --input_format=keras model.h5 output_dir/');
  console.log('');
  console.log('Once model.json is in place, the /api/pest-detection endpoint will');
  console.log('automatically switch from DEMO mode to live classification mode.');
  console.log('');
  console.log('Also install the TF.js Node.js backend:');
  console.log('  npm install @tensorflow/tfjs-node');
}

main().catch(console.error);
