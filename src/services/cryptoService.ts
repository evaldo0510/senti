export const cryptoService = {
  async getKey(secret: string): Promise<CryptoKey> {
    if (!window.crypto?.subtle) throw new Error("Web Crypto API not available");
    const enc = new TextEncoder();
    // Use secret as base key material
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(secret.padEnd(32, '0').slice(0, 32)),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("senti-e2ee-salt"),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  },

  async encrypt(text: string, secret: string): Promise<string> {
    try {
      if (!window.crypto?.subtle) return text;
      const key = await this.getKey(secret);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const enc = new TextEncoder();
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(text)
      );
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      // Convert to base64
      return btoa(String.fromCharCode(...combined));
    } catch (e) {
      console.error("Encryption error:", e);
      return text; // Fallback
    }
  },

  async decrypt(encryptedBase64: string, secret: string): Promise<string> {
    try {
      if (!window.crypto?.subtle) return encryptedBase64;
      const key = await this.getKey(secret);
      const combined = new Uint8Array(
        atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
      );
      
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
      );
      
      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (e) {
      console.error("Decryption failed", e);
      return "🔒 Mensagem criptografada (Erro ao descriptografar)";
    }
  }
};
