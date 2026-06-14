import { Metadata } from 'next';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: 'Корзина - Koma.kz',
};

export default function CartPage() {
  return <CartClient />;
}
