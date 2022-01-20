import { test, expect } from '@playwright/test';

test.use({
  storageState: 'e2e/auth.json'
});

test('test navigation to details', async ({ page }, testInfo) => {
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


  await expect(page).toHaveURL('http://localhost:3000/post/%24xoIMe7tUMb2NhCBZaxsZr2CVkptCVu1GaJ_eJMKbJQo');

  // Dont run this on mobile as the button does only exist on desktop browsers
  if (!testInfo.project.name.includes("Mobile")) {
    // Click img[alt="Flowers"]
    await page.click('img[alt="Flowers"]');
    // Click [aria-label="Close gallery"]
    await page.click('[aria-label="Close gallery"]');
    await expect(page).toHaveURL('http://localhost:3000/post/%24xoIMe7tUMb2NhCBZaxsZr2CVkptCVu1GaJ_eJMKbJQo');
  }


  // Click svg
  await Promise.all([
    page.waitForNavigation(/*{ url: 'http://localhost:3000/' }*/),
    page.click('#matrix-art-logo')
  ]);
  await expect(page).toHaveURL('http://localhost:3000/');
});