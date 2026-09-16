import crypto from 'crypto';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 64; // 64 bytes for SHA-512
const DIGEST = 'sha512';
const SALT_BYTES = 32;

/**
 * Hashes a plaintext password using PBKDF2 with SHA-512 and a cryptographically random salt.
 * Returns a string formatted as: `saltHex:hashHex`
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(SALT_BYTES, (err, saltBuffer) => {
      if (err) return reject(err);
      const salt = saltBuffer.toString('hex');
      crypto.pbkdf2(
        password,
        salt,
        PBKDF2_ITERATIONS,
        KEY_LENGTH,
        DIGEST,
        (err2, derivedKey) => {
          if (err2) return reject(err2);
          resolve(`${salt}:${derivedKey.toString('hex')}`);
        }
      );
    });
  });
}

/**
 * Verifies a password attempt against a stored hash using constant-time comparison.
 * Supports legacy plaintext migration safely.
 */
export async function verifyPassword(
  attempt: string,
  storedHash: string
): Promise<boolean> {
  if (!storedHash || !attempt) return false;

  // Handle legacy plaintext passwords during initial migration
  if (!storedHash.includes(':')) {
    const attemptBuf = Buffer.from(attempt);
    const storedBuf = Buffer.from(storedHash);
    if (attemptBuf.length !== storedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(attemptBuf, storedBuf);
  }

  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;

  return new Promise((resolve) => {
    crypto.pbkdf2(
      attempt,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      DIGEST,
      (err, derivedKey) => {
        if (err) return resolve(false);
        const attemptHash = derivedKey.toString('hex');

        const originalBuf = Buffer.from(originalHash, 'hex');
        const attemptBuf = Buffer.from(attemptHash, 'hex');

        if (originalBuf.length !== attemptBuf.length) {
          return resolve(false);
        }

        try {
          resolve(crypto.timingSafeEqual(originalBuf, attemptBuf));
        } catch {
          resolve(false);
        }
      }
    );
  });
}

/**
 * Performs constant-time comparison of two strings to prevent timing attacks.
 */
export function safeStringCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
