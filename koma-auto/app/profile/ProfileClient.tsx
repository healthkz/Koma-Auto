'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '../../store/useToastStore';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { User as UserIcon, Mail, Calendar, Briefcase, Clock, LogOut, Package, Pencil } from 'lucide-react';
import styles from './Profile.module.css';

export default function ProfileClient() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [clientType, setClientType] = useState('retail');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editClientType, setEditClientType] = useState('retail');

  const { user, userProfile, isLoading: isAuthLoading, setUserProfile } = useAuthStore();
  const { addToast } = useToastStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        addToast('Вы успешно вошли в аккаунт!', 'success');
        setEmail('');
        setPassword('');
      } else {
        if (password !== confirmPassword) {
          addToast('Пароли не совпадают', 'error');
          setIsLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (name) {
          await updateProfile(user, { displayName: name });
        }

        // Save extra data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: name || '',
          email: user.email,
          dob: dob || '',
          clientType: clientType || 'retail',
          createdAt: new Date().toISOString()
        });

        addToast('Аккаунт успешно создан!', 'success');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setDob('');
        setClientType('retail');
      }
    } catch (error: any) {
      console.error('Firebase Auth Error:', error);
      let errorMessage = 'Произошла ошибка при авторизации.';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'Этот Email уже используется.';
      if (error.code === 'auth/invalid-credential') errorMessage = 'Неверный Email или пароль.';
      if (error.code === 'auth/weak-password') errorMessage = 'Слишком слабый пароль.';
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Set initial name if available
      if (user.displayName && !name) {
        setName(user.displayName);
      }
      // Note: we do NOT save to Firestore here anymore.
      // The Header listener will fetch the doc, find it missing, and set userProfile to null,
      // which will trigger the "incomplete registration" form.

      addToast('Вы успешно вошли через Google!', 'success');
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        addToast('Ошибка при входе через Google', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указано';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      addToast('Вы вышли из аккаунта', 'success');
    } catch (error) {
      addToast('Ошибка при выходе', 'error');
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const profileData = {
        name: name || user.displayName || '',
        email: user.email,
        dob: dob || '',
        clientType: clientType || 'retail',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', user.uid), profileData);
      setUserProfile(profileData as any);
      addToast('Регистрация успешно завершена!', 'success');
    } catch (error) {
      console.error('Error completing registration:', error);
      addToast('Ошибка при сохранении данных', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!user || !userProfile) return;
    setEditName(userProfile.name || user.displayName || '');
    setEditDob(userProfile.dob || '');
    setEditClientType(userProfile.clientType || 'retail');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;
    
    setIsLoading(true);
    try {
      if (editName && editName !== user.displayName) {
        await updateProfile(user, { displayName: editName });
      }

      const updatedProfile = {
        ...userProfile,
        name: editName,
        dob: editDob,
        clientType: editClientType
      };
      
      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      setUserProfile(updatedProfile as any);
      setIsEditModalOpen(false);
      addToast('Данные успешно обновлены!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Ошибка при обновлении профиля', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.authCard} style={{ alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <p style={{ color: 'var(--color-navy)' }}>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show their profile info
  if (user) {
    if (!userProfile) {
      return (
        <div className={styles.pageContainer}>
          <div className={styles.authCard}>
            <h1 className={styles.title}>Остался один шаг</h1>
            <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--color-dark-gray)' }}>
              Пожалуйста, заполните недостающие данные для завершения регистрации.
            </p>
            <form className={styles.form} onSubmit={handleCompleteRegistration}>
              <div className={styles.inputGroup}>
                <label htmlFor="complete-name" className={styles.label}>Имя</label>
                <input
                  id="complete-name"
                  type="text"
                  value={name || user.displayName || ''}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как к вам обращаться?"
                  className={styles.input}
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="complete-dob" className={styles.label}>Дата рождения</label>
                <input
                  id="complete-dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="complete-clientType" className={styles.label}>Укажите тип клиента:</label>
                <select
                  id="complete-clientType"
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                  className={styles.select}
                >
                  <option value="retail">Розничный клиент</option>
                  <option value="wholesale">Оптовый клиент</option>
                </select>
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isLoading || !dob}
              >
                {isLoading ? 'Сохранение...' : 'Завершить регистрацию'}
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashboardTitle}>Личный кабинет</h1>
            <p className={styles.dashboardSubtitle}>Добро пожаловать, {userProfile.name || user.displayName || 'Пользователь'}!</p>
          </div>
          <button className={styles.logoutBtn} onClick={() => setIsLogoutModalOpen(true)}>
            <LogOut size={16} />
            Выйти
          </button>
        </div>

        <div className={styles.dashboardGrid}>
          {/* Main Info Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className={styles.infoCard}>
              <div className={styles.infoCardTitle} style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserIcon size={20} />
                  Личные данные
                </div>
                <button className={styles.editBtn} onClick={handleOpenEditModal} title="Редактировать">
                  <Pencil size={16} />
                </button>
              </div>
              
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Имя и фамилия</span>
                  <span className={styles.infoValue}>{userProfile.name || user.displayName || 'Не указано'}</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email адрес</span>
                  <span className={styles.infoValue} style={{ wordBreak: 'break-all' }}>
                    <Mail size={16} color="#888" />
                    {userProfile.email || user.email}
                  </span>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Дата рождения</span>
                  <span className={styles.infoValue}>
                    <Calendar size={16} color="#888" />
                    {formatDate(userProfile.dob)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className={styles.infoCard}>
              <h2 className={styles.infoCardTitle}>
                <Briefcase size={20} />
                Статус аккаунта
              </h2>
              
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Тип клиента</span>
                  <div>
                    {userProfile.clientType === 'wholesale' ? (
                      <span className={styles.badgeWholesale}>Оптовый клиент</span>
                    ) : (
                      <span className={styles.badgeRetail}>Розничный клиент</span>
                    )}
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Дата регистрации</span>
                  <span className={styles.infoValue} style={{ fontSize: '14px' }}>
                    <Clock size={16} color="#888" />
                    {formatDate(userProfile.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h2 className={styles.infoCardTitle} style={{ borderBottom: 'none', marginBottom: '0' }}>
                <Package size={20} />
                Мои заказы
              </h2>
              <div className={styles.emptyState}>
                <Package size={40} color="#dcdfe6" style={{ marginBottom: '12px' }} />
                <p>У вас пока нет заказов</p>
                <span style={{ fontSize: '13px', marginTop: '4px' }}>История появится здесь после первой покупки</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {isLogoutModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsLogoutModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.modalTitle}>Вы уверены?</h3>
              <p className={styles.modalText}>Вы действительно хотите выйти из аккаунта?</p>
              <div className={styles.modalActions}>
                <button 
                  className={styles.modalCancelBtn} 
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  Отмена
                </button>
                <button 
                  className={styles.modalConfirmBtn} 
                  onClick={handleSignOut}
                >
                  Выйти
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div className={styles.modalOverlay} onClick={() => !isLoading && setIsEditModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left' }}>
              <h3 className={styles.modalTitle} style={{ marginBottom: '20px' }}>Редактирование профиля</h3>
              <form className={styles.form} onSubmit={handleSaveProfile}>
                <div className={styles.inputGroup}>
                  <label htmlFor="edit-name" className={styles.label}>Имя</label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="edit-dob" className={styles.label}>Дата рождения</label>
                  <input
                    id="edit-dob"
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    min="1900-01-01"
                    max={new Date().toISOString().split('T')[0]}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="edit-clientType" className={styles.label}>Укажите тип клиента:</label>
                  <select
                    id="edit-clientType"
                    value={editClientType}
                    onChange={(e) => setEditClientType(e.target.value)}
                    className={styles.select}
                  >
                    <option value="retail">Розничный клиент</option>
                    <option value="wholesale">Оптовый клиент</option>
                  </select>
                </div>

                <div className={styles.modalActions} style={{ marginTop: '30px' }}>
                  <button 
                    type="button"
                    className={styles.modalCancelBtn} 
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isLoading}
                  >
                    Отмена
                  </button>
                  <button 
                    type="submit"
                    className={styles.submitBtn} 
                    style={{ flex: 1, margin: 0 }}
                    disabled={isLoading || !editDob}
                  >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Личный кабинет</h1>
        
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'login' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Вход
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'register' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Регистрация
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>Имя</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как к вам обращаться?"
                  className={styles.input}
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="dob" className={styles.label}>Дата рождения</label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  min="1900-01-01"
                  max={new Date().toISOString().split('T')[0]}
                  className={styles.input}
                  required
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email или телефон</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.ru"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className={styles.input}
              required
            />
          </div>

          {activeTab === 'register' && (
            <>
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Подтвердите пароль</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Подтвердите пароль"
                  className={styles.input}
                  required
                />
              </div>
              
              <div className={styles.thinDivider}></div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="clientType" className={styles.label}>Укажите тип клиента:</label>
                <select
                  id="clientType"
                  value={clientType}
                  onChange={(e) => setClientType(e.target.value)}
                  className={styles.select}
                >
                  <option value="retail">Розничный клиент</option>
                  <option value="wholesale">Оптовый клиент</option>
                </select>
              </div>
            </>
          )}

          {activeTab === 'login' && (
            <a href="#" className={styles.forgotPassword} onClick={(e) => e.preventDefault()}>
              Забыли пароль?
            </a>
          )}

          <button 
            type="submit" 
            className={styles.submitBtn}
            disabled={isLoading || !email || !password || (activeTab === 'register' && (!name || !confirmPassword))}
          >
            {isLoading ? 'Загрузка...' : (activeTab === 'login' ? 'Войти в аккаунт' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className={styles.divider}>или</div>

        <button className={styles.socialBtn} type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Войти через Google
        </button>

      </div>
    </div>
  );
}
