import { Product } from '../types';

export function isProductInCategory(product: Product, categoryName: string): boolean {
  if (!categoryName || categoryName === 'All') return true;
  if (!product) return false;

  // Strict direct category match
  return product.category === categoryName;
}
