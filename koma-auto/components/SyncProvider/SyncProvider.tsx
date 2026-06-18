'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '../../data/products';

export default function SyncProvider() {
  const { user } = useAuthStore();
  const isSyncing = useRef(false);
  const prevUser = useRef(user);

  useEffect(() => {
    // Handle logout: clear local stores
    if (prevUser.current && !user) {
      useCartStore.getState().clearCart();
      useFavoritesStore.getState().setItems([]);
    }
    prevUser.current = user;

    if (!user) return;

    const syncInitial = async () => {
      isSyncing.current = true;
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        const localCart = useCartStore.getState().items;
        const localFavs = useFavoritesStore.getState().items;

        let fbCart: { id: string; quantity: number }[] = [];
        let fbFavs: string[] = [];

        if (userDoc.exists()) {
          const data = userDoc.data();
          fbCart = data.cart || [];
          fbFavs = data.favorites || [];
        }

        // Merge cart
        const cartMap = new Map<string, number>();
        fbCart.forEach(item => cartMap.set(item.id, item.quantity));
        localCart.forEach(item => {
          const existingQty = cartMap.get(item.id);
          cartMap.set(item.id, existingQty ? Math.max(existingQty, item.quantity) : item.quantity);
        });

        // Merge favorites
        const favSet = new Set<string>();
        fbFavs.forEach(id => favSet.add(id));
        localFavs.forEach(item => favSet.add(item.id));

        const missingIds = new Set<string>();
        
        // Check what full products we are missing
        const combinedCartIds = Array.from(cartMap.keys());
        const combinedFavIds = Array.from(favSet);

        [...combinedCartIds, ...combinedFavIds].forEach(id => {
          if (!localCart.some(i => i.id === id) && !localFavs.some(i => i.id === id)) {
            missingIds.add(id);
          }
        });

        let fetchedProducts: Product[] = [];
        if (missingIds.size > 0) {
          const res = await fetch('/api/products/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: Array.from(missingIds) }),
          });
          if (res.ok) {
            fetchedProducts = await res.json();
          }
        }

        // Hydrate final items
        const getFullProduct = (id: string) => {
          return localCart.find(i => i.id === id) || 
                 localFavs.find(i => i.id === id) || 
                 fetchedProducts.find(i => i.id === id);
        };

        const finalCart = combinedCartIds.map(id => {
          const p = getFullProduct(id);
          return p ? { ...p, quantity: cartMap.get(id)! } : null;
        }).filter(Boolean) as any[];

        const finalFavs = combinedFavIds.map(id => getFullProduct(id)).filter(Boolean) as any[];

        useCartStore.getState().setItems(finalCart);
        useFavoritesStore.getState().setItems(finalFavs);

        // Upload merged to FB
        await setDoc(userRef, {
          cart: finalCart.map(i => ({ id: i.id, quantity: i.quantity })),
          favorites: finalFavs.map(i => i.id)
        }, { merge: true });

      } catch (error) {
        console.error("Error syncing cart/favs:", error);
      } finally {
        isSyncing.current = false;
      }
    };

    syncInitial();
  }, [user]);

  // Sync up to Firestore on changes
  useEffect(() => {
    if (!user) return;

    const unsubCart = useCartStore.subscribe((state, prevState) => {
      if (isSyncing.current) return;
      if (state.items !== prevState.items) {
        const cartData = state.items.map(i => ({ id: i.id, quantity: i.quantity }));
        setDoc(doc(db, 'users', user.uid), { cart: cartData }, { merge: true }).catch(console.error);
      }
    });

    const unsubFavs = useFavoritesStore.subscribe((state, prevState) => {
      if (isSyncing.current) return;
      if (state.items !== prevState.items) {
        const favsData = state.items.map(i => i.id);
        setDoc(doc(db, 'users', user.uid), { favorites: favsData }, { merge: true }).catch(console.error);
      }
    });

    return () => {
      unsubCart();
      unsubFavs();
    };
  }, [user]);

  return null;
}
