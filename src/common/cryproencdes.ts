import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import bcrypt from 'bcrypt'
const saltRounds = 10;
import crypto from 'crypto';

const secratkey = 'my secrate key';

export async function encryptold(password: string) {
  const iv = randomBytes(16);
  const key = (await promisify(scrypt)(secratkey, 'salt', 32)) as Buffer;
  const cipher = createCipheriv('aes-256-ctr', key, iv);

  const encryptedText = Buffer.concat([
    cipher.update(password),
    cipher.final(),
  ]);
  return encryptedText;
}

export function decryptold(password: any) {
  const iv = randomBytes(16);
  const decipher = createDecipheriv('aes-256-ctr', secratkey, iv);
  const decryptedText = Buffer.concat([
    decipher.update(password),
    decipher.final(),
  ]);
  return decryptedText;
}

export function removeEmpty(obj: any) {
  const newObj = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === Object(v)) {
      if (Object.keys(v).length > 0) newObj[k] = this.removeEmpty(v);
    } else if (v != null) {
      if (typeof v == 'string') {
        if (v.length > 0) newObj[k] = obj[k];
      }
    }
  });
  return newObj;
}

const ENCRYPTION_KEY = 'bf3c199c2470cb477d907b1e0917c17b';
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text) {

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}
export function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv,
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

