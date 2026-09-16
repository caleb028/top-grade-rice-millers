/**
 * Server-side input validation and sanitization utility for Top Grade Rice Millers.
 */

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/;

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

/**
 * Escapes HTML characters to prevent stored or reflected XSS.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips HTML tags and null bytes, and trims the string.
 */
export function stripHtml(val: unknown, maxLength = 2000): string {
  if (typeof val !== 'string') return '';
  const clean = val
    .replace(/\0/g, '') // remove null bytes
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .trim();
  return clean.slice(0, maxLength);
}

/**
 * Sanitizes general user text input (trims, strips HTML tags, bounds length).
 */
export function sanitizeText(val: unknown, maxLength = 1000): string {
  return stripHtml(val, maxLength);
}

/**
 * Validates email format and length.
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const clean = email.trim();
  if (clean.length < 5 || clean.length > 100) return false;
  return EMAIL_REGEX.test(clean);
}

/**
 * Validates phone numbers (Kenyan standard and international).
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;
  const clean = phone.trim().replace(/\s+/g, '');
  if (clean.length < 8 || clean.length > 20) return false;
  return PHONE_REGEX.test(clean);
}

/**
 * Validates identifier/slug strings to prevent path traversal and database injection.
 */
export function isValidSafeId(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  const clean = id.trim();
  return SAFE_ID_REGEX.test(clean);
}

/**
 * Clamps numeric values to a safe min-max range.
 */
export function clampNumber(
  val: unknown,
  min: number,
  max: number,
  defaultValue: number
): number {
  const num = Number(val);
  if (isNaN(num)) return defaultValue;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}
