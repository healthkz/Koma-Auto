import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Оформление заказа - Koma.kz',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
