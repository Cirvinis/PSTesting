// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://demowebshop.tricentis.com/';
const MIN_PRICE = 900;

const parsePrice = (/** @type {string} */ value) => Number(value.replace(/[^0-9.]/g, ''));

test('dynamic price selection without filtering', async ({ page }) => {
  await page.goto(BASE_URL);
  // await page.pause();

  await expect(page).toHaveTitle(/Demo Web Shop/i);
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();


  await page.locator('ul.top-menu').getByRole('link', { name: 'Computers' }).click();
  // await page.pause();

  await page.locator('div.sub-category-item a').filter({ hasText: 'Desktops' }).click();
  // await page.pause();
  await expect(page.getByRole('heading', { name: 'Desktops' })).toBeVisible();

  const productItems = page.locator('.product-item');
  const productCount = await productItems.count();

  const selected = [];
  for (let i = 0; i < productCount && selected.length < 2; i += 1) {
    const item = productItems.nth(i);
    const priceText = await item.locator('.prices .actual-price').innerText();
    const priceValue = parsePrice(priceText);
    if (Number.isNaN(priceValue) || priceValue <= MIN_PRICE) {
      continue;
    }

    const name = await item.locator('.product-title a').innerText();
    await item.locator('.product-title a').click();
    // await page.pause();

    await expect(page.getByRole('heading', { name })).toBeVisible();
    await expect(page.locator('.product-price')).toContainText(priceText);

    const hddOption = page.getByRole('radio', { name: /320 GB/i });
    if (await hddOption.isVisible()) {
      await hddOption.check();
      // await page.pause();
    }

    await page.locator('#product-details-form input.add-to-cart-button').click();
    // await page.pause();
    await expect(page.locator('#bar-notification')).toContainText('The product has been added to your shopping cart');

    selected.push({ name, unitPrice: priceValue });

    await page.locator('.breadcrumb').getByRole('link', { name: 'Desktops' }).click();
    // await page.pause();
  }

  expect(selected.length).toBeGreaterThanOrEqual(2);

  const headerLinks = page.locator('.header-links');
  await headerLinks.getByRole('link', { name: /^Shopping cart(?:\s*\(\d+\))?$/i }).click();
  // await page.pause();
  await expect(page).toHaveURL(/\/cart/);

  const cartRows = page.locator('tr.cart-item-row');
  await expect(cartRows).toHaveCount(selected.length);

  const firstRow = cartRows.first();
  const qtyInput = firstRow.locator('input.qty-input');
  await qtyInput.fill('2');
  await page.getByRole('button', { name: 'Update shopping cart' }).click();
  // await page.pause();
  await expect(qtyInput).toHaveValue('2');

  const unitPriceText = await firstRow.locator('.product-unit-price').innerText();
  const subtotalText = await firstRow.locator('.product-subtotal').innerText();
  const unitPrice = parsePrice(unitPriceText);
  const subtotal = parsePrice(subtotalText);
  expect(subtotal).toBeCloseTo(unitPrice * 2, 2);

  const secondRow = cartRows.nth(1);
  await secondRow.locator('input[name^="removefromcart"]').check();
  await page.getByRole('button', { name: 'Update shopping cart' }).click();
  // await page.pause();
  await expect(cartRows).toHaveCount(1);

  const totalRow = page.getByRole('row', { name: /^Total:/i });
  await expect(totalRow).toBeVisible();
  const cartTotalText = await totalRow.locator('strong').innerText();
  const cartTotal = parsePrice(cartTotalText);
  expect(cartTotal).toBeGreaterThan(0);
});
