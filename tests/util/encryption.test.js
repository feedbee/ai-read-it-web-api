const Encryption = require('../../src/util/encryption');

describe('Encryption class constructor validation', () => {
  test('throws error if encryptionSecret length is not 96 characters', () => {
    expect(() => {
      new Encryption('short');
    }).toThrow('Encryption secret must be 96 characters long (64 for key + 32 for IV in hex).');
  });
});

describe('Encryption and decryption process', () => {
    const encryptionSecret = Encryption.generateEncryptionSecret();
    const encryptor = new Encryption(encryptionSecret);
    const originalText = 'Hello, world!';
  
    test('encrypts and decrypts text correctly', () => {
      const encryptedText = encryptor.encrypt(originalText);
      const decryptedText = encryptor.decrypt(encryptedText);
  
      expect(decryptedText).toBe(originalText);
    });
  });
  