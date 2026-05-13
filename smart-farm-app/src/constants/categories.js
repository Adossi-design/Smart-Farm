export const DEFAULT_PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Livestock',
  'Meat',
  'Food Products',
  'Local Products'
];

export const getProductCategories = (products = []) => {
  const discovered = products
    .map((product) => (product?.category || '').trim())
    .filter(Boolean);

  const unique = new Set([...DEFAULT_PRODUCT_CATEGORIES, ...discovered]);
  return Array.from(unique);
};
