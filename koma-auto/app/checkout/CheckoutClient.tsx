'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import styles from './Checkout.module.css';

export default function CheckoutClient() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{name?: string}>({});

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    deliveryMethod: 'courier',
    address: '',
    paymentMethod: 'card',
  });

  const totalPrice = getTotalPrice();
  const deliveryCost = 0;
  const finalPrice = totalPrice;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFullName = (fullName: string) => {
    const trimmed = fullName.trim();
    if (!trimmed.includes(' ') || trimmed.length < 8) {
      return 'Пожалуйста, введите Имя и Фамилию через пробел, полным значением (не менее 8 символов)';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addToast('Сервис временно недоступен, повторите позже', 'error');
    return;

    // Uncomment below to restore functionality later
    /*
    const nameError = validateFullName(formData.name);
    if (nameError) {
      setErrors({ name: nameError });
      addToast(nameError, 'error');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      clearCart();
      setIsSuccess(true);
    }, 1000);
    */
  };

  if (isSuccess) {
    return (
      <div className={`container ${styles.successState}`}>
        <CheckCircle size={80} color="var(--color-success)" />
        <h1>Заказ успешно оформлен!</h1>
        <p>Ваш заказ №{Math.floor(Math.random() * 100000)} принят в обработку. Мы свяжемся с вами в ближайшее время.</p>
        <Link href="/" className={styles.homeBtn}>
          Вернуться на главную
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyState}`}>
        <h2>Для оформления заказа добавьте товары в корзину</h2>
        <Link href="/catalog" className={styles.homeBtn}>
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.checkoutPage}`}>
      <h1 className={styles.title}>Оформление заказа</h1>

      <form className={styles.formLayout} onSubmit={handleSubmit}>
        <div className={styles.mainCol}>
          <div className={styles.section}>
            <h2>1. Контактные данные</h2>
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={errors.name ? styles.labelError : ''}>Имя и Фамилия *</label>
                <input 
                  required 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.name) setErrors({});
                  }} 
                  className={errors.name ? styles.inputError : ''}
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
              </div>
              <div className={styles.inputGroup}>
                <label>Телефон *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className={styles.inputGroup}>
                <label>E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>2. Способ доставки</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioCard}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="courier"
                  checked={formData.deliveryMethod === 'courier'}
                  onChange={handleChange}
                />
                <div className={styles.radioContent}>
                  <span className={styles.radioTitle}>Курьером по городу</span>
                  <span className={styles.radioDesc}>Доставка в течение 1-2 дней. Доставка определяется автоматически.</span>
                </div>
              </label>
              <label className={styles.radioCard}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={formData.deliveryMethod === 'pickup'}
                  onChange={handleChange}
                />
                <div className={styles.radioContent}>
                  <span className={styles.radioTitle}>Самовывоз</span>
                  <span className={styles.radioDesc}>Из нашего магазина. Бесплатно.</span>
                </div>
              </label>
            </div>

            {formData.deliveryMethod === 'courier' && (
              <div className={styles.inputGroup} style={{ marginTop: '24px' }}>
                <label>Адрес доставки *</label>
                <textarea required name="address" value={formData.address} onChange={handleChange} rows={3} />
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2>3. Способ оплаты</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioCard}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                />
                <div className={styles.radioContent}>
                  <span className={styles.radioTitle}>Картой онлайн</span>
                </div>
              </label>
              <label className={styles.radioCard}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                />
                <div className={styles.radioContent}>
                  <span className={styles.radioTitle}>Наличными при получении</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.summaryBox}>
            <h3>Ваш заказ</h3>
            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <span>{item.name} x{item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()} ₸</span>
                </div>
              ))}
            </div>
            
            <div className={styles.summaryCalculations}>
              <div className={styles.calcRow}>
                <span>Товары</span>
                <span>{totalPrice.toLocaleString()} ₸</span>
              </div>
              {formData.deliveryMethod === 'courier' ? (
                <div className={styles.calcRow}>
                  <span>Доставка</span>
                  <span>Определяется автоматически</span>
                </div>
              ) : (
                <div className={styles.calcRow}>
                  <span>Самовывоз</span>
                  <span></span>
                </div>
              )}
            </div>

            <div className={styles.totalRow}>
              <span>Итого к оплате</span>
              <span className={styles.totalValue}>{finalPrice.toLocaleString()} ₸</span>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Подтвердить заказ
            </button>
            <p className={styles.disclaimer}>
              Нажимая на кнопку, вы соглашаетесь с условиями обработки персональных данных.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
