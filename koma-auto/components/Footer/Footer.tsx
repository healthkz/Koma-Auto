import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.column}>
          <Link href="/" className={styles.logoWrapper}>
            <Image
              src="/img/LogoKomaKZ.png"
              alt="Koma.kz Auto Parts"
              width={150}
              height={50}
              className={styles.logoImage}
            />
          </Link>
          <p className={styles.desc}>
            Ваш надежный партнер в мире автозапчастей. Широкий ассортимент, быстрая доставка и гарантия качества.
          </p>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>Покупателям</h3>
          <ul className={styles.list}>
            <li><Link href="/">Главная</Link></li>
            <li><Link href="/catalog">Каталог товаров</Link></li>
            <li><Link href="/cart">Корзина</Link></li>
            <li><Link href="/delivery">Доставка и оплата</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3 className={styles.title}>Контакты</h3>
          <ul className={styles.contactList}>
            <li>
              <Phone size={18} />
              <a href="tel:+77771723377">+7 777 172 3377</a>
            </li>
            <li>
              <Mail size={18} />
              <a href="mailto:koma.auto.kz@gmail.com">koma.auto.kz@gmail.com</a>
            </li>
            <li>
              <MapPin size={18} />
              <span>г. Алматы, ТЦ Car City, 4 ярус 138 бутик</span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Koma.kz. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
