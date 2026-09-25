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

/**
 * Resizes and optimizes an image File to a lightweight base64 Data URL (max 600x600px JPEG, ~40KB).
 */
export function compressImageFile(file: File, maxWidth = 600, maxHeight = 600, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file (PNG, JPG, WEBP, etc.)'));
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(readerEvent.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(readerEvent.target?.result as string);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

