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
 * CodeMirror intercepts native DOM events, so we use Ctrl+A to select
 * everything and then type the replacement text.
 */
async function setEditorContent(page, text) {
  const editor = page.locator('.cm-content');
  await editor.click();
  await page.keyboard.press('Control+a');
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

  test('typing a paragraph updates the preview in real-time', async ({ page }) => {
    await openApp(page);

    await setEditorContent(page, 'Just a paragraph.');

    // markdown-it wraps plain text in <p> tags
    await expect(page.locator('#preview p')).toContainText('Just a paragraph.');

    await page.evaluate(() => localStorage.clear());
  });
});

// ---------------------------------------------------------------------------
// Suite 2 – Settings persistence across reload
// ---------------------------------------------------------------------------

test.describe('Settings persistence', () => {
  test('tint setting persists across a page reload', async ({ page }) => {
    await openApp(page);

    // Open the settings modal
    await page.click('#settings-btn');
    await expect(page.locator('#settings-modal')).not.toBeHidden();

    // Change tint from the default ('cool') to 'warm'
    await page.selectOption('#setting-tint', 'warm');

    // Close the modal and reload the page
    await page.keyboard.press('Escape');
    await page.reload();
    await page.waitForSelector('.cm-content');

    // After reload the select should still reflect 'warm'
    await expect(page.locator('#setting-tint')).toHaveValue('warm');

    // Clean up persisted settings
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
    await page.selectOption('#setting-text-size', 'large');
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
// Suite 4 – Mobile / focus-bar behaviour (600 px wide viewport)
// ---------------------------------------------------------------------------

test.describe('Mobile viewport (600 px)', () => {
  // Apply a narrow viewport for every test in this describe block
  test.use({ viewport: { width: 600, height: 800 } });

  test('#focus-bar is visible at 600 px wide', async ({ page }) => {
    await openApp(page);

    // The focus bar should be rendered and not hidden at narrow widths
    await expect(page.locator('#focus-bar')).toBeVisible();
  });

  test('clicking #focus-toggle shows the preview pane and hides the editor pane', async ({ page }) => {
    await openApp(page);

    // The app starts in 'editor' focus view on mobile
    await page.click('#focus-toggle');

    // After toggling, the preview pane should become visible …
    await expect(page.locator('#preview-pane')).toBeVisible();

    // … and the editor pane should be hidden
    await expect(page.locator('#editor-pane')).toBeHidden();
  });

  test('clicking #label-preview shows the preview pane', async ({ page }) => {
    await openApp(page);

    await page.click('#label-preview');

    // The preview pane should now be in view
    await expect(page.locator('#preview-pane')).toBeVisible();

    // The editor pane should no longer be visible
    await expect(page.locator('#editor-pane')).toBeHidden();
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
