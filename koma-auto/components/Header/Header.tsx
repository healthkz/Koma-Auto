'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, User, Store } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import styles from './Header.module.css';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      sessionStorage.setItem('koma_search', searchQuery);
      if (window.location.pathname === '/catalog') {
        window.dispatchEvent(new CustomEvent('koma_header_search', { detail: searchQuery }));
      } else {
        router.push('/catalog');
      }
    }
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.container}`}>
        
        {/* Logo */}
        <Link href="/" className={styles.logoWrapper}>
          <Image 
            src="/img/LogoKomaKZ.png" 
            alt="Koma.kz Auto Parts" 
            width={120} 
            height={40} 
            className={styles.logoImage}
            priority
          />
        </Link>

        {/* Catalog & Search Block */}
        <div className={styles.searchBlock}>
          <button 
            className={styles.catalogBtn}
            onClick={() => router.push('/catalog')}
          >
            <Menu size={20} />
            Каталог
          </button>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Введите название или номер запчасти..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>
              <Search size={20} color="#888" />
            </button>
          </form>
        </div>

        {/* Mobile Catalog Button */}
        <button 
          className={styles.mobileSearchBtn}
          onClick={() => router.push('/catalog')}
        >
          <Store size={24} color="var(--color-navy)" />
        </button>

        {/* User Block */}
        <div className={styles.userBlock}>
          <div className={styles.userIconWrapper}>
            <User size={20} color="#fff" />
          </div>
          <Link href="/auth" className={styles.userText}>
            Регистрация / Вход в аккаунт
          </Link>
        </div>

        {/* Cart Block */}
        <Link href="/cart" className={styles.cartBtn}>
          <ShoppingCart size={20} color="#fff" />
          {isMounted && cartItemsCount > 0 && <span className={styles.badge}>{cartItemsCount}</span>}
        </Link>

      </div>
    </header>
  );
}
