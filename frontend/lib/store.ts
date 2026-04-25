import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartState } from '@/types';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const items = get().items;
        // Check if item with same product, variant, and design already exists
        const existingIndex = items.findIndex(
          (i) =>
            i.product.id === item.product.id &&
            i.variant?.id === item.variant?.id &&
            i.design?.id === item.design?.id
        );
        
        if (existingIndex >= 0) {
          // Update quantity of existing item
          const newItems = [...items];
          newItems[existingIndex].quantity += item.quantity;
          newItems[existingIndex].total_price = 
            newItems[existingIndex].unit_price * newItems[existingIndex].quantity;
          set({ items: newItems });
        } else {
          // Add new item
          set({ items: [...items, { ...item, id: crypto.randomUUID() }] });
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        
        const newItems = get().items.map((item) =>
          item.id === id
            ? { ...item, quantity, total_price: item.unit_price * quantity }
            : item
        );
        set({ items: newItems });
      },
      
      clearCart: () => set({ items: [] }),
      
      get total() {
        return get().items.reduce((sum, item) => sum + item.total_price, 0);
      },
      
      get itemCount() {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
