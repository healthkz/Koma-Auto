'use client';

import { useState } from 'react';
import { User, Phone, CarFront, MessageSquareText, Loader2, CheckCircle } from 'lucide-react';
import styles from '../../app/page.module.css';
import { useToastStore } from '../../store/useToastStore';

export default function HomeConsultationForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vin, setVin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      addToast('Пожалуйста, введите номер телефона', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, vin }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit consultation request');
      }

      setIsSuccess(true);
      setName('');
      setPhone('');
      setVin('');
      addToast('Заявка успешно отправлена! Мы скоро свяжемся с вами.', 'success');
      
      // Reset success state after a while
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Consultation form error:', error);
      addToast('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.infoCard}>
      <h3 className={styles.infoTitle}>Онлайн консультация для подбора автозапчастей:</h3>
      
      {isSuccess ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--color-navy)', padding: '40px 0' }}>
          <CheckCircle size={48} color="#10B981" />
          <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Заявка принята!</h3>
          <p>Ожидайте звонка от нашего специалиста.</p>
        </div>
      ) : (
        <form className={styles.formGroup} onSubmit={handleSubmit}>
          <div className={styles.inputWrapper}>
            <User size={32} className={styles.inputIcon} />
            <input 
              type="text" 
              placeholder="Как к вам обращаться?..." 
              className={styles.infoInput} 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.inputWrapper}>
            <Phone size={32} className={styles.inputIcon} />
            <input 
              type="tel" 
              placeholder="Ваш контактный номер телефона..." 
              className={styles.infoInput} 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputWrapper}>
            <CarFront size={32} className={styles.inputIcon} />
            <input 
              type="text" 
              placeholder="Введите вин-код (кузов) вашего автомобиля..." 
              className={styles.infoInput} 
              value={vin}
              onChange={(e) => setVin(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className={styles.fullWidthSubmitBtn}
            disabled={isLoading || !phone.trim()}
          >
            <span className={styles.fullWidthBtnText}>
              {isLoading ? 'Отправка...' : 'Отправить'}
            </span>
            {isLoading ? (
              <Loader2 size={20} className={`${styles.submitBtnIcon} animate-spin`} />
            ) : (
              <MessageSquareText size={20} className={styles.submitBtnIcon} />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
