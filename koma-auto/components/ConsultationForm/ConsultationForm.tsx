'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './ConsultationForm.module.css';

export default function ConsultationForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vin, setVin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{name?: string, phone?: string, vin?: string}>({});
  
  const { addToast } = useToastStore();
  const { user, userProfile } = useAuthStore();

  const validateName = (nameStr: string) => {
    const trimmed = nameStr.trim();
    if (trimmed.length < 3) {
      return 'Имя должно содержать не менее 3 символов';
    }
    return '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    
    if (val.length === 0) {
      setPhone('');
      return;
    }

    if (val[0] !== '7' && val[0] !== '8') {
      val = '7' + val;
    }
    if (val.length > 11) val = val.slice(0, 11);
    
    let formatted = '';
    if (val[0] === '7') {
      formatted = '+7';
    } else {
      formatted = '8';
    }

    if (val.length > 1) formatted += '-' + val.slice(1, 4);
    if (val.length > 4) formatted += '-' + val.slice(4, 7);
    if (val.length > 7) formatted += '-' + val.slice(7, 11);
    
    setPhone(formatted);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
  };

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.toUpperCase();
    if (/[А-Яа-яЁё]/.test(rawVal)) {
      setErrors(prev => ({ ...prev, vin: 'Используйте латинские буквы' }));
    } else if (errors.vin === 'Используйте латинские буквы') {
      setErrors(prev => ({ ...prev, vin: undefined }));
    }

    let val = rawVal.replace(/[^A-Z0-9]/g, '');
    if (val.length > 17) val = val.slice(0, 17);
    setVin(val);
    if (errors.vin && errors.vin !== 'Используйте латинские буквы') {
      setErrors(prev => ({ ...prev, vin: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {name?: string, phone?: string, vin?: string} = {};
    let hasEmptyFields = false;

    if (!name.trim()) { newErrors.name = 'Заполните это поле'; hasEmptyFields = true; }
    if (!phone) { newErrors.phone = 'Заполните это поле'; hasEmptyFields = true; }
    if (!vin) { newErrors.vin = 'Заполните это поле'; hasEmptyFields = true; }

    if (name.trim()) {
      const nameError = validateName(name);
      if (nameError) newErrors.name = nameError;
    }

    if (phone) {
      if (phone.startsWith('+7') && phone.length < 15) {
        newErrors.phone = 'Введите полный номер телефона';
      } else if (phone.startsWith('8') && phone.length < 14) {
        newErrors.phone = 'Введите полный номер телефона';
      }
    }

    if (vin && (vin.length < 11 || vin.length > 17)) {
      newErrors.vin = 'VIN код должен содержать от 11 до 17 символов';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (hasEmptyFields) {
        addToast('Пожалуйста, заполните все обязательные поля', 'error');
      } else {
        addToast('Пожалуйста, исправьте ошибки в форме', 'error');
      }
      return;
    }

    setIsLoading(true);

    try {
      let clientInfo = 'Клиент: Гость';
      if (user) {
        const typeStr = userProfile?.clientType === 'wholesale' ? 'Оптовый клиент' : 'Розничный клиент';
        const dobStr = userProfile?.dob || 'Не указана';
        const createdAtStr = userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('ru-RU') : 'Не указана';
        
        clientInfo = `Клиент: ${typeStr}\nИмя и Фамилия: ${userProfile?.name || name}\nДата рождения: ${dobStr}\nДата регистрации: ${createdAtStr}\nEmail адрес: ${user.email}`;
      }

      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, vin, clientInfo }),
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
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={`${styles.label} ${errors.name ? styles.labelError : ''}`}>Имя и Фамилия</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              placeholder="Как к вам обращаться?"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              required
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={`${styles.label} ${errors.phone ? styles.labelError : ''}`}>Номер телефона</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Ваш номер телефона"
              required
              className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            />
            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="vin" className={`${styles.label} ${errors.vin ? styles.labelError : ''}`}>VIN код / Номер кузова</label>
            <input
              type="text"
              id="vin"
              value={vin}
              onChange={handleVinChange}
              placeholder="Введите VIN-код"
              required
              className={`${styles.input} ${errors.vin ? styles.inputError : ''}`}
            />
            {errors.vin && <span className={styles.errorText}>{errors.vin}</span>}
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isLoading}
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
