import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/lib/store';

describe('Cart Store (Zustand)', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useCartStore.getState();
    store.clearCart();
  });

  describe('initial state', () => {
    it('should have empty items initially', () => {
      const store = useCartStore.getState();
      expect(store.items).toEqual([]);
    });
  });

  describe('addItem', () => {
    it('should add item to cart', () => {
      const store = useCartStore.getState();
      const item = {
        product: { id: 'test-1', name: 'Test Product' },
        variant: { id: 'var-1', size: '4R', price: 29.99 },
        quantity: 1,
      };

      store.addItem(item);

      const items = useCartStore.getState().items;
      expect(items.length).toBe(1);
    });

    it('should increment quantity if item already exists', () => {
      const store = useCartStore.getState();
      const item = {
        product: { id: 'test-1', name: 'Test Product' },
        variant: { id: 'var-1', size: '4R', price: 29.99 },
        quantity: 1,
      };

      store.addItem(item);
      store.addItem(item);

      const items = useCartStore.getState().items;
      expect(items.length).toBe(1);
      expect(items[0].quantity).toBe(2);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const store = useCartStore.getState();
      const item = {
        product: { id: 'test-1', name: 'Test Product' },
        variant: { id: 'var-1', size: '4R', price: 29.99 },
        quantity: 1,
      };

      store.addItem(item);
      store.removeItem('test-1', 'var-1');

      const items = useCartStore.getState().items;
      expect(items.length).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const store = useCartStore.getState();
      const item1 = {
        product: { id: 'test-1', name: 'Test Product 1' },
        variant: { id: 'var-1', size: '4R', price: 10.0 },
        quantity: 1,
      };
      const item2 = {
        product: { id: 'test-2', name: 'Test Product 2' },
        variant: { id: 'var-2', size: '5R', price: 15.0 },
        quantity: 2,
      };

      store.addItem(item1);
      store.addItem(item2);
      store.clearCart();

      const items = useCartStore.getState().items;
      expect(items.length).toBe(0);
    });
  });

  describe('getTotalPrice', () => {
    it('should calculate total price correctly', () => {
      const store = useCartStore.getState();
      const item1 = {
        product: { id: 'test-1', name: 'Test Product 1' },
        variant: { id: 'var-1', size: '4R', price: 10.0 },
        quantity: 2,
      };
      const item2 = {
        product: { id: 'test-2', name: 'Test Product 2' },
        variant: { id: 'var-2', size: '5R', price: 15.0 },
        quantity: 3,
      };

      store.addItem(item1);
      store.addItem(item2);

      const total = store.getTotalPrice();
      expect(total).toBe(65.0); // (10 * 2) + (15 * 3)
    });

    it('should return 0 for empty cart', () => {
      const store = useCartStore.getState();
      const total = store.getTotalPrice();
      expect(total).toBe(0);
    });
  });
});
