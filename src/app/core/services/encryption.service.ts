import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private key = 'SecretKey';
  constructor() { }


  public encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.key).toString();
  }


  public decrypt(encryptedValue: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, this.key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return ''; // Or handle the error as needed
    }
  }
}
