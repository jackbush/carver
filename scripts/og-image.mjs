// Regenerates Carver's preview images from the built app: a screenshot of
// the welcome note in a small window, so the bar's actions read clearly.
//
//   .github/cover.jpg  the 3:2 screenshot at 2400×1600 (README header)
//   <--cover path>     the same, for sites that show it larger
//   public/og.png      1200×630 social preview: the screenshot as a window
//                      centred on a stage in the hue opposite the wordmark
//
// Run with `npm run og` (builds first). Uses the installed Chrome.

import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { build, preview } from 'vite';
import { chromium } from '@playwright/test';

const ROOT = new URL('..', import.meta.url).pathname;
const { cover } = parseArgs({ options: { cover: { type: 'string' } } }).values;

// The window the app is shown in: 3:2, as small as it goes while both sides
// still show (the app goes single-pane below 800px), so everything is large in
// the image. Large text, and the paged preview, so the proof reads as a page.
const WINDOW = { width: 840, height: 560 };
const SETTINGS = { theme: 'light', textSize: 'large', preview: 'paged' };

const COVER = { width: 2400, height: 1600 };
const coverPaths = [resolve(ROOT, '.github/cover.jpg')];
if (cover) coverPaths.push(resolve(process.env.INIT_CWD ?? '.', cover));

// The social card: the window centred, MARGIN from the top and bottom.
const SOCIAL = { width: 1200, height: 630 };
const MARGIN = 45;
const RADIUS = 10;

// The stage is the hue opposite the wordmark's red, kept very dark.
const css = await readFile(resolve(ROOT, 'src/style.css'), 'utf8');
const wordmark = css.match(/--bar-red:\s*(#[0-9a-f]{6})/i)[1];
const STAGE = `hsl(${(hueOf(wordmark) + 180) % 360} 100% 9%)`;

await build({ root: ROOT, logLevel: 'warn' });
// Pick a free port and check it serves this build, not some other server.
const port = await freePort();
const server = await preview({ root: ROOT, logLevel: 'warn', preview: { port, strictPort: true } });
const base = (await import(resolve(ROOT, 'vite.config.js'))).default.base ?? '/';
const url = `http://localhost:${port}${base}`;

let browser;
try {
  const built = await readFile(resolve(ROOT, 'dist/index.html'), 'utf8');
  const served = await (await fetch(url)).text();
  if (served !== built) throw new Error(`${url} is not serving this build`);

  browser = await chromium.launch({ channel: 'chrome' });

  // The 3:2 cover is the window itself, captured at its final size.
  const coverShot = await capture(COVER.width / WINDOW.width);
  for (const path of coverPaths) {
    await mkdir(dirname(path), { recursive: true });
    await writeImage(coverShot, COVER, path);
  }

  // The social card shows the window smaller; capture it at that size so the
  // text is rasterised there rather than scaled down.
  const height = SOCIAL.height - 2 * MARGIN;
  const width = (height * WINDOW.width) / WINDOW.height;
  const windowShot = await capture(width / WINDOW.width);
  const card = await browser.newPage({ viewport: SOCIAL });
  await card.setContent(`
    <style>
      body { margin: 0; width: ${SOCIAL.width}px; height: ${SOCIAL.height}px; display: grid; place-items: center; background: ${STAGE}; }
      img {
        display: block; width: ${width}px; height: ${height}px; border-radius: ${RADIUS}px;
        box-shadow: 0 6px 20px rgb(0 0 0 / 0.35), 0 1px 4px rgb(0 0 0 / 0.25);
      }
    </style>
    <img src="data:image/png;base64,${windowShot.toString('base64')}" alt="">`);
  await card.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
  const ogPath = resolve(ROOT, 'public/og.png');
  await card.screenshot({ path: ogPath });
  console.log(`Wrote ${ogPath} (${SOCIAL.width}×${SOCIAL.height}, stage ${STAGE} from the wordmark's ${wordmark})`);
} finally {
  await browser?.close();
  await new Promise((done) => server.httpServer.close(done));
}

// Screenshots the app in the window at the given pixel density.
async function capture(density) {
  const page = await browser.newPage({ viewport: WINDOW, deviceScaleFactor: density, locale: 'en-GB' });
  await page.addInitScript((settings) => {
    localStorage.clear();
    localStorage.setItem('carver-settings', JSON.stringify(settings));
  }, SETTINGS);
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  if (!res.ok()) throw new Error(`${url}: HTTP ${res.status()}`);
  await page.evaluate(() => document.fonts.ready);
  const shot = await page.screenshot();
  await page.close();
  return shot;
}

// Writes a PNG screenshot as the file type its path names.
async function writeImage(png, size, path) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } });
  await page.setContent(`<style>body{margin:0}img{display:block}</style><img src="data:image/png;base64,${png.toString('base64')}">`);
  await page.evaluate(() => document.images[0].decode());
  await page.screenshot({ path, ...(path.endsWith('.jpg') ? { type: 'jpeg', quality: 90 } : {}) });
  await page.close();
  console.log(`Wrote ${path} (${size.width}×${size.height})`);
}

function hueOf(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  const h = max === r ? (g - b) / d : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return Math.round((h * 60 + 360) % 360);
}

function freePort() {
  return new Promise((done, fail) => {
    const srv = createServer().listen(0, () => {
      const { port } = srv.address();
      srv.close(() => done(port));
    });
    srv.on('error', fail);
  });
}
