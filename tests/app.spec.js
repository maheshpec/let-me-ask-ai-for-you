// @ts-check
import { test, expect } from '@playwright/test';

// ─── Home view ─────────────────────────────────────────────────────────────

test.describe('Home view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads and shows the home view', async ({ page }) => {
    await expect(page).toHaveTitle(/let me ask ai for you/i);
    await expect(page.locator('#home-view')).toBeVisible();
    await expect(page.locator('#playback-view')).toBeHidden();
  });

  test('generate button is disabled when input is empty', async ({ page }) => {
    await expect(page.locator('#generate-btn')).toBeDisabled();
  });

  test('generate button becomes enabled when query is typed', async ({ page }) => {
    await page.locator('#query-input').fill('how do I center a div?');
    await expect(page.locator('#generate-btn')).toBeEnabled();
  });

  test('generates a shareable link', async ({ page }) => {
    await page.locator('#query-input').fill('what is the capital of France?');
    await page.locator('#generate-btn').click();
    await expect(page.locator('#result-panel')).toBeVisible();
    const url = await page.locator('#result-url').textContent();
    expect(url).toBeTruthy();
    expect(url).toContain('q=');
  });

  test('copy button copies the link', async ({ page, browserName }) => {
    // Grant clipboard permissions in Chromium
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.locator('#query-input').fill('copy test');
    await page.locator('#generate-btn').click();
    await page.locator('#copy-btn').click();
    // Check visual feedback: copy label changes to "Copied!"
    await expect(page.locator('#copy-label')).toHaveText('Copied!');
    // Verify clipboard contents match the displayed URL
    const displayedUrl = await page.locator('#result-url').textContent();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard.trim()).toBe(displayedUrl?.trim());
  });
});

// ─── Playback view ─────────────────────────────────────────────────────────

test.describe('Playback view (shared link)', () => {
  const QUERY = 'why is the sky blue';

  test.beforeEach(async ({ page }) => {
    // Navigate directly with a query param (as a shared link would)
    await page.goto(`/?q=${encodeURIComponent(QUERY)}`);
  });

  test('shows the playback view for a shared link', async ({ page }) => {
    await expect(page.locator('#playback-view')).toBeVisible();
    await expect(page.locator('#home-view')).toBeHidden();
  });

  test('types the query into the fake ChatGPT input', async ({ page }) => {
    // The typing animation should eventually render the full query
    const typedText = page.locator('#typed-text');
    await expect(typedText).toHaveText(QUERY, { timeout: 8000 });
  });

  test('send button becomes enabled after typing completes', async ({ page }) => {
    await expect(page.locator('#fake-send-btn')).toBeEnabled({ timeout: 12000 });
  });
});

// ─── Snark overlay ─────────────────────────────────────────────────────────

test.describe('Snark overlay', () => {
  const QUERY = 'how do I exit vim';

  test.beforeEach(async ({ page }) => {
    // Allow clipboard so the overlay can write to it
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(`/?q=${encodeURIComponent(QUERY)}`);
    // Wait for typing + send to complete and overlay to appear
    await expect(page.locator('#snark-overlay')).toBeVisible({ timeout: 12000 });
  });

  test('overlay shows after playback completes', async ({ page }) => {
    await expect(page.locator('#snark-overlay')).toBeVisible();
  });

  test('overlay displays the original query in the hint box', async ({ page }) => {
    const preview = page.locator('#snark-query-preview');
    await expect(preview).toHaveText(QUERY);
  });

  test('progress bar animates toward 100%', async ({ page }) => {
    const bar = page.locator('#snark-progress-bar');
    // Read width at two different moments — it should be increasing
    const getWidth = () =>
      bar.evaluate((el) => parseFloat(el.style.width ?? '0'));
    const w1 = await getWidth();
    await page.waitForTimeout(300);
    const w2 = await getWidth();
    expect(w2).toBeGreaterThan(w1);
  });

  test('"Open ChatGPT" button opens chatgpt.com in a new tab', async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#go-now-btn').click(),
    ]);
    await expect(newPage).toHaveURL(/chatgpt\.com/);
    await newPage.close();
  });
});
