import { Layers, ShoppingCart } from 'lucide-react';

export const LIBRARY_MENU_ITEMS = [
  {
    id: 'collection',
    name: 'Collection',
    shortName: 'Collection',
    icon: Layers,
    path: '/library',
  },
  {
    id: 'cart',
    name: 'Cart',
    shortName: 'Cart',
    icon: ShoppingCart,
    path: '/library/cart',
  },
];