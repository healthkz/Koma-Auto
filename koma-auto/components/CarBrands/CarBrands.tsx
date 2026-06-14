'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './CarBrands.module.css';
import CarModelModal from '../CarModelModal/CarModelModal';

const HYUNDAI_MODELS = [
  'Accent', 'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Creta', 'Kona', 'Ioniq 5', 'Ioniq 6', 'Venue',
  'Grandeur', 'Azera', 'i10', 'i20', 'i30', 'i40', 'ix20', 'ix35', 'ix55', 'Terracan',
  'Galloper', 'Matrix', 'Getz', 'Atos', 'Santamo', 'Trajet', 'Entourage', 'Staria', 'H-1', 'Starex',
  'Veloster', 'Genesis', 'Equus', 'Dynasty', 'Marcia', 'Scoupe', 'Tiburon', 'Tuscani', 'Coupe',
  'Bayon', 'Casper', 'Exter', 'Mufasa', 'Custin'
];

const KIA_MODELS = [
  'Rio', 'Picanto', 'Ceed', 'Cerato', 'Optima', 'Retona', 'Avella', 'Ray', 'Sedona', 'Pride',
  'Forte', 'Cadenza', 'Stinger', 'Quoris Soul', 'Seltos', 'Sportage', 'Sorento', 'Mohave', 'Carnival', 'Telluride',
  'Sonet', 'Pegas', 'Soluto', 'Stonic', 'XCeed', 'ProCeed', 'Niro', 'Tasman', 'Syros', 'Carens',
  'Venga', 'Spectra', 'Shuma', 'Sephia', 'Clarus', 'Magentis', 'Opirus', 'Borrego', 'Retona',
  'K3', 'K4', 'K5', 'K8', 'K9'
];

const CHEVROLET_MODELS = [
  'Aveo', 'Captiva', 'Cruze', 'Cobalt', 'Equinox', 'Impala', 'Malibu', 'Niva', 'Orlando', 'Spark',
  'Tahoe', 'Monza', 'Onix', 'Epica', 'Lacceti', 'Lanos', 'Monte Carlo', 'Volt'
];

export default function CarBrands() {
  const [activeBrand, setActiveBrand] = useState<'Hyundai' | 'KIA' | 'Chevrolet' | null>(null);

  return (
    <>
      <section className={styles.carBrandsSection}>
        <h2 className={styles.carBrandsTitle}>У нас есть запчасти под:</h2>
        <div className={styles.carBrandsGrid}>
          <button 
            className={styles.brandCard}
            onClick={() => setActiveBrand('Hyundai')}
          >
            <div className={styles.brandImageWrapper}>
              <Image src="/img/HyundaiLogo.png" alt="Hyundai" width={200} height={80} className={styles.brandImage} />
            </div>
          </button>
          <button 
            className={styles.brandCard}
            onClick={() => setActiveBrand('KIA')}
          >
            <div className={styles.brandImageWrapper}>
              <Image src="/img/KiaLogo.png" alt="Kia" width={200} height={80} className={styles.brandImage} />
            </div>
          </button>
          <button 
            className={styles.brandCard}
            onClick={() => setActiveBrand('Chevrolet')}
          >
            <div className={styles.brandImageWrapper}>
              <Image src="/img/ChevroletLogo.png" alt="Chevrolet" width={200} height={80} className={styles.brandImage} />
            </div>
          </button>
        </div>
      </section>

      <CarModelModal 
        isOpen={activeBrand === 'Hyundai'} 
        onClose={() => setActiveBrand(null)} 
        brandName="Hyundai"
        logoSrc="/img/HyundaiLogo.png"
        models={HYUNDAI_MODELS}
      />

      <CarModelModal 
        isOpen={activeBrand === 'KIA'} 
        onClose={() => setActiveBrand(null)} 
        brandName="KIA"
        logoSrc="/img/KiaLogo.png"
        models={KIA_MODELS}
      />

      <CarModelModal 
        isOpen={activeBrand === 'Chevrolet'} 
        onClose={() => setActiveBrand(null)} 
        brandName="Chevrolet"
        logoSrc="/img/ChevroletLogo.png"
        models={CHEVROLET_MODELS}
      />
    </>
  );
}
