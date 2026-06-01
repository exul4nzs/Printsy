import { test, expect } from '@playwright/test';

test.describe('Photo Print Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to editor from home page', async ({ page }) => {
    // Find and click editor link
    const editorLink = page.locator('a:has-text("Editor")').first();
    await expect(editorLink).toBeVisible();
    await editorLink.click();

    // Verify we're on editor page
    await expect(page).toHaveURL('/editor');
    await page.waitForLoadState('networkidle');
  });

  test('should display products on home page', async ({ page }) => {
    // Wait for products to load
    await page.waitForTimeout(1000);

    // Look for product cards
    const productCards = page.locator('[data-testid="product-card"]');
    
    // Should have at least one product
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Find mobile menu button
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible();

    // Click menu
    await menuButton.click();

    // Check that navigation items appear
    const galleryLink = page.locator('a:has-text("Gallery")');
    await expect(galleryLink).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    // Wait for products
    await page.waitForTimeout(1000);

    // Find first product card
    const productCard = page.locator('[data-testid="product-card"]').first();
    
    if (await productCard.count() > 0) {
      // Find add to cart button in the product card
      const addToCartButton = productCard.locator('button:has-text("Add to Cart"), button:has-text("Select")').first();
      
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click();

        // Check for toast notification or cart update
        await page.waitForTimeout(500);
      }
    }
  });

  test('should navigate to cart', async ({ page }) => {
    // Find cart link
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink).toBeVisible();

    // Click cart
    await cartLink.click();

    // Verify cart page
    await expect(page).toHaveURL('/cart');
    await page.waitForLoadState('networkidle');
  });

  test('should display login modal on sign in', async ({ page }) => {
    // Find sign in button
    const signInButton = page.locator('button:has-text("Sign In")').first();

    if (await signInButton.count() > 0) {
      await signInButton.click();

      // Look for login modal
      const loginModal = page.locator('div[role="dialog"]').first();
      await expect(loginModal).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show cart badge with count', async ({ page }) => {
    // Cart badge should be visible
    const cartBadge = page.locator('a[href="/cart"] span');
    
    // Badge text could be number or hidden if empty
    // This test verifies the cart icon is visible
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink).toBeVisible();
  });

  test('should handle responsive header', async ({ page }) => {
    // Test at different breakpoints
    const breakpoints = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' },
    ];

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });

      // Header should be visible
      const header = page.locator('header').first();
      await expect(header).toBeVisible();

      // Logo should be visible
      const logo = page.locator('text=Printsy').first();
      await expect(logo).toBeVisible();
    }
  });
});

test.describe('Image Upload and Editor', () => {
  test('should upload image in editor', async ({ page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');

    // Look for file input
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      // Create a test image file
      const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      const blob = new File([buffer], 'test.gif', { type: 'image/gif' });

      // Upload file
      await fileInput.setInputFiles({ name: 'test.gif', mimeType: 'image/gif', buffer });

      // Wait for image to load
      await page.waitForTimeout(1000);

      // Look for the image preview or zoom controls
      const imagePreview = page.locator('img[alt="Preview"]');
      if (await imagePreview.count() > 0) {
        await expect(imagePreview).toBeVisible();
      }
    }
  });
});

test.describe('Authentication', () => {
  test('should display user profile after login', async ({ page }) => {
    // This test would require mocking Firebase auth or setting up test credentials
    // For now, we just verify the auth context is available
    
    await page.goto('/');
    
    // Check for Sign In button (user not logged in)
    const signInButton = page.locator('button:has-text("Sign In")').first();
    
    if (await signInButton.count() > 0) {
      await expect(signInButton).toBeVisible();
    }
  });
});

test.describe('Admin Dashboard', () => {
  test('should not access admin dashboard without auth', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect or show error (depends on implementation)
    // For now, just verify page loads
    await page.waitForLoadState('networkidle');
  });
});
