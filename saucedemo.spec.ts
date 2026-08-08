import { test, expect } from '@playwright/test';

test('Q1 - locked out user login', async ({ page }) => {
  await page.goto('/');

  await page.locator('[data-test="username"]').fill('locked_out_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  const errorMessage = page.locator('[data-test="error"]');

  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toHaveText(
    'Epic sadface: Sorry, this user has been locked out.'
  );
});

test('Q2 - standard user checkout', async ({ page }) => {
  await page.goto('/');

  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  await expect(page).toHaveURL(/inventory/);

  // Reset App State
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('[data-test="reset-sidebar-link"]').click();

  const products = [
    'sauce-labs-backpack',
    'sauce-labs-bike-light',
    'sauce-labs-bolt-t-shirt'
  ];

  const selectedProductNames = [
    'Sauce Labs Backpack',
    'Sauce Labs Bike Light',
    'Sauce Labs Bolt T-Shirt'
  ];

  const selectedPrices: number[] = [];

  for (let i = 0; i < products.length; i++) {
    const product = page.locator('.inventory_item').filter({
      hasText: selectedProductNames[i]
    });

    const priceText = await product.locator('.inventory_item_price').innerText();
    selectedPrices.push(Number(priceText.replace('$', '')));

    await product.locator(
      `[data-test="add-to-cart-${products[i]}"]`
    ).click();
  }

  await expect(page.locator('.shopping_cart_badge')).toHaveText('3');

  await page.locator('.shopping_cart_link').click();

  for (const productName of selectedProductNames) {
    await expect(page.locator('.inventory_item_name', {
      hasText: productName
    })).toBeVisible();
  }

  await page.locator('[data-test="checkout"]').click();

  await page.locator('[data-test="firstName"]').fill('John');
  await page.locator('[data-test="lastName"]').fill('Tester');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();

  await expect(page.locator('.title')).toHaveText('Checkout: Overview');

  for (const productName of selectedProductNames) {
    await expect(page.locator('.inventory_item_name', {
      hasText: productName
    })).toBeVisible();
  }

  const expectedSubtotal = selectedPrices.reduce(
    (sum, price) => sum + price,
    0
  );

  const subtotalText = await page.locator('.summary_subtotal_label').innerText();
  const actualSubtotal = Number(subtotalText.replace('Item total: $', ''));

  expect(actualSubtotal).toBeCloseTo(expectedSubtotal, 2);

  const taxText = await page.locator('.summary_tax_label').innerText();
  const tax = Number(taxText.replace('Tax: $', ''));

  const totalText = await page.locator('.summary_total_label').innerText();
  const actualTotal = Number(totalText.replace('Total: $', ''));

  expect(actualTotal).toBeCloseTo(expectedSubtotal + tax, 2);

  await page.locator('[data-test="finish"]').click();

  await expect(page.locator('[data-test="complete-header"]'))
    .toHaveText('Thank you for your order!');

  await page.locator('[data-test="back-to-products"]').click();

  // Reset App State again
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('[data-test="reset-sidebar-link"]').click();

  // Logout
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('[data-test="logout-sidebar-link"]').click();

  await expect(page.locator('[data-test="login-button"]')).toBeVisible();
});

test('Q3 - performance glitch user checkout', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto('/');

  await page.locator('[data-test="username"]')
    .fill('performance_glitch_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  await expect(page).toHaveURL(/inventory/);

  // Reset App State
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('[data-test="reset-sidebar-link"]').click();

  // Sort Z to A
  await page.locator('[data-test="product-sort-container"]').selectOption('za');

  const productNames = await page.locator('.inventory_item_name').allTextContents();
  const sortedNames = [...productNames].sort((a, b) => b.localeCompare(a));

  expect(productNames).toEqual(sortedNames);

  // Select the first product after sorting
  const firstProduct = page.locator('.inventory_item').first();

  const productName = await firstProduct
    .locator('.inventory_item_name')
    .innerText();

  const productPriceText = await firstProduct
    .locator('.inventory_item_price')
    .innerText();

  const productPrice = Number(productPriceText.replace('$', ''));

  console.log('Selected product:', productName);
  console.log('Selected price:', productPrice);

  await firstProduct.getByRole('button', {
    name: 'Add to cart'
  }).click();

  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

  await page.locator('.shopping_cart_link').click();

  await expect(page.locator('.inventory_item_name'))
    .toHaveText(productName);

  await page.locator('[data-test="checkout"]').click();

  await page.locator('[data-test="firstName"]').fill('John');
  await page.locator('[data-test="lastName"]').fill('Tester');
  await page.locator('[data-test="postalCode"]').fill('12345');
  await page.locator('[data-test="continue"]').click();

  await expect(page.locator('.title')).toHaveText('Checkout: Overview');

  await expect(page.locator('.inventory_item_name'))
    .toHaveText(productName);

  const subtotalText = await page.locator('.summary_subtotal_label').innerText();
  const actualSubtotal = Number(subtotalText.replace('Item total: $', ''));

  expect(actualSubtotal).toBeCloseTo(productPrice, 2);

  const taxText = await page.locator('.summary_tax_label').innerText();
  const tax = Number(taxText.replace('Tax: $', ''));

  const totalText = await page.locator('.summary_total_label').innerText();
  const actualTotal = Number(totalText.replace('Total: $', ''));

  expect(actualTotal).toBeCloseTo(productPrice + tax, 2);

  await page.locator('[data-test="finish"]').click();

  await expect(page.locator('[data-test="complete-header"]'))
    .toHaveText('Thank you for your order!');

  await page.locator('[data-test="back-to-products"]').click();

  // Reset App State again
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('[data-test="reset-sidebar-link"]').click();

  // Logout
  await page.locator('#react-burger-menu-btn').click();
  await page.locator('[data-test="logout-sidebar-link"]').click();

  await expect(page.locator('[data-test="login-button"]')).toBeVisible();
});
