const crypto = require('crypto');

// const secretKey = crypto.randomBytes(32); // for AES-256
// const iv = crypto.randomBytes(16); // AES block size

class Encryption {
  constructor(encryptionSecret) {
    if (encryptionSecret.length !== 96) { // 64 chars for key (32 bytes) + 32 chars for IV (16 bytes) in hex
      throw new Error('Encryption secret must be 96 characters long (64 for key + 32 for IV in hex).');
    }

    // Extract secretKey (first 64 chars) and IV (next 32 chars) from the hex string
    this.secretKey = Buffer.from(encryptionSecret.slice(0, 64), 'hex');
    this.iv = Buffer.from(encryptionSecret.slice(64, 96), 'hex');
  }

  static generateEncryptionSecret() {
    const secretKey = crypto.randomBytes(32).toString('hex'); // Generate secretKey (32 bytes) as hex
    const iv = crypto.randomBytes(16).toString('hex');        // Generate IV (16 bytes) as hex
    return secretKey + iv;                                    // Combine secretKey and IV hex strings
  }

  encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', this.secretKey, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.secretKey, this.iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

module.exports = Encryption;
