export const isPosterProduct = (product) => product?.category === "Wall Posters";

export const getPosterMinimum = (product) => {
  const minimum = Number(product?.minimumPosterQuantity);
  return Number.isInteger(minimum) && minimum > 0 ? minimum : 1;
};

export const getPosterPrice = (product, quantity) => {
  const minimum = getPosterMinimum(product);
  const baseQuantity = product?.basePosterQuantity == null ? minimum : Number(product.basePosterQuantity);
  const basePrice = product?.basePosterPrice == null ? Number(product?.price) || 0 : Number(product.basePosterPrice);
  const extraPrice = product?.singlePosterPrice == null ? Number(product?.price) || 0 : Number(product.singlePosterPrice);
  if (baseQuantity !== minimum || !Number.isFinite(basePrice) || basePrice <= 0 || !Number.isFinite(extraPrice) || extraPrice <= 0) return null;
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < minimum) return null;
  return basePrice + (Number(quantity) - minimum) * extraPrice;
};

export const getPosterQuantityFromKey = (key) => {
  const match = key.match(/\|poster::(\d+)/);
  return match ? Number(match[1]) : null;
};
