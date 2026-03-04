// @ts-check
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'test-data', 'task4_1-data.json');
const testData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const login = async (page, user) => {
  await page.goto(`${testData.baseUrl}login`);
  await page.getByLabel('Email:').fill(user.email);
  await page.getByLabel('Password:').fill(user.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
};

const registerIfNeeded = async (page, user) => {
  await page.goto(`${testData.baseUrl}register`);
  await page.getByLabel('First name:').fill(user.firstName);
  await page.getByLabel('Last name:').fill(user.lastName);
  await page.getByLabel('Email:').fill(user.email);
  await page.getByLabel('Password:', { exact: true }).fill(user.password);
  await page.getByLabel('Confirm password:').fill(user.password);
  await page.getByRole('button', { name: 'Register' }).click();

  const alreadyExists = page.getByText('The specified email already exists');
  if (await alreadyExists.isVisible()) {
    await login(page, user);
    return;
  }

  await expect(page.getByText('Your registration completed')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('link', { name: 'Log out' })).toBeVisible();
};

const ensureCartEmpty = async (page) => {
  await page.goto(`${testData.baseUrl}cart`);
  const cartRows = page.locator('tr.cart-item-row');
  const rowCount = await cartRows.count();

  if (rowCount > 0) {
    for (let index = 0; index < rowCount; index += 1) {
      await cartRows.nth(index).locator('input[name^="removefromcart"]').check();
    }
    await page.getByRole('button', { name: 'Update shopping cart' }).click();
  }

  await expect(page.getByText('Your Shopping Cart is empty!')).toBeVisible();
};

const logoutIfLoggedIn = async (page) => {
  const logoutLink = page.getByRole('link', { name: 'Log out' });
  if (await logoutLink.isVisible()) {
    await logoutLink.click();
  }
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
};

test('task 4.1 data-driven workflow with preconditions and postconditions', async ({ page }) => {
  const { user, searchTerms } = testData;

  await test.step('Preconditions: user is registered/logged in and cart is empty', async () => {
    await registerIfNeeded(page, user);
    await ensureCartEmpty(page);
  });

  await test.step('Execute test with external search terms', async () => {
    for (const term of searchTerms) {
      await page.goto(testData.baseUrl);
      await page.getByRole('textbox', { name: 'Search store' }).fill(term);
      await page.getByRole('button', { name: 'Search' }).click();

      const firstResult = page.locator('.search-results .item-box').first();
      await expect(firstResult).toBeVisible();

      await firstResult.locator('input[value="Add to cart"]').click();
      await expect(page.locator('#bar-notification')).toContainText('added to your shopping cart');
    }
  });

  await test.step('Verify cart has at least two items', async () => {
    const headerLinks = page.locator('.header-links');
    await headerLinks.getByRole('link', { name: /^Shopping cart(?:\s*\(\d+\))?$/i }).click();

    const cartRows = page.locator('tr.cart-item-row');
    await expect(cartRows).toHaveCount(searchTerms.length);
  });

  await test.step('Postconditions: clean cart and log out', async () => {
    await ensureCartEmpty(page);
    await page.goto(testData.baseUrl);
    await logoutIfLoggedIn(page);
  });
});
