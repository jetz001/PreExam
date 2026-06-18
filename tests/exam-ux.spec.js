import { test, expect } from '@playwright/test';

test.describe('PreExamV2 UX/UI Testing', () => {
  test('Home page should have correct title and load basic UI', async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/');

    // Check if the title matches what we set in layout.js
    await expect(page).toHaveTitle(/PreExam!/);

    // Take a screenshot of the homepage for Visual QA
    await page.screenshot({ path: 'tests/screenshots/homepage-ux.png', fullPage: true });
  });

  test('Navbar should contain the dartboard logo', async ({ page }) => {
    await page.goto('/');

    // Check if the dartboard emoji exists in the document
    const dartboard = page.locator('text="🎯"');
    await expect(dartboard).toBeVisible();
  });

  test('Exam taking page should load font-size button and choices', async ({ page }) => {
    // Navigate to quick exam
    await page.goto('/exam?quick=true');

    // Check if the font-size button exists (using title attribute)
    const fontButton = page.locator('button[title="ปรับขนาดตัวอักษร"]');
    await expect(fontButton).toBeVisible();

    // Check if the 4 choice buttons are rendered
    // The grid has grid-cols-1 md:grid-cols-2 classes and contains exactly 4 buttons
    const choices = page.locator('.grid.grid-cols-1.md\\:grid-cols-2 button');
    await expect(choices).toHaveCount(4);
    
    // Take a screenshot of the exam page for Visual QA
    await page.screenshot({ path: 'tests/screenshots/exam-taking-ux.png', fullPage: true });
  });
});
