import test from "node:test";
import assert from "node:assert/strict";
import {
    calculatePosterPrice,
    validatePosterPricing,
    validatePosterDesignBatch,
    validateUniqueGalleryDesignAssignments,
} from "../utils/posterPricing.js";
import { calculateOrderTotals, DELIVERY_CHARGE } from "../utils/orderPricing.js";

const product = {
    category: "Wall Posters",
    minimumPosterQuantity: 4,
    basePosterQuantity: 4,
    basePosterPrice: 1000,
    singlePosterPrice: 250,
    price: 1000,
};

test("calculates configured poster prices from base quantity", () => {
    assert.equal(calculatePosterPrice(product, 4), 1000);
    assert.equal(calculatePosterPrice(product, 5), 1250);
    assert.equal(calculatePosterPrice(product, 6), 1500);
    assert.equal(calculatePosterPrice(product, 10), 2500);
});

test("rejects quantities below minimum and invalid quantities", () => {
    for (const quantity of [3, 4.5, NaN, "invalid"]) {
        assert.throws(
            () => calculatePosterPrice(product, quantity),
            { message: "Minimum order quantity is 4 posters." },
        );
    }
});

test("rejects invalid admin poster pricing configuration", () => {
    assert.equal(validatePosterPricing({
        minimumQuantity: 4,
        baseQuantity: 3,
        basePrice: 1000,
        singlePosterPrice: 250,
    }), "Base quantity must match the minimum poster quantity.");
    assert.equal(validatePosterPricing({
        minimumQuantity: 4,
        baseQuantity: 4,
        basePrice: 0,
        singlePosterPrice: 250,
    }), "Base poster price must be a positive number.");
});

test("uses legacy product prices for existing poster documents without pricing fields", () => {
    assert.equal(calculatePosterPrice({ category: "Wall Posters", price: 300 }, 1), 300);
    assert.equal(calculatePosterPrice({ category: "Wall Posters", price: 300 }, 2), 600);
});

test("requires exactly one design for each poster in a batch", () => {
    assert.equal(validatePosterDesignBatch(product, 4, Array(4).fill({ type: "upload", imageUrl: "https://res.cloudinary.com/demo/image/upload/a.jpg" })), null);
    assert.equal(validatePosterDesignBatch(product, 6, Array(5).fill({ type: "upload", imageUrl: "https://res.cloudinary.com/demo/image/upload/a.jpg" })), "You selected 6 posters. Please provide exactly 6 designs.");
    assert.equal(validatePosterDesignBatch(product, 6, Array(7).fill({ type: "upload", imageUrl: "https://res.cloudinary.com/demo/image/upload/a.jpg" })), "You selected 6 posters. Please provide exactly 6 designs.");
    assert.equal(validatePosterDesignBatch(product, 3, Array(3).fill({ type: "upload", imageUrl: "https://res.cloudinary.com/demo/image/upload/a.jpg" })), "Minimum order quantity is 4 posters.");
});

test("rejects the same Gallery design assigned to multiple poster groups", () => {
    assert.match(validateUniqueGalleryDesignAssignments([
        { designs: [{ type: "gallery", galleryDesignId: "design-a" }] },
        { designs: [{ type: "gallery", galleryDesignId: "design-a" }] },
    ]), /cannot be assigned to more than one poster group/);
    assert.equal(validateUniqueGalleryDesignAssignments([
        { designs: [{ type: "gallery", galleryDesignId: "design-a" }] },
        { designs: [{ type: "gallery", galleryDesignId: "design-b" }] },
    ]), null);
});

test("adds one fixed delivery charge after the discount", () => {
    assert.deepEqual(calculateOrderTotals(1000), {
        subtotal: 1000,
        discountAmount: 0,
        deliveryCharge: DELIVERY_CHARGE,
        total: 1200,
    });
    assert.deepEqual(calculateOrderTotals(3000, 300), {
        subtotal: 3000,
        discountAmount: 300,
        deliveryCharge: DELIVERY_CHARGE,
        total: 2900,
    });
    assert.equal(calculateOrderTotals(0, 0, false).deliveryCharge, 0);
    assert.equal(calculateOrderTotals(3000, 300).deliveryCharge, 200);
});
