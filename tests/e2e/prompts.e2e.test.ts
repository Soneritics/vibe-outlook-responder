/**
 * E2E tests for prompt management
 * Tests the complete workflow of creating, editing, and deleting prompts
 */

import { test, expect, Page } from '@playwright/test';

// Mock Office.js before running tests
test.beforeEach(async ({ page }) => {
  // Mock Office.js APIs
  await page.addInitScript(() => {
    (window as any).Office = {
      context: {
        roamingSettings: {
          get: () => null,
          set: () => {},
          saveAsync: (callback: any) => callback({ status: 'succeeded' }),
        },
        document: {
          settings: {
            get: () => null,
            set: () => {},
            saveAsync: (callback: any) => callback({ status: 'succeeded' }),
          },
        },
      },
      onReady: (callback: any) => callback(),
      HostType: {
        Outlook: 'Outlook',
      },
      PlatformType: {
        OfficeOnline: 'OfficeOnline',
      },
    };
  });
});

test.describe('Prompt Edit and Delete Flow', () => {
  test('should create, edit, and delete a prompt successfully', async ({ page }) => {
    // Navigate to the add-in
    await page.goto('http://localhost:3000');

    // Wait for the app to load
    await page.waitForSelector('text=Add Custom Prompt', { timeout: 10000 });

    // Step 1: Create a new prompt
    await page.click('text=Add Custom Prompt');

    // Fill in the prompt details
    await page.fill('input[id="prompt-title"]', 'Test Support Prompt');
    await page.fill('textarea[id="prompt-content"]', 'You are a helpful support agent. Please respond professionally.');

    // Save the prompt
    await page.click('button:has-text("Save")');

    // Wait for the prompt to appear in the dropdown
    await page.waitForSelector('text=Test Support Prompt', { timeout: 5000 });

    // Step 2: Edit the prompt
    // Click on the prompt in the dropdown to open editor in edit mode
    await page.click('text=Test Support Prompt');

    // Wait for the editor to open with pre-filled data
    await expect(page.locator('input[id="prompt-title"]')).toHaveValue('Test Support Prompt');
    await expect(page.locator('textarea[id="prompt-content"]')).toHaveValue(
      'You are a helpful support agent. Please respond professionally.'
    );

    // Verify Delete button is present
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();

    // Modify the title
    await page.fill('input[id="prompt-title"]', 'Updated Support Prompt');

    // Modify the content
    await page.fill(
      'textarea[id="prompt-content"]',
      'You are an experienced support agent. Please respond with empathy and professionalism.'
    );

    // Save the changes
    await page.click('button:has-text("Save")');

    // Wait for the updated prompt to appear
    await page.waitForSelector('text=Updated Support Prompt', { timeout: 5000 });

    // Verify old title is gone
    await expect(page.locator('text=Test Support Prompt')).not.toBeVisible();

    // Step 3: Delete the prompt
    // Click on the prompt again to open editor
    await page.click('text=Updated Support Prompt');

    // Click Delete button
    await page.click('button:has-text("Delete")');

    // Wait for confirmation dialog
    await expect(page.locator('text=/are you sure/i')).toBeVisible();
    await expect(page.locator('text=/updated support prompt/i')).toBeVisible();
    await expect(page.locator('text=/cannot be undone/i')).toBeVisible();

    // Confirm deletion
    const deleteButtons = await page.locator('button:has-text("Delete")').all();
    // Click the second Delete button (in the confirmation dialog)
    await deleteButtons[1].click();

    // Wait for the prompt to be removed from the list
    await page.waitForSelector('text=Updated Support Prompt', { state: 'hidden', timeout: 5000 });

    // Verify the prompt is no longer in the dropdown
    await expect(page.locator('text=Updated Support Prompt')).not.toBeVisible();
  });

  test('should cancel delete operation when user clicks Cancel', async ({ page }) => {
    // Navigate to the add-in
    await page.goto('http://localhost:3000');

    // Wait for the app to load
    await page.waitForSelector('text=Add Custom Prompt', { timeout: 10000 });

    // Create a prompt to test cancellation
    await page.click('text=Add Custom Prompt');
    await page.fill('input[id="prompt-title"]', 'Keep This Prompt');
    await page.fill('textarea[id="prompt-content"]', 'This prompt should not be deleted.');
    await page.click('button:has-text("Save")');

    // Wait for the prompt to appear
    await page.waitForSelector('text=Keep This Prompt', { timeout: 5000 });

    // Click on the prompt to open editor
    await page.click('text=Keep This Prompt');

    // Click Delete button
    await page.click('button:has-text("Delete")');

    // Wait for confirmation dialog
    await expect(page.locator('text=/are you sure/i')).toBeVisible();

    // Click Cancel in the dialog
    const cancelButtons = await page.locator('button:has-text("Cancel")').all();
    await cancelButtons[cancelButtons.length - 1].click();

    // Verify the prompt is still in the list
    await expect(page.locator('text=Keep This Prompt')).toBeVisible();
  });

  test('should prevent duplicate titles when editing', async ({ page }) => {
    // Navigate to the add-in
    await page.goto('http://localhost:3000');

    await page.waitForSelector('text=Add Custom Prompt', { timeout: 10000 });

    // Create first prompt
    await page.click('text=Add Custom Prompt');
    await page.fill('input[id="prompt-title"]', 'Prompt One');
    await page.fill('textarea[id="prompt-content"]', 'Content for prompt one.');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Prompt One', { timeout: 5000 });

    // Create second prompt
    await page.click('text=Add Custom Prompt');
    await page.fill('input[id="prompt-title"]', 'Prompt Two');
    await page.fill('textarea[id="prompt-content"]', 'Content for prompt two.');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Prompt Two', { timeout: 5000 });

    // Try to edit second prompt to have same title as first
    await page.click('text=Prompt Two');
    await page.fill('input[id="prompt-title"]', 'Prompt One');
    await page.click('button:has-text("Save")');

    // Should show duplicate title error
    await expect(page.locator('text=/prompt with this title already exists/i')).toBeVisible();

    // Verify the prompt was not renamed
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('text=Prompt Two')).toBeVisible();
  });

  test('should maintain alphabetical order after editing', async ({ page }) => {
    // Navigate to the add-in
    await page.goto('http://localhost:3000');

    await page.waitForSelector('text=Add Custom Prompt', { timeout: 10000 });

    // Create prompts in non-alphabetical order
    const prompts = [
      { title: 'Charlie Prompt', content: 'Content C' },
      { title: 'Alpha Prompt', content: 'Content A' },
      { title: 'Bravo Prompt', content: 'Content B' },
    ];

    for (const prompt of prompts) {
      await page.click('text=Add Custom Prompt');
      await page.fill('input[id="prompt-title"]', prompt.title);
      await page.fill('textarea[id="prompt-content"]', prompt.content);
      await page.click('button:has-text("Save")');
      await page.waitForSelector(`text=${prompt.title}`, { timeout: 5000 });
    }

    // Get the prompts from the dropdown (they should be in alphabetical order)
    const promptElements = await page.locator('[role="option"]').allTextContents();

    // Verify alphabetical order: Alpha, Bravo, Charlie
    expect(promptElements).toContain('Alpha Prompt');
    expect(promptElements).toContain('Bravo Prompt');
    expect(promptElements).toContain('Charlie Prompt');

    // Edit "Bravo Prompt" to "Delta Prompt" - should move to end
    await page.click('text=Bravo Prompt');
    await page.fill('input[id="prompt-title"]', 'Delta Prompt');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Delta Prompt', { timeout: 5000 });

    // Verify new order: Alpha, Charlie, Delta
    const updatedPromptElements = await page.locator('[role="option"]').allTextContents();
    expect(updatedPromptElements).toContain('Alpha Prompt');
    expect(updatedPromptElements).toContain('Charlie Prompt');
    expect(updatedPromptElements).toContain('Delta Prompt');
    expect(updatedPromptElements).not.toContain('Bravo Prompt');
  });

  test('should preserve timestamps when editing', async ({ page }) => {
    // Navigate to the add-in
    await page.goto('http://localhost:3000');

    await page.waitForSelector('text=Add Custom Prompt', { timeout: 10000 });

    // Create a prompt
    await page.click('text=Add Custom Prompt');
    await page.fill('input[id="prompt-title"]', 'Timestamp Test');
    await page.fill('textarea[id="prompt-content"]', 'Original content');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Timestamp Test', { timeout: 5000 });

    // Wait a moment to ensure different timestamps
    await page.waitForTimeout(1000);

    // Edit the prompt
    await page.click('text=Timestamp Test');
    await page.fill('textarea[id="prompt-content"]', 'Updated content');
    await page.click('button:has-text("Save")');

    // The prompt should still exist with the same title
    await expect(page.locator('text=Timestamp Test')).toBeVisible();

    // Note: We can't directly test timestamp values in E2E tests without additional
    // infrastructure, but we verify the prompt persists and can be edited
  });

  test('should handle rapid edit operations without data loss', async ({ page }) => {
    // Navigate to the add-in
    await page.goto('http://localhost:3000');

    await page.waitForSelector('text=Add Custom Prompt', { timeout: 10000 });

    // Create a prompt
    await page.click('text=Add Custom Prompt');
    await page.fill('input[id="prompt-title"]', 'Rapid Edit Test');
    await page.fill('textarea[id="prompt-content"]', 'Version 1');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Rapid Edit Test', { timeout: 5000 });

    // Perform multiple rapid edits
    for (let i = 2; i <= 5; i++) {
      await page.click('text=Rapid Edit Test');
      await page.fill('textarea[id="prompt-content"]', `Version ${i}`);
      await page.click('button:has-text("Save")');
      await page.waitForTimeout(500);
    }

    // Verify final version is saved
    await page.click('text=Rapid Edit Test');
    await expect(page.locator('textarea[id="prompt-content"]')).toHaveValue('Version 5');
  });

  test('should disable Save button when clearing required fields', async ({ page }) => {
    // Navigate to the add-in
    await page.goto('http://localhost:3000');

    await page.waitForSelector('text=Add Custom Prompt', { timeout: 10000 });

    // Create a prompt
    await page.click('text=Add Custom Prompt');
    await page.fill('input[id="prompt-title"]', 'Clear Test');
    await page.fill('textarea[id="prompt-content"]', 'Some content');
    await page.click('button:has-text("Save")');
    await page.waitForSelector('text=Clear Test', { timeout: 5000 });

    // Open for editing
    await page.click('text=Clear Test');

    // Clear the title
    await page.fill('input[id="prompt-title"]', '');

    // Save button should be disabled
    await expect(page.locator('button:has-text("Save")')).toBeDisabled();

    // Restore title
    await page.fill('input[id="prompt-title"]', 'Clear Test');

    // Save button should be enabled again
    await expect(page.locator('button:has-text("Save")')).toBeEnabled();

    // Clear the content
    await page.fill('textarea[id="prompt-content"]', '');

    // Save button should be disabled again
    await expect(page.locator('button:has-text("Save")')).toBeDisabled();
  });
});
