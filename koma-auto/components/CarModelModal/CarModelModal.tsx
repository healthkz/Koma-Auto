'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import styles from './CarModelModal.module.css';

interface CarModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName: string;
  logoSrc: string;
  models: string[];
}

export default function CarModelModal({ isOpen, onClose, brandName, logoSrc, models }: CarModelModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  // Handle unmount animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 350); // Matches the animation duration
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className={`${styles.overlay} ${isClosing ? styles.fadeOut : ''}`} onClick={onClose}>
      <div className={`${styles.modal} ${isClosing ? styles.slideDown : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} color="#888" />
        </button>
        
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>В нашем каталоге есть запчасти для:</h2>
            <p className={styles.subtitle}>{brandName}:</p>
          </div>
          <Image 
            src={logoSrc} 
            alt={brandName} 
            width={150} 
            height={50} 
            className={styles.brandLogo} 
          />
        </div>

        <div className={styles.modelsGrid}>
          {models.map((model, index) => (
            <button key={index} className={styles.modelBtn}>
              {model}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
