/**
 * Centralized Validation Utility for Phone Number (10 digits) and Aadhaar Number (12 digits)
 */

/**
 * Extracts only digit characters from a string.
 */
export function cleanDigits(val: string | null | undefined): string {
  if (!val) return '';
  return val.replace(/\D/g, '');
}

/**
 * Normalizes a phone number to standard 10 digits.
 * Handles +91 country prefix (12 digits starting with 91) or leading 0 (11 digits starting with 0).
 */
export function cleanPhone(val: string | null | undefined): string {
  const digits = cleanDigits(val);
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

/**
 * Validates whether a phone number has exactly 10 digits.
 */
export function isValidPhone(val: string | null | undefined): boolean {
  if (!val) return false;
  const digits = cleanPhone(val);
  return digits.length === 10 && /^\d{10}$/.test(digits);
}

/**
 * Normalizes an Aadhaar number to standard 12 digits.
 */
export function cleanAadhar(val: string | null | undefined): string {
  return cleanDigits(val);
}

/**
 * Validates whether an Aadhaar number has exactly 12 digits.
 */
export function isValidAadhar(val: string | null | undefined): boolean {
  if (!val) return false;
  const digits = cleanAadhar(val);
  return digits.length === 12 && /^\d{12}$/.test(digits);
}

/**
 * Formats a 10-digit phone number as standard 10-digit or grouped format.
 */
export function formatPhone(val: string | null | undefined): string {
  const digits = cleanPhone(val);
  if (digits.length <= 5) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  return digits.slice(0, 10);
}

/**
 * Formats a 12-digit Aadhaar number as 'XXXX XXXX XXXX'.
 */
export function formatAadhar(val: string | null | undefined): string {
  const digits = cleanAadhar(val).slice(0, 12);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

/**
 * Returns validation error message for Phone Number, or null if valid.
 */
export function getPhoneValidationError(val: string | null | undefined, isRequired: boolean = true): string | null {
  if (!val || !val.trim()) {
    return isRequired ? 'Phone number is required' : null;
  }
  const digits = cleanPhone(val);
  if (digits.length !== 10) {
    return 'Please enter a valid phone number';
  }
  if (!/^\d{10}$/.test(digits)) {
    return 'Phone number must contain only numeric digits';
  }
  return null;
}

/**
 * Returns validation error message for Aadhaar Number, or null if valid.
 */
export function getAadharValidationError(val: string | null | undefined, isRequired: boolean = true): string | null {
  if (!val || !val.trim()) {
    return isRequired ? 'Aadhaar number is required' : null;
  }
  const digits = cleanAadhar(val);
  if (digits.length !== 12) {
    return 'Please enter a valid Aadhaar number';
  }
  if (!/^\d{12}$/.test(digits)) {
    return 'Aadhaar number must contain only numeric digits';
  }
  return null;
}
