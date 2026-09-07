import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryName(categoryOrItem: any, fallback: string = 'General'): string {
  if (!categoryOrItem) return fallback;
  if (typeof categoryOrItem === 'string') return categoryOrItem;
  if (typeof categoryOrItem === 'object') {
    if (typeof categoryOrItem.name === 'string') return categoryOrItem.name;
    if (typeof categoryOrItem.categoryName === 'string') return categoryOrItem.categoryName;
    if (typeof categoryOrItem.title === 'string') return categoryOrItem.title;
    if (typeof categoryOrItem.category === 'string') return categoryOrItem.category;
    if (typeof categoryOrItem.category === 'object' && categoryOrItem.category !== null) {
      if (typeof categoryOrItem.category.name === 'string') return categoryOrItem.category.name;
    }
  }
  return fallback;
}
