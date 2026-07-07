import { create } from 'zustand';

const CART_STORAGE_KEY = 'zinko_library_cart';
const CART_ALERT_KEY = 'zinko_library_cart_alert_pending';
const CART_UNSEEN_COUNT_KEY = 'zinko_library_cart_unseen_count';

function loadCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out avatars since they are free/obtained by default now
      return parsed.filter(item => item.item_type !== 'avatar');
    }
    return [];
  } catch {
    return [];
  }
}

function persistCart(items) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota errors.
  }
}

function loadUnseenCount() {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(CART_UNSEEN_COUNT_KEY);
    const count = Number.parseInt(raw ?? '', 10);
    return Number.isFinite(count) && count > 0 ? count : 0;
  } catch {
    return 0;
  }
}

function persistUnseenCount(count) {
  if (typeof window === 'undefined') return;
  try {
    if (count > 0) {
      localStorage.setItem(CART_UNSEEN_COUNT_KEY, String(count));
    } else {
      localStorage.removeItem(CART_UNSEEN_COUNT_KEY);
    }
  } catch {
    // Ignore quota errors.
  }
}

function loadCartAlertPending() {
  return loadUnseenCount() > 0;
}

function persistCartAlertPending(pending) {
  if (typeof window === 'undefined') return;
  try {
    if (pending) {
      localStorage.setItem(CART_ALERT_KEY, '1');
    } else {
      localStorage.removeItem(CART_ALERT_KEY);
    }
  } catch {
    // Ignore quota errors.
  }
}

function cartItemKey(item) {
  return `${item.item_type}:${item.slug}`;
}

function mergeCartItems(memoryItems = [], storedItems = []) {
  const merged = new Map();
  [...storedItems, ...memoryItems].forEach((entry) => {
    if (entry?.slug && entry?.item_type) {
      merged.set(cartItemKey(entry), entry);
    }
  });
  return Array.from(merged.values());
}

export const useLibraryCartStore = create((set, get) => ({
  items: [],
  cartAlertPending: false,
  cartAlertCount: 0,

  hydrateCart: () => {
    const items = loadCart();
    // Ensure alert count doesn't exceed actual items if we filtered avatars out
    const cartAlertCount = Math.min(loadUnseenCount(), items.length);
    
    set({
      items,
      cartAlertCount,
      cartAlertPending: cartAlertCount > 0,
    });
    
    // Resync local storage in case we removed items
    persistCart(items);
    persistUnseenCount(cartAlertCount);
    persistCartAlertPending(cartAlertCount > 0);
  },

  markCartSeen: () => {
    set({ cartAlertPending: false, cartAlertCount: 0 });
    persistUnseenCount(0);
    persistCartAlertPending(false);
  },

  addItem: (item) => {
    if (!item?.slug || !item?.item_type || item.owned) return false;

    const key = cartItemKey(item);
    const currentItems = mergeCartItems(get().items, loadCart());
    const existing = currentItems.find((entry) => cartItemKey(entry) === key);
    if (existing) return false;

    const nextItem = {
      item_type: item.item_type,
      slug: item.slug,
      name: item.name,
      image: item.image || item.image_url || null,
      price_cents: item.price_cents ?? 0,
      currency: item.currency || 'usd',
    };

    const items = [...currentItems, nextItem];
    const cartAlertCount = get().cartAlertCount + 1;

    set({
      items,
      cartAlertPending: true,
      cartAlertCount,
    });
    persistCart(items);
    persistUnseenCount(cartAlertCount);
    persistCartAlertPending(true);
    return true;
  },

  removeItem: (itemType, slug) => {
    const items = get().items.filter(
      (entry) => !(entry.item_type === itemType && entry.slug === slug)
    );

    if (items.length === 0) {
      set({ items, cartAlertPending: false, cartAlertCount: 0 });
      persistCart(items);
      persistUnseenCount(0);
      persistCartAlertPending(false);
      return;
    }

    set({ items });
    persistCart(items);
  },

  clearCart: () => {
    set({ items: [], cartAlertPending: false, cartAlertCount: 0 });
    persistCart([]);
    persistUnseenCount(0);
    persistCartAlertPending(false);
  },

  hasItem: (itemType, slug) => {
    const key = `${itemType}:${slug}`;
    return get().items.some((entry) => cartItemKey(entry) === key);
  },

  itemCount: () => get().items.length,
}));