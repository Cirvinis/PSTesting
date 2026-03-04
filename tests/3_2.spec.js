// @ts-check
import { test, expect } from '@playwright/test';

test('dynamic properties delayed state changes', async ({ page }) => {
	await page.goto('https://demoqa.com/');

	await page.locator('.card').filter({ hasText: 'Elements' }).click();
	await page.getByText('Dynamic Properties', { exact: true }).click();

	const enableAfterButton = page.getByRole('button', { name: 'Will enable 5 seconds' });
	const colorChangeButton = page.getByRole('button', { name: 'Color Change' });
	const visibleAfterButton = page.getByRole('button', { name: 'Visible After 5 Seconds' });

	await expect(enableAfterButton).toBeDisabled();
	await expect(visibleAfterButton).toBeHidden({ timeout: 1000 });

	const initialClass = (await colorChangeButton.getAttribute('class')) ?? '';

	await expect(enableAfterButton).toBeEnabled({ timeout: 10000 });
	await expect(visibleAfterButton).toBeVisible({ timeout: 10000 });

	await expect
		.poll(async () => (await colorChangeButton.getAttribute('class')) ?? '')
		.not.toBe(initialClass);
});

