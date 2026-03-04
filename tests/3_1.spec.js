// @ts-check
import { test, expect } from '@playwright/test';

test('progress bar synchronization and reset', async ({ page }) => {
  await page.goto('https://demoqa.com/');

  await page.locator('.card').filter({ hasText: 'Widgets' }).click();
  await page.getByText('Progress Bar', { exact: true }).click();

  const progressBar = page.locator('#progressBar .progress-bar');
  const startStopButton = page.getByRole('button', { name: 'Start' });

  await expect(progressBar).toHaveAttribute('aria-valuenow', '0');

  await startStopButton.click();

  await expect
    .poll(async () => Number(await progressBar.getAttribute('aria-valuenow')))
    .toBeGreaterThan(10);

  await page.getByRole('button', { name: 'Stop' }).click();
  await page.waitForTimeout(2000);


  const stoppedValue = Number(await progressBar.getAttribute('aria-valuenow'));
  await expect.poll(async () => Number(await progressBar.getAttribute('aria-valuenow'))).toBe(stoppedValue);

  await startStopButton.click();
  await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible({ timeout: 15000 });
  await expect(progressBar).toHaveAttribute('aria-valuenow', '100');

  const resetButton = page.getByRole('button', { name: 'Reset' });
  await resetButton.click();

  await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
});
