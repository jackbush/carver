// @ts-check
import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Navigate to the app root and wait for CodeMirror to be ready.
 * Using `goto('/')` relies on baseURL = 'http://localhost:5173/carver/'.
 */
async function openApp(page) {
  await page.goto('/');
  // Wait for the CodeMirror contenteditable to be present and focusable
  await page.waitForSelector('.cm-content');
}

/**
 * Replace all content in the CodeMirror editor with `text`.
 * CodeMirror intercepts native DOM events, so we use Ctrl/Cmd+A to select
 * everything and then type the replacement text.
 */
async function setEditorContent(page, text) {
  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.type(text);
}

// ---------------------------------------------------------------------------
// Suite 1 – Editor → Preview rendering
// ---------------------------------------------------------------------------

test.describe('Editor → Preview rendering', () => {
  test('typing a heading in the editor renders an <h1> in the preview', async ({ page }) => {
    await openApp(page);

    // Replace whatever demo content is shown with a single heading
    await setEditorContent(page, '# Hello Carver');

    // The markdown renderer should produce an <h1> containing our text
    await expect(page.locator('#preview h1')).toHaveText('Hello Carver');

    // Clean up so other tests are not affected
    await page.evaluate(() => localStorage.clear());
  });

  test('==text== is highlighted on the proof and in the typescript', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('carver-content', 'This is ==Carver==.'));
    await openApp(page);

    await expect(page.locator('#preview mark')).toHaveText('Carver');
    await expect(page.locator('.cm-highlight')).toHaveCount(1);

    await page.evaluate(() => localStorage.clear());
  });

  test('typing a paragraph updates the preview in real-time', async ({ page }) => {
    await openApp(page);

    await setEditorContent(page, 'Just a paragraph.');

    // markdown-it wraps plain text in <p> tags
    await expect(page.locator('#preview .sheet-body')).toContainText('Just a paragraph.');

    await page.evaluate(() => localStorage.clear());
  });
});

// ---------------------------------------------------------------------------
// Suite 2 – Settings persistence across reload
// ---------------------------------------------------------------------------

test.describe('Settings persistence', () => {
  test('preview setting persists across a page reload', async ({ page }) => {
    await openApp(page);

    await page.click('#settings-btn');
    await expect(page.locator('#settings-modal')).not.toBeHidden();

    // Switch from the default continuous sheet to pages
    await page.check('input[name="preview"][value="paged"]');

    await page.keyboard.press('Escape');
    await page.reload();
    await page.waitForSelector('.cm-content');

    await expect(page.locator('input[name="preview"][value="paged"]')).toBeChecked();
    await expect(page.locator('.sheet--paged').first()).toBeVisible();

    await page.evaluate(() => localStorage.clear());
  });

  test('document content persists across a page reload', async ({ page }) => {
    await openApp(page);

    const uniqueText = 'Persistence test — carver e2e';
    await setEditorContent(page, uniqueText);

    // Wait for the debounced save (300 ms) to flush before reloading
    await page.waitForTimeout(500);
    await page.reload();
    await page.waitForSelector('.cm-content');

    // The preview should contain the text we typed before the reload
    await expect(page.locator('#preview')).toContainText(uniqueText);

    await page.evaluate(() => localStorage.clear());
  });
});

// ---------------------------------------------------------------------------
// Suite 3 – Text size CSS custom property
// ---------------------------------------------------------------------------

test.describe('Text size setting', () => {
  test('selecting "large" sets --base-size to 18px on the root element', async ({ page }) => {
    await openApp(page);

    // Open settings and switch text size to 'large'
    await page.click('#settings-btn');
    await page.check('input[name="textSize"][value="large"]');
    await page.keyboard.press('Escape');

    // Read the CSS custom property from the document root via getComputedStyle
    const baseSize = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--base-size').trim()
    );

    expect(baseSize).toBe('18px');

    await page.evaluate(() => localStorage.clear());
  });
});

// ---------------------------------------------------------------------------
// Suite 4 – Narrow viewport: one side at a time (600 px wide)
// ---------------------------------------------------------------------------

test.describe('Narrow viewport (600 px)', () => {
  test.use({ viewport: { width: 600, height: 800 } });

  test('Write / Proof tabs are visible at 600 px wide', async ({ page }) => {
    await openApp(page);

    await expect(page.locator('#view-tabs')).toBeVisible();
    await expect(page.locator('#tab-write')).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking Proof shows the proof and hides the editor', async ({ page }) => {
    await openApp(page);

    await page.click('#tab-proof');

    await expect(page.locator('#preview-pane')).toBeVisible();
    await expect(page.locator('#editor-pane')).toBeHidden();
    await expect(page.locator('#tab-proof')).toHaveAttribute('aria-selected', 'true');
  });

  test('arrow keys move between the tabs', async ({ page }) => {
    await openApp(page);

    await page.focus('#tab-write');
    await page.keyboard.press('ArrowRight');

    await expect(page.locator('#tab-proof')).toBeFocused();
    await expect(page.locator('#preview-pane')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Suite 4b – Paged proofs
// ---------------------------------------------------------------------------

const sentence = 'He sat at the kitchen table with the light off and listened to the rain. ';
const longDocument = Array.from({ length: 30 }, (_, i) => `${i + 1}. ${sentence.repeat(3)}`).join('\n\n');

async function openPaged(page, content) {
  await page.addInitScript((text) => {
    localStorage.setItem('carver-settings', JSON.stringify({ preview: 'paged' }));
    localStorage.setItem('carver-content', text);
  }, content);
  await openApp(page);
  await expect.poll(() => page.locator('.sheet--paged').count()).toBeGreaterThan(1);
}

const pageStarts = (page) => page.evaluate(() =>
  [...document.querySelectorAll('.sheet--paged .sheet-body')].map((b) => b.textContent.trim().slice(0, 40)));

test.describe('Paged proofs', () => {
  test('a long document splits across numbered pages without losing words', async ({ page }) => {
    await openPaged(page, longDocument);

    await expect(page.locator('.sheet--paged .folio').nth(1)).toHaveText('2');

    const words = await page.evaluate(() =>
      [...document.querySelectorAll('.sheet-body')].map((b) => b.textContent).join(' ').split(/\s+/).filter(Boolean).length);
    expect(words).toBe(30 * 3 * 15);

    await page.evaluate(() => localStorage.clear());
  });

  test('pages break in the same places at every window width', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await openPaged(page, longDocument);
    const narrow = await pageStarts(page);

    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.waitForTimeout(300);
    expect(await pageStarts(page)).toEqual(narrow);

    await page.reload();
    await expect.poll(() => page.locator('.sheet--paged').count()).toBeGreaterThan(1);
    expect(await pageStarts(page)).toEqual(narrow);

    await page.evaluate(() => localStorage.clear());
  });
});

// ---------------------------------------------------------------------------
// Suite 4c – Scrolling both sides together
// ---------------------------------------------------------------------------

test.describe('Scroll matching', () => {
  test('the proof follows the typescript down and back up', async ({ page }) => {
    await openPaged(page, longDocument);

    const proofLine = () => page.evaluate(() => {
      const preview = document.getElementById('preview');
      const mark = preview.getBoundingClientRect().top + preview.clientHeight * 0.25;
      const blocks = [...preview.querySelectorAll('[data-line]:not(.cont)')];
      const above = blocks.filter((el) => el.getBoundingClientRect().top <= mark);
      return Number((above.at(-1) ?? blocks[0]).dataset.line);
    });
    const scrollEditorTo = (fraction) => page.evaluate((f) => {
      const scroller = document.querySelector('.cm-scroller');
      scroller.scrollTop = f * (scroller.scrollHeight - scroller.clientHeight);
    }, fraction);

    await scrollEditorTo(0.6);
    await page.waitForTimeout(200);
    const down = await proofLine();
    expect(down).toBeGreaterThan(10);

    await scrollEditorTo(0.3);
    await page.waitForTimeout(200);
    const up = await proofLine();
    expect(up).toBeLessThan(down);
    expect(up).toBeGreaterThan(0);

    await page.evaluate(() => localStorage.clear());
  });
});

// ---------------------------------------------------------------------------
// Suite 4d – Selecting text in the typescript
// ---------------------------------------------------------------------------

test.describe('Typescript selection', () => {
  const wrapped = 'He sat at the kitchen table with the light off and listened to the refrigerator. '.repeat(4);

  test('dragging across a wrapped paragraph draws the highlight on every line it covers', async ({ page }) => {
    await page.addInitScript((text) => localStorage.setItem('carver-content', text), `# Title\n\n${wrapped}`);
    await openApp(page);

    const line = page.locator('.cm-line').nth(2);
    const box = await line.boundingBox();
    await page.mouse.move(box.x + 100, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + 200, box.y + box.height - 10, { steps: 8 });
    await page.mouse.up();

    // The drawn pieces must reach from the first visual line to the last.
    await expect.poll(() => page.locator('.cm-selectionBackground').count()).toBeGreaterThan(1);
    const span = await page.evaluate(() => {
      const rects = [...document.querySelectorAll('.cm-selectionBackground')].map((el) => el.getBoundingClientRect());
      return Math.max(...rects.map((r) => r.bottom)) - Math.min(...rects.map((r) => r.top));
    });
    expect(span).toBeGreaterThan(box.height - 30);

    await page.evaluate(() => localStorage.clear());
  });

  test('an unclosed code block visibly runs on to the end of the typescript', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('carver-content', 'Before\n\n```what matters\nin```\n\nAfter'));
    await openApp(page);

    const ground = await page.locator('.cm-codeBlock').boundingBox();
    const last = await page.locator('.cm-line').last().boundingBox();
    expect(ground.y + ground.height).toBeGreaterThanOrEqual(last.y + last.height - 1);

    await page.evaluate(() => localStorage.clear());
  });

  test('the caret is the same height on an empty line and beside text', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('carver-content', 'Some text\n\nMore text'));
    await openApp(page);

    const caretHeight = () => page.evaluate(() => document.querySelector('.cm-cursor').getBoundingClientRect().height);
    await page.locator('.cm-line').first().click();
    const beside = await caretHeight();
    await page.keyboard.press('ArrowDown');
    const empty = await caretHeight();
    expect(Math.abs(beside - empty)).toBeLessThan(1);

    await page.evaluate(() => localStorage.clear());
  });
});

// ---------------------------------------------------------------------------
// Suite 5 – Settings modal accessibility & keyboard interaction
// ---------------------------------------------------------------------------

test.describe('Settings modal', () => {
  test('#settings-modal has aria-modal="true"', async ({ page }) => {
    await openApp(page);

    // The attribute should be present regardless of the modal's open/closed state
    await expect(page.locator('#settings-modal')).toHaveAttribute('aria-modal', 'true');
  });

  test('Print closes an open panel, and the page has painted without it before printing', async ({ page }) => {
    // print() blocks rendering, so record whether the panel was still showing when it ran.
    await page.addInitScript(() => {
      window.print = () => { window.__panelShownAtPrint = !document.getElementById('settings-modal').hidden; };
    });
    await openApp(page);

    await page.click('#settings-btn');
    await expect(page.locator('#settings-modal')).not.toBeHidden();
    await page.click('#print-btn');
    await expect.poll(() => page.evaluate(() => window.__panelShownAtPrint)).toBe(false);
  });

  test('modal is hidden by default and pressing Escape closes it', async ({ page }) => {
    await openApp(page);

    // The modal starts hidden
    await expect(page.locator('#settings-modal')).toBeHidden();

    // Open the modal via the settings button
    await page.click('#settings-btn');
    await expect(page.locator('#settings-modal')).not.toBeHidden();

    // Pressing Escape while focus is inside the modal should close it
    await page.keyboard.press('Escape');
    await expect(page.locator('#settings-modal')).toBeHidden();
  });
});
