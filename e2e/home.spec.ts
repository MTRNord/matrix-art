import { test, expect } from '@playwright/test';

test.use({
  storageState: 'e2e/auth.json'
});

test('test navigation to details', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));

  // Go to http://localhost:3000/
  await page.goto('http://localhost:3000/');
  // Check for the Home text
  await expect(page.locator('h1')).toContainText('Home');
  // Click text=Flowers@mtrnord:art.midnightthoughts.space
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:3000/post/%24ugLG5srr5AyYCIhL1CnD6KikH8QYsDVMUHQ9jQRn990' }*/),
    page.click('text=FlowersMTRNord @ Art')
  ]);

  await page.locator('a:text("Matrix Art")').waitFor();
  await page.click('a:text("Matrix Art")');
  await expect(page).toHaveURL('http://localhost:3000/');
});