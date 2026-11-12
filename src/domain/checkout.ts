import { GameState, Order, OrderItem } from '../store/types.js';
import { calculateCart, getUnownedPackages } from './cart.js';
import { FULL_PARTY_COMBO_ID } from '../data/questPackages.js';

export function generateOrderId(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SL-${y}${m}${d}-${randomSuffix}`;
}

export interface ProcessCheckoutResult {
  order: Order;
  newlyUnlockedPackageIds: string[];
  nextUnlockedPackages: string[];
  nextCart: string[];
}

export function processCheckout(
  state: GameState,
  paymentMethod: 'card' | 'wallet' | 'bank',
  characterName: string,
  now: Date = new Date()
): ProcessCheckoutResult {
  const cartCalc = calculateCart(state.cart, state.unlockedPackages, state.appliedCoupon);

  const orderItems: OrderItem[] = [];
  const newlyUnlockedSet = new Set<string>();

  for (const item of cartCalc.items) {
    if (item.id === FULL_PARTY_COMBO_ID) {
      const unowned = getUnownedPackages(state.unlockedPackages);
      for (const p of unowned) {
        newlyUnlockedSet.add(p.id);
      }
      orderItems.push({
        packageId: FULL_PARTY_COMBO_ID,
        title: item.title,
        price: item.price,
      });
    } else {
      if (!state.unlockedPackages.includes(item.id)) {
        newlyUnlockedSet.add(item.id);
        orderItems.push({
          packageId: item.id,
          title: item.title,
          price: item.price,
        });
      }
    }
  }

  const orderId = generateOrderId(now);
  const order: Order = {
    id: orderId,
    items: orderItems,
    subtotal: cartCalc.subtotal,
    discount: cartCalc.discount,
    total: cartCalc.total,
    couponCode: state.appliedCoupon || undefined,
    paymentMethod,
    createdAt: now.toISOString(),
    characterName: characterName || state.profile.nickname || 'Adventurer',
  };

  const newlyUnlockedPackageIds = Array.from(newlyUnlockedSet);
  const nextUnlockedPackages = Array.from(
    new Set([...state.unlockedPackages, ...newlyUnlockedPackageIds])
  );

  return {
    order,
    newlyUnlockedPackageIds,
    nextUnlockedPackages,
    nextCart: [], // Cart is cleared after successful unlock
  };
}
