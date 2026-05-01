import sharp from '../node_modules/sharp/lib/index.js';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, '..');

// CDN photo IDs confirmed free + working from images.unsplash.com
const PHOTOS = [
  {
    cdnId: 'photo-1767424412548-1a1ac7f4b9bc',
    out: 'public/images/hero/trader-workspace.webp',
    w: 1200, h: 800, q: 78,
    desc: 'Hero — trading charts on multiple screens',
  },
  {
    cdnId: 'photo-1758874573138-f3dd1ed25c7e',
    out: 'public/images/steps/step-register.webp',
    w: 400, h: 300, q: 75,
    desc: 'Step 1 — hands typing on laptop',
  },
  {
    cdnId: 'photo-1635236198091-33d5aa8466cc',
    out: 'public/images/steps/step-analyze.webp',
    w: 400, h: 300, q: 75,
    desc: 'Step 2 — person with chart on laptop',
  },
  {
    cdnId: 'photo-1758521541409-256fa9e24fe4',
    out: 'public/images/steps/step-improve.webp',
    w: 400, h: 300, q: 75,
    desc: 'Step 3 — woman smiling at laptop screen',
  },
  {
    cdnId: 'photo-1695485121912-25c7ea05119c',
    out: 'public/images/people/testimonial-01.webp',
    w: 160, h: 160, q: 80,
    desc: 'Testimonial 1 — JM (casual man portrait)',
  },
  {
    cdnId: 'photo-1758874384232-cfa79a5babf1',
    out: 'public/images/people/testimonial-02.webp',
    w: 160, h: 160, q: 80,
    desc: 'Testimonial 2 — SL (woman smiling with laptop)',
  },
  {
    cdnId: 'photo-1758873267202-44c33e64f084',
    out: 'public/images/people/testimonial-03.webp',
    w: 160, h: 160, q: 80,
    desc: 'Testimonial 3 — MA (Middle Eastern man)',
  },
  {
    cdnId: 'photo-1581065178047-8ee15951ede6',
    out: 'public/images/people/testimonial-04.webp',
    w: 160, h: 160, q: 80,
    desc: 'Testimonial 4 — LG (Asian woman professional)',
  },
  {
    cdnId: 'photo-1665650401573-8b33ca641315',
    out: 'public/images/people/testimonial-05.webp',
    w: 160, h: 160, q: 80,
    desc: 'Testimonial 5 — PT (man outdoors)',
  },
  {
    cdnId: 'photo-1609091289242-735df7a2207a',
    out: 'public/images/people/testimonial-06.webp',
    w: 160, h: 160, q: 80,
    desc: 'Testimonial 6 — ER (woman portrait)',
  },
  {
    cdnId: 'photo-1758874384556-cc2b9dcbb6e0',
    out: 'public/images/people/about-founder.webp',
    w: 400, h: 400, q: 78,
    desc: 'About — founder (woman with laptop)',
  },
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function processAll() {
  let ok = 0;
  let fail = 0;

  for (const photo of PHOTOS) {
    const outPath = path.join(BASE, photo.out);
    // Download at 2× to let sharp do high-quality downscale
    const srcW = photo.w * 2;
    const srcH = photo.h * 2;
    const url = `https://images.unsplash.com/${photo.cdnId}?w=${srcW}&h=${srcH}&fit=crop&q=90&auto=format`;

    process.stdout.write(`Downloading ${photo.desc}... `);
    try {
      const buf = await fetchUrl(url);
      if (buf.length < 5000) throw new Error(`Too small (${buf.length}B) — blocked or wrong ID`);

      await sharp(buf)
        .resize(photo.w, photo.h, { fit: 'cover', position: 'attention' })
        .webp({ quality: photo.q, effort: 4 })
        .toFile(outPath);

      const kb = Math.round(fs.statSync(outPath).size / 1024);
      console.log(`✓ ${kb}KB`);
      ok++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`);
}

processAll();
