/**
 * Implements functions to encrypt, decrypt and hash text
 */
import crypto = require("crypto");
import { promisify } from "util";

const pbkdf2 = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);

/**
 * Encryption and Hashing Configuration
 */
const config = {
  /** Encryption Algorithm */
  algorithm: "aes-256-ctr",
  /** Hash algorithm */
  digest: "sha512",
  /** size of the generated hash */
  hashBytes: 32,
  /** pbkdf2 iterations */
  iterations: 70000,
  /** Encryption Key Length */
  keyLen: 32,
  /** IV Length */
  ivLen: 16,
  /** size of salt used */
  saltBytes: 16
};

/**
 * Generates an AES cryptographic key.
 * @returns The random key bytes generated as a buffer.
 */
export async function genEncryptKey(): Promise<Buffer> {
  return (await randomBytes(config.keyLen));
}

/**
 * Derives an encryption key from user password, and encrypts
 * the master key with this key. Returns the encrypted string
 * in the following format:
 * <saltLength><ivLength><salt><iv><encryptedMasterKey>
 * @param masterKey The key to be encrypted
 * @param password password used to encrypt the key.
 * @returns The encrypted master key,
 */
export async function encryptMasterKey(masterKey: Buffer,
                                       password: Buffer): Promise<Buffer> {
  const salt = await randomBytes(config.saltBytes);
  const derivedKey = await pbkdf2(password,
    salt,
    config.iterations,
    config.keyLen,
    config.digest);

  const iv = await randomBytes(config.ivLen);
  const cipher = crypto.createCipheriv(config.algorithm, derivedKey, iv);

  let crypted = cipher.update(masterKey);
  crypted = Buffer.concat([crypted, cipher.final()]);

  const lengths = Buffer.alloc(8);

  lengths.writeUInt32BE(salt.length, 0, true);
  lengths.writeUInt32BE(iv.length, 4, true);

  return Buffer.concat([lengths, salt, iv, crypted]);
}

/**
 * Decrypts a master key from data encrypted using
 * `encryptMasterKey()`.
 * @param text The encrypted master key
 * @param key The password used to encrypt the maser key
 * @returns Decrypted master key
 */
export async function decryptMasterKey(encrypted: Buffer,
                                       password: Buffer): Promise<Buffer> {
  const saltLen = encrypted.readUInt32BE(0);
  const ivLen = encrypted.readUInt32BE(4);

  const salt = encrypted.slice(8, 8 + saltLen);
  const iv = encrypted.slice(8 + saltLen, 8 + saltLen + ivLen);
  const encryptedText = encrypted.slice(8 + saltLen + ivLen);

  const derivedKey = await pbkdf2(password,
    salt,
    config.iterations,
    config.hashBytes,
    config.digest);
  const decipher = crypto.createDecipheriv(config.algorithm, derivedKey, iv);
  const dec = decipher.update(encryptedText);
  return Buffer.concat([dec, decipher.final()]);
}

/**
 * Encrypts utf-8 text, and returns the encrypted text
 * as a buffer.
 * @param text The utf-8 text to encrypt
 * @param masterKey Key used to encrypt the text
 * @returns The encrypted text
 */
export async function encryptText(text: Buffer,
                                  masterKey: Buffer): Promise<Buffer> {
  const iv = await randomBytes(config.ivLen);
  const cipher = crypto.createCipheriv(config.algorithm, masterKey, iv);

  let crypted = cipher.update(text);
  crypted = Buffer.concat([crypted, cipher.final()]);

  const ivLength = Buffer.alloc(4);
  ivLength.writeUInt32BE(iv.length, 0, true);

  return Buffer.concat([ivLength, iv, crypted]);
}

/**
 * Decrypts text encrypted using `encryptText()`
 * @param text Encrypted text to decrypt
 * @param masterKey Key for decrypting the text
 * @returns The decrypted text as a buffer
 */
export function decryptText(text: Buffer,
                            masterKey: Buffer): Buffer {
  const ivLen = text.readUInt32BE(0);
  const iv = text.slice(4, 4 + ivLen);
  const encryptedText = text.slice(4 + ivLen);

  const decipher = crypto.createDecipheriv(config.algorithm, masterKey, iv);
  const dec = decipher.update(encryptedText);
  return Buffer.concat([dec, decipher.final()]);
}
/**
 * Hashes password with pbkdf2. Returns a hex string in following format:
 * <saltlength><Iterations><salt><hash>
 * @param password Password to hash
 * @returns The salted hash as a string
 */
export async function hashPassword(password: string): Promise<string> {

  // generate a salt for pbkdf2
  const salt = await randomBytes(config.saltBytes);

  const hash = await pbkdf2(password,
    salt,
    config.iterations,
    config.hashBytes,
    config.digest);

  const lengths = Buffer.alloc(8);

  // include the size of the salt so that we can, during verification,
  // figure out how much of the hash is salt
  lengths.writeUInt32BE(salt.length, 0, true);
  // similarly, include the iteration count
  lengths.writeUInt32BE(config.iterations, 4, true);

  return Buffer.concat([lengths, salt, hash]).toString("hex");
}

/**
 * Verifies a password against a pbkdf2 hash.
 * @param password The password to verify against combinedHash
 * @param combinedHash The combinedHash generated by hashPassword()
 * @returns True if the password matches the hash, else false.
 */
export async function verifyPassword(
  password: string,
  combinedHash: string): Promise<boolean> {

  // generate buffer from hash string
  const combined: Buffer = Buffer.from(combinedHash, "hex");
  // extract the salt and hash from the combined buffer
  const saltBytes = combined.readUInt32BE(0);
  const hashBytes = combined.length - saltBytes - 8;
  const iterations = combined.readUInt32BE(4);
  const salt = combined.slice(8, saltBytes + 8);
  const hash = combined.toString("binary", saltBytes + 8);

  // verify the salt and hash against the password
  const verify = await pbkdf2(password,
    salt,
    iterations,
    hashBytes,
    config.digest);

  return verify.toString("binary") === hash;

}
