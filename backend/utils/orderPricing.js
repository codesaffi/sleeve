export const DELIVERY_CHARGE = 200;

export const calculateOrderTotals = (subtotal, discountAmount = 0, hasItems = true) => {
    if (!Number.isFinite(Number(subtotal)) || Number(subtotal) < 0) {
        throw new Error("Order subtotal must be a non-negative number.");
    }
    if (!Number.isFinite(Number(discountAmount)) || Number(discountAmount) < 0 || Number(discountAmount) > Number(subtotal)) {
        throw new Error("Order discount must be between zero and the subtotal.");
    }

    const normalizedSubtotal = Number(subtotal);
    const normalizedDiscount = Number(discountAmount);
    return {
        subtotal: normalizedSubtotal,
        discountAmount: normalizedDiscount,
        deliveryCharge: hasItems ? DELIVERY_CHARGE : 0,
        total: normalizedSubtotal - normalizedDiscount + (hasItems ? DELIVERY_CHARGE : 0),
    };
};
