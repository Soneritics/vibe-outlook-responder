/**
 * Simple encryption utilities for API key storage
 * Uses AES-GCM encryption with a derived key from the user's mailbox address
 * This provides obfuscation - the key is tied to the user's account
 */

const SALT = 'outlook-addin-v1';
const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12;
const ENCRYPTION_PREFIX = 'enc:';

/**
 * Check if Web Crypto API is available
 */
function isCryptoAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    crypto.subtle !== undefined &&
    typeof crypto.subtle.importKey === 'function'
  );
}

/**
 * Get a unique identifier for the current user
 * Falls back to a constant if Office is not available
 */
function getUserIdentifier(): string {
  try {
    if (
      typeof Office !== 'undefined' &&
      Office.context?.mailbox?.userProfile?.emailAddress
    ) {
      return Office.context.mailbox.userProfile.emailAddress;
    }
  } catch {
    // Ignore errors
  }
  // Fallback for development/testing
  return 'local-development-user';
}

/**
 * Derive an encryption key from the user identifier
 */
async function deriveKey(userIdentifier: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userIdentifier + SALT),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string value
 * @param plaintext - The string to encrypt
 * @returns Prefixed encrypted string, or base64-encoded plaintext if crypto unavailable
 */
export async function encrypt(plaintext: string): Promise<string> {
  // Fallback for test environment without Web Crypto API
  if (!isCryptoAvailable()) {
    return ENCRYPTION_PREFIX + btoa(plaintext);
  }

  try {
    const userIdentifier = getUserIdentifier();
    const key = await deriveKey(userIdentifier);
    const encoder = new TextEncoder();

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoder.encode(plaintext)
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Return with prefix + base64
    return ENCRYPTION_PREFIX + btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string value
 * @param ciphertext - Prefixed encrypted string
 * @returns Decrypted string
 */
export async function decrypt(ciphertext: string): Promise<string> {
  // Check for prefix
  if (!ciphertext.startsWith(ENCRYPTION_PREFIX)) {
    // Not encrypted, return as-is (backwards compatibility)
    return ciphertext;
  }

  const encoded = ciphertext.slice(ENCRYPTION_PREFIX.length);

  // Fallback for test environment without Web Crypto API
  if (!isCryptoAvailable()) {
    return atob(encoded);
  }

  try {
    const userIdentifier = getUserIdentifier();
    const key = await deriveKey(userIdentifier);

    // Decode base64
    const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encrypted);

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if a string appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  return value?.startsWith(ENCRYPTION_PREFIX) ?? false;
}
