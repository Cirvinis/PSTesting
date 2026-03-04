// @ts-check
import { test, expect } from '@playwright/test';

test('web tables pagination returns to first page after delete on second page', async ({ page }) => {
	await page.goto('https://demoqa.com/');

	await page.getByRole('heading', { name: 'Elements' }).click();
	await page.getByText('Web Tables', { exact: true }).click();

	const addRecord = async (/** @type {number} */ index) => {
		await page.getByRole('button', { name: 'Add' }).click();
		await page.getByPlaceholder('First Name').fill(`Auto${index}`);
		await page.getByPlaceholder('Last Name').fill('User');
		await page.getByPlaceholder('name@example.com').fill(`auto${Date.now()}_${index}@example.com`);
		await page.getByPlaceholder('Age').fill('30');
		await page.getByPlaceholder('Salary').fill('5000');
		await page.getByPlaceholder('Department').fill('QA');
		await page.getByRole('button', { name: 'Submit' }).click();
	};

	for (let i = 1; i <= 8; i += 1) {
		await addRecord(i);
	}

	const pageInfo = page.locator('strong').filter({ hasText: /^\d+ of \d+$/ }).first();
	await expect(pageInfo).toHaveText('1 of 2');

	await page.getByRole('button', { name: 'Next' }).click();
	await expect(pageInfo).toHaveText('2 of 2');

	// Use dispatchEvent to bypass ad iframe overlay that blocks pointer events in CI
	await page.locator('span[title="Delete"]').first().dispatchEvent('click');

	await expect(pageInfo).toHaveText('1 of 1', { timeout: 10000 });
	await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
});
