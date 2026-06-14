'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Shield, Truck, CornerUpLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../../data/products';
import { useCartStore } from '../../../store/useCartStore';
import { useFavoritesStore } from '../../../store/useFavoritesStore';
import { useToastStore } from '../../../store/useToastStore';
import ProductCard from '../../../components/ProductCard/ProductCard';
import styles from './ProductDetails.module.css';

export default function ProductDetails({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('specs');
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const addItemToCart = useCartStore((state) => state.addItem);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);
        
        if (data && data.category) {
          const simRes = await fetch(`/api/products?category=${encodeURIComponent(data.category)}&limit=5`);
          const simData = await simRes.json();
          if (simData && simData.products) {
             setSimilarProducts(simData.products.filter((p: Product) => p.id !== data.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className={`container ${styles.loadingState}`}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Загрузка товара...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h1>Товар не найден</h1>
        <Link href="/catalog" style={{ color: 'var(--color-navy)', marginTop: '20px', display: 'inline-block' }}>
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItemToCart(product);
    }
    addToast('Товар добавлен в корзину', 'success');
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product);
    if (!favorite) {
      addToast('Добавлено в избранное', 'info');
    } else {
      addToast('Удалено из избранного', 'info');
    }
  };

  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const currentImage = images.length > 0 ? images[currentImageIndex] : `https://placehold.co/600x600/F5F5F5/060F48?text=${encodeURIComponent(product.name.split(' ').slice(0, 2).join('\n'))}`;

  const nextImage = () => setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));

  const displayPrice = product.price * quantity;
  const displayOldPrice = product.oldPrice ? product.oldPrice * quantity : undefined;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && images.length > 1) {
      nextImage();
    }
    if (isRightSwipe && images.length > 1) {
      prevImage();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className={`container ${styles.productPage}`}>
      <div className={styles.breadcrumbs}>
        <Link href="/">Главная</Link>
        <span>/</span>
        <Link href="/catalog">Каталог</Link>
        <span>/</span>
        <span className={styles.current}>{product.name}</span>
      </div>

      <div className={styles.main}>
        <div className={styles.gallery}>
          <div 
            className={styles.imageWrapper}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {!imageLoaded && <div className={styles.skeleton}></div>}
            {images.length > 0 ? (
              images.map((imgSrc, index) => (
                <Image
                  key={index}
                  src={imgSrc}
                  alt={`${product.name} - Фото ${index + 1}`}
                  fill
                  className={`${styles.image} ${index === currentImageIndex ? styles.activeImage : styles.hiddenImage} ${imageLoaded ? styles.loaded : ''}`}
                  onLoad={() => setImageLoaded(true)}
                  priority={index === 0}
                  unoptimized
                />
              ))
            ) : (
              <Image
                src={`https://placehold.co/600x600/F5F5F5/060F48?text=${encodeURIComponent(product.name.split(' ').slice(0, 2).join('\n'))}`}
                alt={product.name}
                fill
                className={`${styles.image} ${styles.activeImage} ${imageLoaded ? styles.loaded : ''}`}
                onLoad={() => setImageLoaded(true)}
                priority
                unoptimized
              />
            )}
            
            {images.length > 1 && (
              <>
                <div className={styles.sliderArrows}>
                  <button className={styles.arrowBtn} onClick={prevImage} aria-label="Предыдущее фото">
                    <ChevronLeft size={24} />
                  </button>
                  <button className={styles.arrowBtn} onClick={nextImage} aria-label="Следующее фото">
                    <ChevronRight size={24} />
                  </button>
                </div>
                <div className={styles.dots}>
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.dot} ${index === currentImageIndex ? styles.active : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Перейти к фото ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.meta}>
            <span className={styles.article}>Код / OEM: {product.article}</span>
            <span className={styles.brand}>{product.brand}</span>
          </div>

          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.status}>
            {product.inStock ? (
              <span className={styles.inStock}>В наличии</span>
            ) : (
              <span className={styles.outOfStock}>Нет в наличии</span>
            )}
          </div>

          <div className={styles.priceBlock}>
            <div className={styles.prices}>
              <span className={styles.price}>{displayPrice.toLocaleString()} ₸</span>
              {displayOldPrice && (
                <span className={styles.oldPrice}>{displayOldPrice.toLocaleString()} ₸</span>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <div className={styles.quantity}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <input type="number" value={quantity} readOnly />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            
            <button
              className={`${styles.addToCartBtn} ${!product.inStock ? styles.disabled : ''}`}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart size={20} />
              В корзину
            </button>

            <button
              className={`${styles.favoriteBtn} ${favorite ? styles.active : ''}`}
              onClick={handleToggleFavorite}
            >
              <Heart size={24} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <Shield size={24} />
              <div>
                <h4>Гарантия</h4>
                <p>На установку</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <Truck size={24} />
              <div>
                <h4>Доставка</h4>
                <p>От 1 дня по РК</p>
              </div>
            </div>
            <div className={styles.benefit}>
              <CornerUpLeft size={24} />
              <div>
                <h4>Возврат</h4>
                <p>14 дней на возврат, после установки запчасти возврат невозможен</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabsSection}>
        <div className={styles.tabsHeader}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'specs' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Характеристики
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'specs' && (
            <div className={styles.specsList}>
              {product.description && (
                <div style={{ whiteSpace: 'pre-wrap', marginBottom: '20px', lineHeight: '1.6', color: 'var(--color-navy)' }}>
                  {product.description}
                </div>
              )}
              {product.specs && Object.keys(product.specs).length > 0 && (
                Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className={styles.specRow}>
                    <span className={styles.specName}>{key}</span>
                    <span className={styles.specValue}>{value}</span>
                  </div>
                ))
              )}
              {!product.description && (!product.specs || Object.keys(product.specs).length === 0) && (
                <p>Характеристики не указаны</p>
              )}
            </div>
          )}
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className={styles.similar}>
          <h2 className={styles.similarTitle}>Похожие товары</h2>
          <div className={styles.similarGrid}>
            {similarProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
