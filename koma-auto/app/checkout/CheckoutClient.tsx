'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Shield } from 'lucide-react';
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
    city: 'Алматы',
    deliveryMethod: 'courier',
    address: '',
    paymentMethod: 'card',
  });

  const [agreements, setAgreements] = useState({
    offer: false,
    privacy: false,
    refund: false
  });

  const totalPrice = getTotalPrice();
  
  // Calculate delivery logic
  let deliveryCost = 0;
  let courierAvailable = true;
  let courierMessage = '';

  if (formData.city === 'Алматы') {
    deliveryCost = 6500;
  } else if (formData.city === 'Алматинская область') {
    if (totalPrice < 150000) {
      courierAvailable = false;
      courierMessage = 'Для доставки в этот регион закажите от 150.000 тенге. Доставка от этой суммы осуществляется бесплатнo';
    } else {
      deliveryCost = 0;
    }
  } else if (formData.city === 'Ташкент' || formData.city === 'Бишкек') {
    if (totalPrice < 200000) {
      courierAvailable = false;
      courierMessage = 'Для доставки в этот регион закажите от 200.000 тенге. Доставка от этой суммы осуществляется бесплатнo';
    } else {
      deliveryCost = 0;
    }
  }

  // Force pickup if courier not available
  useEffect(() => {
    if (!courierAvailable && formData.deliveryMethod === 'courier') {
      setFormData(prev => ({ ...prev, deliveryMethod: 'pickup' }));
    }
  }, [courierAvailable, formData.deliveryMethod]);

  // Adjust payment methods based on delivery
  useEffect(() => {
    if (formData.deliveryMethod === 'pickup') {
      if (formData.paymentMethod !== 'card_receipt' && formData.paymentMethod !== 'cash') {
        setFormData(prev => ({ ...prev, paymentMethod: 'card_receipt' }));
      }
    } else {
      if (formData.paymentMethod !== 'online') {
        setFormData(prev => ({ ...prev, paymentMethod: 'online' }));
      }
    }
  }, [formData.deliveryMethod]);

  const finalPrice = formData.deliveryMethod === 'courier' ? totalPrice + deliveryCost : totalPrice;

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

    if (!agreements.offer || !agreements.privacy || !agreements.refund) {
      addToast('Необходимо согласиться со всеми условиями', 'error');
      return;
    }

    addToast('Сервис временно недоступен, повторите позже', 'error');
    return;
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
      <div className={styles.sellerInfo}>
        Продавец: ИП KAMOLDIN, ИИН 860516303365
      </div>
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
              <div className={styles.inputGroup}>
                <label>Город *</label>
                <select name="city" value={formData.city} onChange={handleChange} className={styles.citySelect}>
                  <option value="Алматы">Алматы</option>
                  <option value="Алматинская область">Алматинская область</option>
                  <option value="Ташкент">Ташкент</option>
                  <option value="Бишкек">Бишкек</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>2. Способ доставки</h2>
            <div className={styles.radioGroup}>
              <label className={`${styles.radioCard} ${!courierAvailable ? styles.disabledCard : ''}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="courier"
                  checked={formData.deliveryMethod === 'courier'}
                  onChange={handleChange}
                  disabled={!courierAvailable}
                />
                <div className={styles.radioContent}>
                  <span className={styles.radioTitle}>Курьером до двери</span>
                  <span className={styles.radioDesc}>
                    {formData.city === 'Алматы' 
                      ? (deliveryCost === 0 ? 'Бесплатно' : `Стоимость: ${deliveryCost} ₸`) 
                      : (courierAvailable ? 'Бесплатно' : courierMessage)}
                  </span>
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
              {formData.deliveryMethod === 'pickup' ? (
                <>
                  <label className={styles.radioCard}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card_receipt"
                      checked={formData.paymentMethod === 'card_receipt'}
                      onChange={handleChange}
                    />
                    <div className={styles.radioContent}>
                      <span className={styles.radioTitle}>Картой при получении</span>
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
                </>
              ) : (
                <label className={styles.radioCard}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={handleChange}
                  />
                  <div className={styles.radioContent}>
                    <span className={styles.radioTitle}>Halyk QR, Kaspi, или картой онлайн</span>
                  </div>
                </label>
              )}
            </div>
            
            {formData.paymentMethod === 'online' && (
              <div className={styles.securityText}>
                <Shield size={16} color="var(--color-success)" style={{ minWidth: '16px' }} />
                <span>Оплата производится через защищенный платежный шлюз Halyk ePay/Kaspi Pay</span>
              </div>
            )}
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
                  <span>{deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost.toLocaleString()} ₸`}</span>
                </div>
              ) : (
                <div className={styles.calcRow}>
                  <span>Самовывоз</span>
                  <span>0 ₸</span>
                </div>
              )}
            </div>

            <div className={styles.totalRow}>
              <span>Итого к оплате</span>
              <span className={styles.totalValue}>{finalPrice.toLocaleString()} ₸</span>
            </div>
            
            <div className={styles.agreementsBlock}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={agreements.offer} 
                  onChange={(e) => setAgreements(prev => ({...prev, offer: e.target.checked}))}
                  required 
                />
                <span>Я ознакомлен с <Link href="/terms-of-service" target="_blank">Договором публичной оферты</Link></span>
              </label>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={agreements.privacy} 
                  onChange={(e) => setAgreements(prev => ({...prev, privacy: e.target.checked}))}
                  required 
                />
                <span>Я ознакомлен с <Link href="/privacy-policy" target="_blank">Политикой конфиденциальности и защитой персональных данных</Link></span>
              </label>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  checked={agreements.refund} 
                  onChange={(e) => setAgreements(prev => ({...prev, refund: e.target.checked}))}
                  required 
                />
                <span>Я ознакомлен с <Link href="/terms-of-service" target="_blank">Правилами возврата товара и денежных средств</Link></span>
              </label>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Перейти к оплате
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
