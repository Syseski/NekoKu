import { create } from 'zustand';
import { Cart, CartItem } from '../types';
import { api } from '../services/api';

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  isCheckoutModalOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  simulateCheckout: (checkoutData: any) => Promise<any>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isCheckoutModalOpen: false,
  isLoading: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  openCheckoutModal: () => set({ isCheckoutModalOpen: true, isOpen: false }),
  closeCheckoutModal: () => set({ isCheckoutModalOpen: false }),

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/cart');
      set({ cart: res.data.data, isLoading: false });
    } catch {
      set({ cart: null, isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    try {
      set({ isLoading: true });
      const res = await api.post('/cart/items', { productId, quantity });
      set({ cart: res.data.data, isOpen: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const res = await api.patch(`/cart/items/${itemId}`, { quantity });
      set({ cart: res.data.data });
    } catch (error: any) {
      throw error;
    }
  },

  removeItem: async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      set({ cart: res.data.data });
    } catch (error: any) {
      throw error;
    }
  },

  simulateCheckout: async (checkoutData) => {
    const res = await api.post('/checkout/simulate', checkoutData);
    // Refresh cart (will now be empty)
    await get().fetchCart();
    return res.data.data;
  },
}));
