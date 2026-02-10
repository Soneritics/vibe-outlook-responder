/**
 * Simple encryption utilities for API key storage
 * Uses AES-GCM encryption with a derived key from the user's mailbox address
 * This provides obfuscation - the key is tied to the user's account
 */
/**
 * Encrypt a string value
 * @param plaintext - The string to encrypt
 * @returns Prefixed encrypted string, or base64-encoded plaintext if crypto unavailable
 */
export declare function encrypt(plaintext: string): Promise<string>;
/**
 * Decrypt a string value
 * @param ciphertext - Prefixed encrypted string
 * @returns Decrypted string
 */
export declare function decrypt(ciphertext: string): Promise<string>;
/**
 * Check if a string appears to be encrypted
 */
export declare function isEncrypted(value: string): boolean;
//# sourceMappingURL=encryption.d.ts.map