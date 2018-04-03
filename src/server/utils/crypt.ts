import crypto = require("crypto");

const config = {
  // Encryption Algorithm
  algorithm : "aes-256-ctr",
  // Hash algorithm
  digest: "sha512",
  // size of the generated hash
  hashBytes: 32,
  // pbkdf2 iterations
  iterations: 70000,
  // Encryption Key Length
  keyLen: 32,
  // size of salt used
  saltBytes: 16
};

export function encrypt(text: string, password: string) {
  const cipher = crypto.createCipher(config.algorithm, password);
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

export function decrypt(text: string, password: string) {
  const decipher = crypto.createDecipher(config.algorithm, password);
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

export function hashPassword(password: string) {
  /*
  Hashes password with pbkdf2. Returns a hex string in following format:
          "[saltlength][Iterations][salt][hash]"
  */

  // generate a salt for pbkdf2
  const salt = crypto.randomBytes(config.saltBytes);

  const hash = crypto.pbkdf2Sync(password,
                    salt,
                    config.iterations,
                    config.hashBytes,
                    config.digest);

  const combined = new Buffer(hash.length + salt.length + 8);

  // include the size of the salt so that we can, during verification,
  // figure out how much of the hash is salt
  combined.writeUInt32BE(salt.length, 0, true);
  // similarly, include the iteration count
  combined.writeUInt32BE(config.iterations, 4, true);

  salt.copy(combined, 8);
  hash.copy(combined, salt.length + 8);
  return combined.toString("hex");
}

export function verifyPassword(
  password: string,
  combinedHash: string) {
  /*
  Verify Password with combinedHash.
  */

  // generate buffer from hash string
  const combined: Buffer = new Buffer(combinedHash, "hex");
  // extract the salt and hash from the combined buffer
  const saltBytes = combined.readUInt32BE(0);
  const hashBytes = combined.length - saltBytes - 8;
  const iterations = combined.readUInt32BE(4);
  const salt = combined.slice(8, saltBytes + 8);
  const hash = combined.toString("binary", saltBytes + 8);

  // verify the salt and hash against the password
  const verify = crypto.pbkdf2Sync(password,
                                   salt,
                                   iterations,
                                   hashBytes,
                                   config.digest);

  return verify.toString("binary") === hash;

}
