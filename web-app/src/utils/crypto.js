import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

// Static key for symmetric encryption (usernames and OTPs)
const SECRET_KEY = 'antigravity-tagscanner-secure-key-2026';

/**
 * Encrypt plain text using AES
 * @param {string} text 
 * @returns {string} Encrypted ciphertext
 */
export const encryptText = (text) => {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

/**
 * Decrypt AES encrypted ciphertext
 * @param {string} ciphertext 
 * @returns {string} Decrypted plain text
 */
export const decryptText = (ciphertext) => {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error('Decryption failed', err);
    return '';
  }
};

/**
 * Hash password/passcode using bcrypt
 * @param {string} password 
 * @returns {string} Hashed password
 */
export const hashPassword = (password) => {
  if (!password) return '';
  return bcrypt.hashSync(password, 10);
};

/**
 * Verify a password/passcode against its bcrypt hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {boolean} True if matched, false otherwise
 */
export const verifyPassword = (password, hash) => {
  if (!password || !hash) return false;
  try {
    return bcrypt.compareSync(password, hash);
  } catch (err) {
    console.error('Password verification error', err);
    return false;
  }
};
