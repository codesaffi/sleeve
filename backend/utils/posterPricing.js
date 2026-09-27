const positiveNumber = (value) => Number.isFinite(Number(value)) && Number(value) > 0;

export const isPosterProduct = (product) => product?.category === "Wall Posters";

export const getPosterPricing = (product) => {
    const minimumQuantity = product.minimumPosterQuantity == null ? 1 : Number(product.minimumPosterQuantity);
    const baseQuantity = product.basePosterQuantity == null ? minimumQuantity : Number(product.basePosterQuantity);
    const basePrice = product.basePosterPrice == null ? Number(product.price) || 0 : Number(product.basePosterPrice);
    const singlePosterPrice = product.singlePosterPrice == null ? Number(product.price) || 0 : Number(product.singlePosterPrice);

    return { minimumQuantity, baseQuantity, basePrice, singlePosterPrice };
};

export const validatePosterPricing = ({ minimumQuantity, baseQuantity, basePrice, singlePosterPrice }) => {
    if (!Number.isInteger(Number(minimumQuantity)) || Number(minimumQuantity) < 1) {
        return "Minimum poster quantity must be a positive whole number.";
    }
    if (!Number.isInteger(Number(baseQuantity)) || Number(baseQuantity) !== Number(minimumQuantity)) {
        return "Base quantity must match the minimum poster quantity.";
    }
    if (!positiveNumber(basePrice)) return "Base poster price must be a positive number.";
    if (!positiveNumber(singlePosterPrice)) return "Single poster price must be a positive number.";
    return null;
};

export const calculatePosterPrice = (product, quantity) => {
    const { minimumQuantity, baseQuantity, basePrice, singlePosterPrice } = getPosterPricing(product);
    const validationError = validatePosterPricing({
        minimumQuantity,
        baseQuantity,
        basePrice,
        singlePosterPrice,
    });
    if (validationError) throw new Error(`Invalid poster pricing: ${validationError}`);
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < minimumQuantity) {
        throw new Error(`Minimum order quantity is ${minimumQuantity} posters.`);
    }

    return basePrice + (Number(quantity) - minimumQuantity) * singlePosterPrice;
};

export const validatePosterDesignBatch = (product, quantity, designs) => {
    const minimumQuantity = getPosterPricing(product).minimumQuantity;
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < minimumQuantity) {
        return `Minimum order quantity is ${minimumQuantity} posters.`;
    }
    if (!Array.isArray(designs) || designs.length !== Number(quantity)) {
        return `You selected ${quantity} posters. Please provide exactly ${quantity} designs.`;
    }
    return null;
};

export const validateUniqueGalleryDesignAssignments = (batches) => {
    const assignedDesignIds = new Set();
    for (const batch of batches) {
        for (const design of batch.designs || []) {
            if (design?.type !== "gallery" || !design.galleryDesignId) continue;
            const designId = String(design.galleryDesignId);
            if (assignedDesignIds.has(designId)) {
                return "A Gallery design cannot be assigned to more than one poster group.";
            }
            assignedDesignIds.add(designId);
        }
    }
    return null;
};
