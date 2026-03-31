import { test, expect } from '@playwright/test';

test('app launches', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/LinkLens/);
});

test('open folder button is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Open Folder')).toBeVisible();
});

test('graph area shows placeholder when no folder is open', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Open a folder to visualize dependencies')).toBeVisible();
});
