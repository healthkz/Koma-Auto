import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../data/products';

interface FavoritesState {
  items: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  setItems: (items: Product[]) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (product) => {
        set((state) => {
          const isExist = state.items.some((item) => item.id === product.id);
          if (isExist) {
            return { items: state.items.filter((item) => item.id !== product.id) };
          }
          return { items: [...state.items, product] };
        });
      },
      isFavorite: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
      setItems: (items) => set({ items }),
    }),
    {
      name: 'koma-favorites-storage',
    }
  )
);
