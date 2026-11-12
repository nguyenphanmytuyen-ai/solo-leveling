import { QUEST_PACKAGES, QuestPackageDef, FULL_PARTY_COMBO_ID, FULL_PARTY_DISCOUNT_PERCENT } from '../data/questPackages.js';

export interface CartCalculationResult {
  items: Array<{
    id: string;
    title: string;
    price: number;
    isCombo?: boolean;
    packageCount?: number;
    color?: string;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  couponMessage?: string;
  isCouponValid: boolean;
  potentialXp: number;
  canBuyCombo: boolean;
  comboPrice: number;
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.max(0, Math.round(amount))) + ' ₫';
}

/**
 * Calculates unowned packages for the user.
 */
export function getUnownedPackages(unlockedPackages: string[]): QuestPackageDef[] {
  return QUEST_PACKAGES.filter(p => !unlockedPackages.includes(p.id));
}

/**
 * Calculates the dynamically discounted combo price.
 * Formula: 80% of the sum of prices of unowned packages, rounded down to nearest thousand VND.
 */
export function calculateComboPrice(unlockedPackages: string[]): { price: number; canBuy: boolean } {
  const unowned = getUnownedPackages(unlockedPackages);
  if (unowned.length < 3) {
    return { price: 0, canBuy: false };
  }

  const rawSum = unowned.reduce((sum, p) => sum + p.price, 0);
  const discounted = rawSum * ((100 - FULL_PARTY_DISCOUNT_PERCENT) / 100);
  // Round down to thousands
  const roundedDown = Math.floor(discounted / 1000) * 1000;

  return { price: roundedDown, canBuy: true };
}

export function calculateCart(
  cartIds: string[],
  unlockedPackages: string[],
  couponCode: string | null = null
): CartCalculationResult {
  const unowned = getUnownedPackages(unlockedPackages);
  const { price: dynamicComboPrice, canBuy: canBuyCombo } = calculateComboPrice(unlockedPackages);

  const items: CartCalculationResult['items'] = [];
  let subtotal = 0;
  let potentialXp = 0;

  for (const id of cartIds) {
    if (id === FULL_PARTY_COMBO_ID) {
      if (canBuyCombo) {
        items.push({
          id: FULL_PARTY_COMBO_ID,
          title: `Combo Full Party (${unowned.length} Gói chưa sở hữu)`,
          price: dynamicComboPrice,
          isCombo: true,
          packageCount: unowned.length,
          color: '#7C3AED',
        });
        subtotal += dynamicComboPrice;
        for (const p of unowned) {
          potentialXp += p.tasks.reduce((sum, t) => sum + t.xp, 0) + p.clearBonusXp;
        }
      }
    } else {
      const pkg = QUEST_PACKAGES.find(p => p.id === id);
      if (pkg && !unlockedPackages.includes(pkg.id)) {
        items.push({
          id: pkg.id,
          title: pkg.title,
          price: pkg.price,
          color: pkg.color,
        });
        subtotal += pkg.price;
        potentialXp += pkg.tasks.reduce((sum, t) => sum + t.xp, 0) + pkg.clearBonusXp;
      }
    }
  }

  let discount = 0;
  let isCouponValid = false;
  let couponMessage = undefined;

  if (couponCode && couponCode.trim()) {
    const code = couponCode.trim().toUpperCase();
    if (code === 'LEVELUP10') {
      discount = Math.round(subtotal * 0.1);
      isCouponValid = true;
      couponMessage = 'Mã LEVELUP10: Giảm 10% tổng đơn hàng!';
    } else if (code === 'FRESHMAN') {
      if (subtotal >= 20000) {
        discount = 5000;
        isCouponValid = true;
        couponMessage = 'Mã FRESHMAN: Giảm 5.000 ₫ cho đơn từ 20.000 ₫!';
      } else {
        isCouponValid = false;
        couponMessage = 'Mã FRESHMAN chỉ áp dụng cho đơn hàng từ 20.000 ₫.';
      }
    } else {
      isCouponValid = false;
      couponMessage = 'Mã giảm giá không hợp lệ.';
    }
  }

  const total = Math.max(0, subtotal - discount);

  return {
    items,
    subtotal,
    discount,
    total,
    couponMessage,
    isCouponValid,
    potentialXp,
    canBuyCombo,
    comboPrice: dynamicComboPrice,
  };
}
