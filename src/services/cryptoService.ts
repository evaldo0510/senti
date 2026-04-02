import CryptoJS from 'crypto-js';

export const cryptoService = {
  encrypt(text: string, secret: string): string {
    try {
      if (!secret) return text;
      // Using AES-256-CBC (default in CryptoJS.AES)
      return CryptoJS.AES.encrypt(text, secret).toString();
    } catch (e) {
      console.error("Encryption error:", e);
      return text; // Fallback
    }
  },

  decrypt(encryptedBase64: string, secret: string): string {
    try {
      if (!secret || !encryptedBase64) return encryptedBase64;
      const bytes = CryptoJS.AES.decrypt(encryptedBase64, secret);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error("Decryption returned empty string");
      }
      
      return decrypted;
    } catch (e) {
      console.error("Decryption failed", e);
      return "🔒 Mensagem criptografada (Erro ao descriptografar)";
    }
  }
};
