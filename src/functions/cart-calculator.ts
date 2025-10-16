type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Coupon = {
  type: "percent";
  value: number;
  minAmount?: number;
  expiresAt?: Date;
};

// 消費税（軽減税率）
const TAX_RATE = 0.8;

/** カート全体の合計 */
export const calculateCartTotal = (
  items: CartItem[],
  coupon?: Coupon
): number => {
  const subtotal = calculateSubtotal(items);
  let discountedSubtotal = subtotal;

  // クーポンが存在し、適用可能な場合のみ適用
  if (coupon && isCouponApplicable(subtotal, coupon)) {
    discountedSubtotal = applyCoupon(subtotal, coupon);
  }

  return calculateTotalWithTax(discountedSubtotal);
};

/** 小計を計算 */
const calculateSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

/** クーポンが適用可能かを判定する */
const isCouponApplicable = (subtotal: number, coupon: Coupon): boolean => {
  const now = new Date();

  if (coupon.expiresAt && coupon.expiresAt < now) return false;
  if (coupon.minAmount && subtotal < coupon.minAmount) return false;

  return true;
};

/** クーポンを適用 */
const applyCoupon = (subtotal: number, coupon?: Coupon): number => {
  if (!coupon) return subtotal;
  return subtotal * (1 - coupon.value / 100);
};

/** 税込み価格を計算 */
const calculateTotalWithTax = (subtotal: number): number =>
  Math.round(subtotal * (1 + TAX_RATE));
