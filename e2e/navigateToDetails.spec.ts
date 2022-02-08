import { test, expect } from '@playwright/test';

test.use({
  locale: 'en'
});

test('test navigation to details', async ({ page, baseURL }) => {
  page.on('console', msg => console.log(msg.text()));
  // Go to http://localhost:3000/
  await Promise.all([
    await page.waitForLoadState("networkidle"),
    await page.goto(baseURL || 'http://localhost:3000/'),
  ]);
  // Check for the Home text
  await expect(page.locator('h1')).toContainText('Home');
  // Click text=Flowers@mtrnord:art.midnightthoughts.space
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:3000/post/%24ugLG5srr5AyYCIhL1CnD6KikH8QYsDVMUHQ9jQRn990' }*/),
    page.click('text=Test')
  ]);


  await expect(page).toHaveURL(`${baseURL || "http://localhost:3000"}/post/%24QtbB-3JYAEOXJeC-mrZqFIEqon4uBLYVwTSw2SDWrJg`);


  // Click svg
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:3000/' }*/),
    page.click('#matrix-art-logo')
  ]);
  await expect(page).toHaveURL(baseURL || "http://localhost:3000");
});