import { describe, it, expect, vi, afterEach } from "vitest";
import { calculateCartTotal } from "./cart-calculator";

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

const TAX_RATE = 0.8;

const generateItem = (override: Partial<CartItem> = {}): CartItem => ({
  id: "A",
  name: "Sample Product",
  price: 1000,
  quantity: 1,
  ...override,
});

const generateCoupon = (override: Partial<Coupon> = {}): Coupon => ({
  type: "percent",
  value: 10,
  ...override,
});

describe("calculateCartTotal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should calculate total with tax when no coupon", () => {
    // Arrange
    const items = [
      generateItem({ price: 2000, quantity: 2 }),
      generateItem({ price: 5000 }),
    ];

    const subtotal = 2000 * 2 + 5000;
    const expectedTotal = subtotal * (1 + TAX_RATE);

    // Act
    const total = calculateCartTotal(items);

    // Assert
    expect(total).toBe(expectedTotal);
  });

  it("should apply percent coupon before tax when coupon is provided", () => {
    // Arrange
    const items = [
      generateItem({ price: 2000, quantity: 2 }),
      generateItem({ price: 5000 }),
    ];
    const coupon = generateCoupon({ value: 10 });

    const subtotal = 2000 * 2 + 5000;
    const discountedSubtotal = subtotal * (1 - coupon.value / 100);
    const expectedTotal = discountedSubtotal * (1 + TAX_RATE);

    // Act
    const total = calculateCartTotal(items, coupon);

    // Assert
    expect(total).toBe(expectedTotal);
  });

  it("should apply coupon when it is valid", () => {
    // Arrange
    const items = [
      generateItem({ price: 3000 }),
      generateItem({ price: 2000 }),
    ];
    const coupon = generateCoupon({
      value: 10,
      minAmount: 2000,
      expiresAt: new Date("2025-12-31T00:00:00Z"),
    });
    const fixedNow = new Date("2025-01-01T00:00:00Z");
    vi.spyOn(global, "Date").mockImplementation(() => fixedNow);

    const subtotal = 3000 + 2000;
    const discountedSubtotal = subtotal * (1 - coupon.value / 100);
    const expectedTotal = discountedSubtotal * (1 + TAX_RATE);

    // Act
    const total = calculateCartTotal(items, coupon);

    // Assert
    expect(total).toBe(expectedTotal);
  });

  it("should ignore coupon when expired", () => {
    // Arrange
    const items = [generateItem({ price: 5000 })];
    const coupon = generateCoupon({
      value: 10,
      expiresAt: new Date("2024-12-31T23:59:59Z"),
    });
    const fixedNow = new Date("2025-01-01T00:00:00Z");
    vi.spyOn(global, "Date").mockImplementation(() => fixedNow);

    const expectedTotal = 5000 * (1 + TAX_RATE);

    // Act
    const total = calculateCartTotal(items, coupon);

    // Assert
    expect(total).toBe(expectedTotal);
  });

  it("should ignore coupon when subtotal is below minimum", () => {
    // Arrange
    const items = [generateItem({ price: 1000, quantity: 1 })];
    const coupon = generateCoupon({
      value: 10,
      minAmount: 2000,
      expiresAt: new Date("2025-12-31T00:00:00Z"),
    });
    const fixedNow = new Date("2025-01-01T00:00:00Z");
    vi.spyOn(global, "Date").mockImplementation(() => fixedNow);

    const expectedTotal = 1000 * (1 + TAX_RATE);

    // Act
    const total = calculateCartTotal(items, coupon);

    // Assert
    expect(total).toBe(expectedTotal);
  });
});
