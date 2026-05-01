import sharp from '../node_modules/sharp/lib/index.js';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = path.join(__dirname, '..');

const PHOTOS = [
  {
    cdnId: 'photo-1643148636630-0b0fb138fc74',
    out: 'public/images/blog/diario-de-trading.webp',
    w: 1200, h: 630, q: 80,
    desc: 'person writing in notebook — diario de trading',
  },
  {
    cdnId: 'photo-1758876019043-cedb0b6f56ea',
    out: 'public/images/blog/fomo-trading.webp',
    w: 1200, h: 630, q: 80,
    desc: 'stressed person at laptop — FOMO trading',
  },
  {
    cdnId: 'photo-1707779491435-000c45820db2',
    out: 'public/images/blog/gestion-de-capital.webp',
    w: 1200, h: 630, q: 80,
    desc: 'calculator on desk — gestión de capital',
  },
  {
    cdnId: 'photo-1768055104929-cf2317674a80',
    out: 'public/images/blog/metricas-trading.webp',
    w: 1200, h: 630, q: 80,
    desc: 'trader analysing charts on tablet — métricas de trading',
  },
  {
    cdnId: 'photo-1744782211816-c5224434614f',
    out: 'public/images/blog/overtrading.webp',
    w: 1200, h: 630, q: 80,
    desc: 'multiple trading screens — overtrading',
  },
  {
    cdnId: 'photo-1758874384700-68bfae2bb58e',
    out: 'public/images/blog/por-que-pierden-traders.webp',
    w: 1200, h: 630, q: 80,
    desc: 'frustrated person at laptop — por qué pierden traders',
  },
  {
    cdnId: 'photo-1553343801-5d4a45829f2a',
    out: 'public/images/blog/ratio-riesgo-beneficio.webp',
    w: 1200, h: 630, q: 80,
    desc: 'weighing scale — ratio riesgo beneficio',
  },
  {
    cdnId: 'photo-1773091258432-da61c63abe41',
    out: 'public/images/blog/revenge-trading.webp',
    w: 1200, h: 630, q: 80,
    desc: 'person head in hands at laptop — revenge trading',
  },
  {
    cdnId: 'photo-1758874383352-481f911951aa',
    out: 'public/images/blog/how-to-keep-trading-journal.webp',
    w: 1200, h: 630, q: 80,
    desc: 'man with glasses working at laptop — how to keep a trading journal',
  },
  {
    cdnId: 'photo-1767424196045-030bbde122a4',
    out: 'public/images/blog/trading-journal-template.webp',
    w: 1200, h: 630, q: 80,
    desc: 'hand holding tablet with candlestick charts — trading journal template',
  },
  {
    cdnId: 'photo-1758874384700-68bfae2bb58e',
    out: 'public/images/blog/why-traders-lose.webp',
    w: 1200, h: 630, q: 80,
    desc: 'frustrated trader — why traders lose money',
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
  fs.mkdirSync(path.join(BASE, 'public/images/blog'), { recursive: true });

  let ok = 0;
  let fail = 0;

  for (const photo of PHOTOS) {
    const outPath = path.join(BASE, photo.out);
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
