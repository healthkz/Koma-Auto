'use client';

import React from 'react';
import Image from 'next/image';
import styles from './LocationMap.module.css';

export default function LocationMap() {
  const mapUrl = "https://widgets.2gis.com/widget?type=firmsonmap&options=%7B%22pos%22%3A%7B%22lat%22%3A43.23943484010419%2C%22lon%22%3A76.82228565216066%2C%22zoom%22%3A16%7D%2C%22opt%22%3A%7B%22city%22%3A%22almaty%22%7D%2C%22org%22%3A%2270000001018022676%22%7D";

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.mapCol}>
          <h3 className={styles.title}>Схема проезда:</h3>
          <div className={styles.mapFrame}>
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '350px' }}
              title="Схема проезда 2GIS"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
        <div className={styles.infoCol}>
          <div className={styles.address}>
            2GIS: Алматы, Ауэзовский район, Микрорайон Баянауыл 57а,
            ТЦ Car City
          </div>
          <div className={styles.hoursGrid}>
            <div className={styles.hoursColumn}>
              <div className={styles.hoursItem}>
                <span className={styles.day}>Понедельник</span>
                <span className={styles.time}>09:00–18:00</span>
              </div>
              <div className={styles.hoursItem}>
                <span className={styles.day}>Вторник</span>
                <span className={styles.time}>09:00–18:00</span>
              </div>
              <div className={styles.hoursItem}>
                <span className={styles.day}>Среда</span>
                <span className={styles.time}>09:00–18:00</span>
              </div>
            </div>

            <div className={styles.hoursColumn}>
              <div className={styles.hoursItem}>
                <span className={styles.day}>Четверг</span>
                <span className={styles.time}>09:00–18:00</span>
              </div>
              <div className={styles.hoursItem}>
                <span className={styles.day}>Пятница</span>
                <span className={styles.time}>09:00–18:00</span>
              </div>
              <div className={styles.hoursItem}>
                <span className={styles.day}>Суббота</span>
                <span className={styles.time}>09:00–18:00</span>
              </div>
            </div>

            <div className={styles.hoursColumn}>
              <div className={styles.hoursItem}>
                <span className={styles.day}>Воскресенье</span>
                <span className={styles.time}>09:00–18:00</span>
              </div>
              <div className={styles.hoursItem}>
                <span className={styles.day}>Первый понедельник месяца:</span>
                <span className={styles.time}>Закрыто (санитарный день)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.paymentSection}>
        <h3 className={styles.paymentTitle}>Способы оплаты:</h3>
        <div className={styles.paymentGrid}>
          <div className={styles.paymentCard}>
            <Image src="/img/Banks-Logo/visa-1960x622.png" alt="Visa" width={80} height={25} className={styles.paymentLogo} />
          </div>
          <div className={styles.paymentCard}>
            <Image src="/img/Banks-Logo/mastercard-1280x527.png" alt="Mastercard" width={102} height={43} className={styles.paymentLogo} />
          </div>
          <div className={styles.paymentCard}>
            <Image src="/img/Banks-Logo/halyk-674x184.png" alt="Halyk Bank" width={80} height={22} className={styles.paymentLogo} />
          </div>
          <div className={styles.paymentCard}>
            <Image src="/img/Banks-Logo/kaspi-1100x300.png" alt="Kaspi.kz" width={132} height={36} className={styles.paymentLogo} />
          </div>
          <div className={styles.paymentCard}>
            <Image src="/img/Banks-Logo/unionpay-1280x853.png" alt="UnionPay" width={59} height={39} className={styles.paymentLogo} />
          </div>
          <div className={styles.paymentCard}>
            <Image src="/img/Banks-Logo/americanexpress-1920x1509.png" alt="American Express" width={88} height={66} className={styles.paymentLogo} />
          </div>
          <div className={styles.paymentCard}>
            <Image src="/img/Banks-Logo/apple-1200x630.png" alt="Apple Pay" width={83} height={42} className={styles.paymentLogo} />
          </div>
          <div className={styles.paymentCard}>
            <Image src="/img/Banks-Logo/google-280x280.png" alt="Google Pay" width={72} height={72} className={styles.paymentLogo} />
          </div>
          <div className={styles.paymentCard}>
            <Image src="/img/Banks-Logo/samsung-510x528.png" alt="Samsung Pay" width={60} height={60} className={styles.paymentLogo} />
          </div>
        </div>
      </div>
    </>
  );
}
