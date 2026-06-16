'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';
import styles from './ConsultationForm.module.css';

export default function ConsultationForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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
        body: JSON.stringify({ name, phone }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit consultation request');
      }

      setIsSuccess(true);
      setName('');
      setPhone('');
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
    <div className={styles.container}>
      <h2 className={styles.title}>Не нашли нужную запчасть?</h2>
      <p className={styles.subtitle}>
        Оставьте свои контакты, и наши специалисты свяжутся с вами для бесплатной консультации и подбора деталей.
      </p>

      {isSuccess ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--color-navy)' }}>
          <CheckCircle size={48} color="#10B981" />
          <h3 style={{ fontSize: '20px', fontWeight: 600 }}>Заявка принята!</h3>
          <p>Ожидайте звонка от нашего специалиста.</p>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>Ваше имя</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как к вам обращаться?"
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={styles.label}>Номер телефона *</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (___) ___-__-__"
              required
              className={styles.input}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isLoading || !phone.trim()}
          >
            {isLoading ? (
              <Loader2 size={20} className={styles.spinner} />
            ) : (
              <>
                <Send size={20} />
                Оставить заявку
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
