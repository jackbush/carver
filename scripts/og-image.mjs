// Regenerates Carver's preview images from the built app: a screenshot of
// the welcome note in a small window, so the bar's actions read clearly.
//
//   .github/cover.jpg  3:2 at 2400×1600 (README header): the window on the
//                      stage with an even border, two thirds of the bar deep
//   <--cover path>     the same, for sites that show it larger
//   public/og.png      1200×630 social preview: the window centred on the stage
//
// The stage is the hue opposite the wordmark, very dark; the window is
// rounded and casts a shadow on it.
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

const css = await readFile(resolve(ROOT, 'src/style.css'), 'utf8');
const wordmark = css.match(/--bar-accent:\s*(#[0-9a-f]{6})/i)[1];
const barHeight = parseFloat(css.match(/--masthead-h:\s*([\d.]+)px/)[1]);
const STAGE = `hsl(${(hueOf(wordmark) + 180) % 360} 100% 9%)`;
const RADIUS = 10;
const SHADOW = '0 6px 20px rgb(0 0 0 / 0.35), 0 1px 4px rgb(0 0 0 / 0.25)';

// The app is shown in a window as narrow as it goes while both sides still
// show (it goes single-pane below 800px), so everything is large in the image.
// Large text, and the paged preview, so the proof reads as a page.
const WINDOW_WIDTH = 840;
const SETTINGS = { theme: 'light', textSize: 'large', preview: 'paged' };

// The cover is 3:2 with an even border two thirds of the bar's height (as it
// appears in the image) all round, so the window is a little wider than 3:2.
const COVER = { width: 1200, height: 800, scale: 2 };
const borderShare = ((2 / 3) * barHeight) / WINDOW_WIDTH; // border per px of window width
const BORDER = (COVER.width * borderShare) / (1 + 2 * borderShare);
const WINDOW = {
  width: WINDOW_WIDTH,
  height: Math.round(((COVER.height - 2 * BORDER) * WINDOW_WIDTH) / (COVER.width - 2 * BORDER)),
};
const coverPaths = [resolve(ROOT, '.github/cover.jpg')];
if (cover) coverPaths.push(resolve(process.env.INIT_CWD ?? '.', cover));

// The social card: the same window, centred, MARGIN from the top and bottom.
const SOCIAL = { width: 1200, height: 630, scale: 1 };
const MARGIN = 45;

let editorPadding; // measured once, by paddingBetweenParagraphs()

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
  console.log(`Window ${WINDOW.width}×${WINDOW.height}, cover border ${BORDER.toFixed(1)}px, stage ${STAGE} from the wordmark's ${wordmark}`);

  const coverWidth = COVER.width - 2 * BORDER;
  for (const path of coverPaths) {
    await mkdir(dirname(path), { recursive: true });
    await stage(COVER, coverWidth, path);
  }

  const socialHeight = SOCIAL.height - 2 * MARGIN;
  await stage(SOCIAL, (socialHeight * WINDOW.width) / WINDOW.height, resolve(ROOT, 'public/og.png'));
} finally {
  await browser?.close();
  await new Promise((done) => server.httpServer.close(done));
}

// Opens the app in the window at the given pixel density, with any extra CSS
// in place from the first paint.
async function open(density, extraCss = '') {
  const page = await browser.newPage({ viewport: WINDOW, deviceScaleFactor: density, locale: 'en-GB' });
  await page.addInitScript(([settings, css]) => {
    localStorage.clear();
    localStorage.setItem('carver-settings', JSON.stringify(settings));
    if (css) {
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.append(style);
      });
    }
  }, [SETTINGS, extraCss]);
  const res = await page.goto(url, { waitUntil: 'networkidle' });
  if (!res.ok()) throw new Error(`${url}: HTTP ${res.status()}`);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

// The markdown's top padding that puts the window's bottom edge in a gap
// rather than through a paragraph: the least change that pushes the paragraph
// it would cut out of view, or pulls it fully into view. Measured once, then
// applied from the first paint, so CodeMirror lays out with it.
async function paddingBetweenParagraphs() {
  if (editorPadding !== undefined) return editorPadding;
  const page = await open(1);
  editorPadding = await page.evaluate(() => {
    const scroller = document.querySelector('.cm-scroller');
    const edge = scroller.getBoundingClientRect().bottom;
    const current = parseFloat(getComputedStyle(scroller).paddingTop);
    const cut = [...document.querySelectorAll('.cm-line')].find((line) => {
      const box = line.getBoundingClientRect();
      return line.textContent.trim() && box.top < edge && box.bottom > edge;
    });
    if (!cut) return current;
    const box = cut.getBoundingClientRect();
    const gap = 4;
    const push = edge - box.top + gap; // move it down, out of view
    const pull = box.bottom - edge + gap; // move it up, into view
    return pull < push && current - pull >= 16 ? current - pull : current + push;
  });
  await page.close();
  return editorPadding;
}

// Screenshots the app in the window at the given pixel density.
async function capture(density) {
  const padding = await paddingBetweenParagraphs();
  const page = await open(density, `.cm-scroller { padding-top: ${padding}px !important; }`);
  const shot = await page.screenshot();
  await page.close();
  return shot;
}

// Draws the window, `width` px wide, centred on the stage in a `frame`, and
// writes it as the file type its path names. The window is captured at the
// density it is shown at, so its text is rasterised at its final size.
async function stage(frame, width, path) {
  const height = (width * WINDOW.height) / WINDOW.width;
  const shot = await capture((width * frame.scale) / WINDOW.width);
  const page = await browser.newPage({ viewport: { width: frame.width, height: frame.height }, deviceScaleFactor: frame.scale });
  await page.setContent(`
    <style>
      body { margin: 0; width: ${frame.width}px; height: ${frame.height}px; display: grid; place-items: center; background: ${STAGE}; }
      img { display: block; width: ${width}px; height: ${height}px; border-radius: ${RADIUS}px; box-shadow: ${SHADOW}; }
    </style>
    <img src="data:image/png;base64,${shot.toString('base64')}" alt="">`);
  await page.evaluate(() => document.images[0].decode());
  await page.screenshot({ path, ...(path.endsWith('.jpg') ? { type: 'jpeg', quality: 90 } : {}) });
  await page.close();
  console.log(`Wrote ${path} (${frame.width * frame.scale}×${frame.height * frame.scale})`);
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
