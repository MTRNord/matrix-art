import { test, expect } from '@playwright/test';

test.use({
    locale: 'en'
});

test('test if we have english words', async ({ page, baseURL }) => {
    page.on('console', msg => console.log(msg.text()));
    // Go to http://localhost:3000/
    await page.goto(baseURL || 'http://localhost:3000/');

    expect(await page.locator("text=Home").isVisible());
});

test('test if the header is there and english with correct state', async ({ page, baseURL }) => {
    page.on('console', msg => console.log(msg.text()));
    // Go to http://localhost:3000/
    await page.goto(baseURL || 'http://localhost:3000/');

    // Make sure that we have the Hader
    expect(await page.locator('header').isVisible()).toBeTruthy();

    // Make sure unauthenticated state is correct
    expect(await page.locator('header > div > nav > span > a:has-text("Join")').isVisible()).toBeTruthy();
    expect(await page.locator('header > div > nav > span > a:has-text("Log in")').isVisible()).toBeTruthy();
    expect(await page.locator('header > div > nav > span > a:has-text("Log in")')).toHaveAttribute("href", "/login");

    // Make sure unauthenticated state is correct and not bleeding
    expect(await page.locator('header > div > div > a:has-text("Submit")').isVisible()).toBeFalsy();
    expect(await page.locator('header > div > div > a:has-text("Setup Account")').isVisible()).toBeFalsy();
});