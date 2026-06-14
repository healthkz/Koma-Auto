'use client';

import { useToastStore } from '../../store/useToastStore';
import styles from './ToastProvider.module.css';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';

export default function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <div className={styles.icon}>
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
          </div>
          <div className={styles.message}>{toast.message}</div>
          <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
